/**
 * The shared devtools registry, kept on `globalThis.__LIT_MATERIAL_DEVTOOLS__` so every copy of this package
 * on a page (and the `<lit-material-devtools>` panel) sees the same stores and router log. Everything the panel
 * needs to act on — time travel included — lives on the records themselves, not in module state.
 */

/** Anything with the store's shape: `createStore()` from `@lit-material/store`, or a Redux store. */
export interface DevtoolsStore<S = unknown, A = unknown> {
  getState(): S;
  dispatch(action: A): unknown;
  subscribe(listener: () => void): () => void;
  /** Needed for time travel; without it the store is recorded but can't jump. */
  replaceState?(state: S): void;
}

/** One recorded dispatch: the action and the state the reducer returned for it. */
export interface StoreHistoryEntry {
  action: unknown;
  state: unknown;
  /** `Date.now()` when it was dispatched. */
  time: number;
}

export interface StoreRecord {
  readonly name: string;
  readonly store: DevtoolsStore;
  readonly maxAge: number;
  /** Oldest first: the `@@INIT` entry, then each dispatch, at most `maxAge` entries. */
  readonly history: StoreHistoryEntry[];
  /** `true` while showing a past state (from the panel or the Redux DevTools extension). */
  readonly travelling: boolean;
  /** The `history` index being shown while travelling, when known (the extension may jump to entries this log dropped). */
  readonly cursor: number | null;
  /** Whether the store can time travel, i.e. has `replaceState`. */
  readonly canTravel: boolean;
  /** Shows the state after `history[index]`. */
  jumpTo(index: number): void;
  /** Returns to the latest state after a jump. */
  backToLive(): void;
  /** Same as the function `connectStore()` returned. */
  disconnect(): void;
}

export type RouteChangeKind = "push" | "replace" | "pop";

/** One navigation, as `location` read right after it. */
export interface RouteLogEntry {
  path: string;
  search: string;
  hash: string;
  time: number;
  kind: RouteChangeKind;
}

export interface DevtoolsRegistry {
  readonly stores: Map<string, StoreRecord>;
  /** Oldest first, at most `routerMaxAge` entries. */
  readonly router: RouteLogEntry[];
  routerMaxAge: number;
  /** Called after any store dispatch, state change, time-travel step or navigation. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
  notify(): void;
}

export const REGISTRY_KEY = "__LIT_MATERIAL_DEVTOOLS__";

declare global {
  var __LIT_MATERIAL_DEVTOOLS__: DevtoolsRegistry | undefined;
}

/** `true` where there's a page to inspect: in the browser, not during server rendering. */
export function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function createRegistry(): DevtoolsRegistry {
  const listeners = new Set<() => void>();
  return {
    stores: new Map(),
    router: [],
    routerMaxAge: 50,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    notify() {
      for (const listener of [...listeners]) {
        try {
          listener();
        } catch (error) {
          // A broken panel must never break the app's own dispatches.
          console.error(error);
        }
      }
    },
  };
}

/**
 * The page's devtools registry, created on first use. `undefined` on the server, where there's nothing to
 * inspect — so importing and calling this package during SSR costs nothing.
 */
export function getRegistry(): DevtoolsRegistry | undefined {
  if (!hasWindow()) return undefined;
  return (globalThis[REGISTRY_KEY] ??= createRegistry());
}

/** Appends to a ring buffer, dropping the oldest entries past `max`. */
export function pushBounded<T>(list: T[], entry: T, max: number): void {
  list.push(entry);
  if (list.length > max) list.splice(0, list.length - Math.max(1, max));
}
