import { getRegistry, pushBounded, type DevtoolsStore, type StoreHistoryEntry, type StoreRecord } from "./registry.js";

export interface ConnectStoreOptions {
  /** Shown in the panel's store picker and the Redux DevTools instance list. Default `"store"`. */
  name?: string;
  /** How many entries (the initial state, then actions) to keep. Default 50. */
  maxAge?: number;
}

/** A message the Redux DevTools extension sends to a connected instance. */
export interface ReduxDevtoolsMessage {
  type: string;
  payload?: { type?: string; actionId?: number } | string;
  /** The target state, JSON-encoded, for `JUMP_TO_STATE`/`JUMP_TO_ACTION`/`ROLLBACK`. */
  state?: string;
}

/** The part of `window.__REDUX_DEVTOOLS_EXTENSION__.connect()`'s result this package uses. */
export interface ReduxDevtoolsConnection {
  init(state: unknown): void;
  send(action: unknown, state: unknown): void;
  subscribe(listener: (message: ReduxDevtoolsMessage) => void): (() => void) | void;
  unsubscribe?(): void;
}

export interface ReduxDevtoolsExtension {
  connect(options: { name?: string; maxAge?: number }): ReduxDevtoolsConnection;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevtoolsExtension;
  }
}

export const INIT_ACTION = { type: "@@INIT" } as const;

const noop = (): void => {};

/**
 * The extension (like the panel's log) wants `{ type, ... }` objects. Actions that aren't — a bare string,
 * a symbol, an object without a `type` — are wrapped so they still show up under a readable name.
 */
export function toLoggedAction(action: unknown): { type: string; [key: string]: unknown } {
  if (action !== null && typeof action === "object") {
    const type = (action as { type?: unknown }).type;
    if (typeof type === "string") return action as { type: string };
    if (type !== undefined) return { ...(action as object), type: String(type) };
    return { type: "(untyped action)", payload: action };
  }
  if (typeof action === "function") return { type: action.name ? `[function ${action.name}]` : "[function]" };
  return { type: String(action) };
}

function parseState(json: string | undefined): { ok: true; state: unknown } | { ok: false } {
  if (typeof json !== "string") return { ok: false };
  try {
    return { ok: true, state: JSON.parse(json) as unknown };
  } catch {
    return { ok: false };
  }
}

/**
 * Records a store's actions and states for the `<lit-material-devtools>` panel, and connects it to the
 * Redux DevTools browser extension when that's installed (actions, state, time travel, reset, commit).
 *
 * Wraps `store.dispatch` in place; the returned function puts the original back and forgets the store.
 * Connecting a second store under a name in use replaces the first (handy with hot module reloading).
 * Does nothing on the server.
 */
export function connectStore<S, A>(store: DevtoolsStore<S, A>, options: ConnectStoreOptions = {}): () => void {
  const registry = getRegistry();
  if (!registry) return noop;

  const name = options.name ?? "store";
  const maxAge = Math.max(1, Math.floor(options.maxAge ?? 50));

  // One connection per store and per name.
  for (const existing of [...registry.stores.values()]) {
    if (existing.store === store || existing.name === name) existing.disconnect();
  }

  const anyStore = store as DevtoolsStore;
  const original = anyStore.dispatch;
  const history: StoreHistoryEntry[] = [];
  let dropped = 0; // entries pushed out of the front of `history`, to line up with the extension's action ids
  let liveState: unknown = store.getState();
  let applying = false;
  let connected = true;

  const record = (entry: StoreHistoryEntry): void => {
    const before = history.length;
    pushBounded(history, entry, maxAge);
    dropped += before + 1 - history.length;
  };
  const restart = (state: unknown): void => {
    history.length = 0;
    dropped = 0;
    history.push({ action: INIT_ACTION, state, time: Date.now() });
  };
  restart(liveState);

  const apply = (state: unknown): boolean => {
    if (!anyStore.replaceState) return false;
    applying = true;
    try {
      anyStore.replaceState(state);
    } finally {
      applying = false;
    }
    return true;
  };

  const handle = {
    name,
    store: anyStore,
    maxAge,
    history,
    travelling: false,
    cursor: null as number | null,
    get canTravel() {
      return typeof anyStore.replaceState === "function";
    },
    jumpTo(index: number) {
      const entry = history[index];
      if (!entry || !apply(entry.state)) return;
      handle.travelling = true;
      handle.cursor = index;
      registry.notify();
    },
    backToLive() {
      if (!handle.travelling) return;
      apply(liveState);
      handle.travelling = false;
      handle.cursor = null;
      registry.notify();
    },
    disconnect: noop,
  };

  // Any change we didn't make ourselves — a dispatch, or the app calling replaceState — is the new live state.
  const unsubscribeStore = store.subscribe(() => {
    if (applying) return;
    liveState = store.getState();
    handle.travelling = false;
    handle.cursor = null;
    registry.notify();
  });

  // Redux DevTools extension.
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__;
  let connection: ReduxDevtoolsConnection | undefined;
  let unsubscribeExtension: (() => void) | void = undefined;
  if (extension && typeof extension.connect === "function") {
    connection = extension.connect({ name, maxAge });
    connection.init(liveState);
    unsubscribeExtension = connection.subscribe((message) => {
      if (!connected || message.type !== "DISPATCH" || typeof message.payload !== "object") return;
      switch (message.payload.type) {
        case "JUMP_TO_STATE":
        case "JUMP_TO_ACTION": {
          const parsed = parseState(message.state);
          if (!parsed.ok || !apply(parsed.state)) return;
          const id = message.payload.actionId;
          const index = typeof id === "number" ? id - dropped : -1;
          // Jumping to the newest entry is the extension's way back to the present.
          if (index === history.length - 1) {
            handle.travelling = false;
            handle.cursor = null;
          } else {
            handle.travelling = true;
            handle.cursor = index >= 0 && index < history.length ? index : null;
          }
          registry.notify();
          return;
        }
        case "RESET": {
          // Back to the state the store had when it was connected, as a fresh history.
          const initial = history[0]?.action === INIT_ACTION && dropped === 0 ? history[0].state : liveState;
          if (!apply(initial)) return;
          liveState = initial;
          restart(initial);
          handle.travelling = false;
          handle.cursor = null;
          connection?.init(initial);
          registry.notify();
          return;
        }
        case "COMMIT": {
          // Keep the current state, drop the history before it.
          liveState = store.getState();
          restart(liveState);
          handle.travelling = false;
          handle.cursor = null;
          connection?.init(liveState);
          registry.notify();
          return;
        }
        case "ROLLBACK": {
          const parsed = parseState(message.state);
          if (!parsed.ok || !apply(parsed.state)) return;
          liveState = parsed.state;
          restart(liveState);
          handle.travelling = false;
          handle.cursor = null;
          connection?.init(liveState);
          registry.notify();
          return;
        }
      }
    });
  }

  const wrapped = function (this: unknown, action: unknown): unknown {
    const result = original.call(this ?? anyStore, action);
    if (connected) {
      const state = store.getState();
      record({ action, state, time: Date.now() });
      connection?.send(toLoggedAction(action), state);
      registry.notify();
    }
    return result;
  };
  anyStore.dispatch = wrapped;

  const disconnect = (): void => {
    if (!connected) return;
    connected = false;
    // If something wrapped dispatch after us, leave its wrapper in place: ours now just passes through.
    if (anyStore.dispatch === wrapped) anyStore.dispatch = original;
    unsubscribeStore();
    if (typeof unsubscribeExtension === "function") unsubscribeExtension();
    else connection?.unsubscribe?.();
    if (registry.stores.get(name) === handle) registry.stores.delete(name);
    registry.notify();
  };
  handle.disconnect = disconnect;

  registry.stores.set(name, handle satisfies StoreRecord);
  registry.notify();
  return disconnect;
}
