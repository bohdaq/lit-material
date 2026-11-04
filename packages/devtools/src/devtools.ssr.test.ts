import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { createStore } from "@lit-material/store";
import {
  connectRouter,
  connectStore,
  getRegistry,
  REGISTRY_KEY,
  type ReduxDevtoolsConnection,
  type ReduxDevtoolsMessage,
} from "./index.js";

interface CounterState {
  count: number;
}
type CounterAction = { type: "increment" } | { type: "add"; by: number };

const reducer = (state: CounterState, action: CounterAction): CounterState =>
  action.type === "increment" ? { count: state.count + 1 } : { count: state.count + action.by };

interface FakeConnection extends ReduxDevtoolsConnection {
  name: string | undefined;
  maxAge: number | undefined;
  inits: unknown[];
  sent: { action: unknown; state: unknown }[];
  listener: ((message: ReduxDevtoolsMessage) => void) | undefined;
  unsubscribed: boolean;
  emit(message: ReduxDevtoolsMessage): void;
}

function installFakeExtension(): FakeConnection[] {
  const connections: FakeConnection[] = [];
  (globalThis as Record<string, unknown>).__REDUX_DEVTOOLS_EXTENSION__ = {
    connect(options: { name?: string; maxAge?: number }) {
      const connection: FakeConnection = {
        name: options.name,
        maxAge: options.maxAge,
        inits: [],
        sent: [],
        listener: undefined,
        unsubscribed: false,
        init(state) {
          connection.inits.push(state);
        },
        send(action, state) {
          connection.sent.push({ action, state });
        },
        subscribe(listener) {
          connection.listener = listener;
          return () => {
            connection.unsubscribed = true;
          };
        },
        emit(message) {
          connection.listener?.(message);
        },
      };
      connections.push(connection);
      return connection;
    },
  };
  return connections;
}

const g = globalThis as Record<string, unknown>;

describe("on the server (no window)", () => {
  it("does nothing and creates no registry", () => {
    assert.equal(typeof window, "undefined");
    const store = createStore(reducer, { count: 0 });
    const dispatch = store.dispatch;
    const disconnect = connectStore(store);
    assert.equal(store.dispatch, dispatch);
    assert.equal(getRegistry(), undefined);
    assert.equal(g[REGISTRY_KEY], undefined);
    disconnect();
    connectRouter()();
  });
});

describe("connectStore", () => {
  beforeEach(() => {
    // A stand-in for the browser's window: the API only needs it to exist.
    g.window = globalThis;
  });

  afterEach(() => {
    delete g.window;
    delete g.__REDUX_DEVTOOLS_EXTENSION__;
    delete g[REGISTRY_KEY];
  });

  it("records the initial state and each dispatch into the registry", () => {
    const store = createStore(reducer, { count: 0 });
    const disconnect = connectStore(store, { name: "counter" });
    store.dispatch({ type: "increment" });
    store.dispatch({ type: "add", by: 5 });

    const record = getRegistry()!.stores.get("counter")!;
    assert.deepEqual(
      record.history.map((e) => [e.action, e.state]),
      [
        [{ type: "@@INIT" }, { count: 0 }],
        [{ type: "increment" }, { count: 1 }],
        [{ type: "add", by: 5 }, { count: 6 }],
      ],
    );
    assert.ok(record.history.every((e) => typeof e.time === "number"));
    disconnect();
  });

  it("keeps at most maxAge entries, dropping the oldest", () => {
    const store = createStore(reducer, { count: 0 });
    connectStore(store, { maxAge: 3 });
    for (let i = 0; i < 5; i++) store.dispatch({ type: "increment" });

    const history = getRegistry()!.stores.get("store")!.history;
    assert.equal(history.length, 3);
    assert.deepEqual(
      history.map((e) => (e.state as CounterState).count),
      [3, 4, 5],
    );
  });

  it("notifies registry subscribers on dispatch", () => {
    const store = createStore(reducer, { count: 0 });
    connectStore(store);
    let calls = 0;
    getRegistry()!.subscribe(() => calls++);
    store.dispatch({ type: "increment" });
    assert.ok(calls >= 1);
  });

  it("restores the original dispatch and forgets the store on disconnect", () => {
    const store = createStore(reducer, { count: 0 });
    const original = store.dispatch;
    const disconnect = connectStore(store);
    assert.notEqual(store.dispatch, original);

    disconnect();
    assert.equal(store.dispatch, original);
    assert.equal(getRegistry()!.stores.size, 0);
    store.dispatch({ type: "increment" });
    assert.equal(store.getState().count, 1);
  });

  it("replaces a connection with the same name (hot reload)", () => {
    const first = createStore(reducer, { count: 0 });
    const firstDispatch = first.dispatch;
    connectStore(first, { name: "app" });
    const second = createStore(reducer, { count: 10 });
    connectStore(second, { name: "app" });

    assert.equal(first.dispatch, firstDispatch);
    assert.equal(getRegistry()!.stores.get("app")!.store, second);
  });

  it("time travels from the registry record and returns to live", () => {
    const store = createStore(reducer, { count: 0 });
    connectStore(store);
    store.dispatch({ type: "increment" });
    store.dispatch({ type: "increment" });
    const record = getRegistry()!.stores.get("store")!;

    record.jumpTo(1);
    assert.deepEqual(store.getState(), { count: 1 });
    assert.equal(record.travelling, true);
    assert.equal(record.cursor, 1);
    assert.equal(record.history.length, 3, "jumping doesn't record an entry");

    record.backToLive();
    assert.deepEqual(store.getState(), { count: 2 });
    assert.equal(record.travelling, false);
  });

  it("can't time travel a store without replaceState, but still records it", () => {
    const inner = createStore(reducer, { count: 0 });
    const store = { getState: inner.getState, dispatch: inner.dispatch, subscribe: inner.subscribe };
    connectStore(store);
    store.dispatch({ type: "increment" });
    const record = getRegistry()!.stores.get("store")!;
    assert.equal(record.canTravel, false);
    record.jumpTo(0);
    assert.deepEqual(store.getState(), { count: 1 });
    assert.equal(record.travelling, false);
  });

  describe("with the Redux DevTools extension", () => {
    it("connects with the name, inits with the state and sends each action", () => {
      const connections = installFakeExtension();
      const store = createStore(reducer, { count: 0 });
      connectStore(store, { name: "counter", maxAge: 20 });
      store.dispatch({ type: "increment" });

      assert.equal(connections.length, 1);
      const [ext] = connections;
      assert.equal(ext!.name, "counter");
      assert.equal(ext!.maxAge, 20);
      assert.deepEqual(ext!.inits, [{ count: 0 }]);
      assert.deepEqual(ext!.sent, [{ action: { type: "increment" }, state: { count: 1 } }]);
    });

    it("sends actions that aren't { type } objects under a readable type", () => {
      const connections = installFakeExtension();
      const store = createStore((s: number) => s + 1, 0);
      connectStore(store as never);
      (store.dispatch as (a: unknown) => unknown)("bump");
      (store.dispatch as (a: unknown) => unknown)({ amount: 2 });
      assert.deepEqual(
        connections[0]!.sent.map((s) => s.action),
        [{ type: "bump" }, { type: "(untyped action)", payload: { amount: 2 } }],
      );
    });

    it("JUMP_TO_STATE and JUMP_TO_ACTION replace the store's state", () => {
      const [ext] = [installFakeExtension()];
      const store = createStore(reducer, { count: 0 });
      connectStore(store);
      store.dispatch({ type: "increment" });
      store.dispatch({ type: "increment" });
      const record = getRegistry()!.stores.get("store")!;
      let notified = 0;
      store.subscribe(() => notified++);

      ext[0]!.emit({ type: "DISPATCH", payload: { type: "JUMP_TO_STATE", actionId: 1 }, state: JSON.stringify({ count: 1 }) });
      assert.deepEqual(store.getState(), { count: 1 });
      assert.equal(notified, 1);
      assert.equal(record.travelling, true);
      assert.equal(record.cursor, 1);
      assert.equal(ext[0]!.sent.length, 2, "a jump isn't sent back as an action");

      ext[0]!.emit({ type: "DISPATCH", payload: { type: "JUMP_TO_ACTION", actionId: 0 }, state: JSON.stringify({ count: 0 }) });
      assert.deepEqual(store.getState(), { count: 0 });

      // Jumping to the newest action is back to live.
      ext[0]!.emit({ type: "DISPATCH", payload: { type: "JUMP_TO_STATE", actionId: 2 }, state: JSON.stringify({ count: 2 }) });
      assert.deepEqual(store.getState(), { count: 2 });
      assert.equal(record.travelling, false);
    });

    it("dispatching after a jump continues from the shown state", () => {
      const connections = installFakeExtension();
      const store = createStore(reducer, { count: 0 });
      connectStore(store);
      store.dispatch({ type: "increment" });
      store.dispatch({ type: "increment" });
      connections[0]!.emit({ type: "DISPATCH", payload: { type: "JUMP_TO_STATE", actionId: 0 }, state: "{\"count\":0}" });
      store.dispatch({ type: "add", by: 10 });
      assert.deepEqual(store.getState(), { count: 10 });
      assert.equal(getRegistry()!.stores.get("store")!.travelling, false);
    });

    it("ignores malformed jumps and non-DISPATCH messages", () => {
      const connections = installFakeExtension();
      const store = createStore(reducer, { count: 3 });
      connectStore(store);
      connections[0]!.emit({ type: "DISPATCH", payload: { type: "JUMP_TO_STATE" }, state: "{not json" });
      connections[0]!.emit({ type: "START" });
      connections[0]!.emit({ type: "ACTION", payload: "{\"type\":\"increment\"}" });
      assert.deepEqual(store.getState(), { count: 3 });
    });

    it("RESET goes back to the connected state with a fresh history", () => {
      const connections = installFakeExtension();
      const store = createStore(reducer, { count: 0 });
      connectStore(store);
      store.dispatch({ type: "increment" });
      store.dispatch({ type: "increment" });
      connections[0]!.emit({ type: "DISPATCH", payload: { type: "RESET" } });

      assert.deepEqual(store.getState(), { count: 0 });
      const record = getRegistry()!.stores.get("store")!;
      assert.equal(record.history.length, 1);
      assert.deepEqual(connections[0]!.inits, [{ count: 0 }, { count: 0 }]);
    });

    it("COMMIT keeps the current state as the new starting point", () => {
      const connections = installFakeExtension();
      const store = createStore(reducer, { count: 0 });
      connectStore(store);
      store.dispatch({ type: "increment" });
      connections[0]!.emit({ type: "DISPATCH", payload: { type: "COMMIT" } });

      assert.deepEqual(store.getState(), { count: 1 });
      const record = getRegistry()!.stores.get("store")!;
      assert.deepEqual(
        record.history.map((e) => e.state),
        [{ count: 1 }],
      );
      assert.deepEqual(connections[0]!.inits.at(-1), { count: 1 });
    });

    it("unsubscribes from the extension and stops sending on disconnect", () => {
      const connections = installFakeExtension();
      const store = createStore(reducer, { count: 0 });
      const disconnect = connectStore(store);
      disconnect();
      store.dispatch({ type: "increment" });
      assert.equal(connections[0]!.unsubscribed, true);
      assert.equal(connections[0]!.sent.length, 0);
      connections[0]!.emit({ type: "DISPATCH", payload: { type: "JUMP_TO_STATE" }, state: "{\"count\":99}" });
      assert.deepEqual(store.getState(), { count: 1 });
    });
  });
});
