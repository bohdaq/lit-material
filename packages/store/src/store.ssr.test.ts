import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ReactiveControllerHost } from "lit";
import { createStore } from "./store.js";
import { StoreController } from "./store-controller.js";

interface CounterState {
  count: number;
}

type CounterAction = { type: "increment" } | { type: "decrement" } | { type: "touch" };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "touch":
      // Returns a new object reference with the same count — exercises the
      // selector's value-equality bail-out, not just reference equality.
      return { ...state };
  }
}

function createFakeHost(): ReactiveControllerHost & { requestUpdateCount: number } {
  const host = {
    requestUpdateCount: 0,
    addController() {},
    removeController() {},
    requestUpdate() {
      host.requestUpdateCount++;
    },
    updateComplete: Promise.resolve(true),
  };
  return host;
}

describe("createStore (no browser)", () => {
  it("dispatches actions through the reducer and notifies subscribers", () => {
    const store = createStore(counterReducer, { count: 0 });
    const seen: number[] = [];
    const unsubscribe = store.subscribe(() => seen.push(store.getState().count));

    store.dispatch({ type: "increment" });
    store.dispatch({ type: "increment" });
    store.dispatch({ type: "decrement" });

    assert.equal(store.getState().count, 1);
    assert.deepEqual(seen, [1, 2, 1]);

    unsubscribe();
    store.dispatch({ type: "increment" });
    assert.deepEqual(seen, [1, 2, 1]);
  });
});

describe("store.replaceState (no browser)", () => {
  it("swaps in the given state without running the reducer and notifies subscribers", () => {
    let reducerCalls = 0;
    const store = createStore((state: CounterState, action: CounterAction) => {
      reducerCalls++;
      return counterReducer(state, action);
    }, { count: 0 });
    let notified = 0;
    store.subscribe(() => notified++);

    const snapshot = { count: 42 };
    store.replaceState!(snapshot);

    assert.equal(store.getState(), snapshot);
    assert.equal(notified, 1);
    assert.equal(reducerCalls, 0);

    // Later dispatches reduce from the replaced state.
    store.dispatch({ type: "increment" });
    assert.equal(store.getState().count, 43);
  });

  it("updates a StoreController host like a dispatch would", () => {
    const store = createStore(counterReducer, { count: 0 });
    const host = createFakeHost();
    const controller = new StoreController(host, store, (state) => state.count);
    controller.hostConnected();

    store.replaceState!({ count: 7 });
    assert.equal(host.requestUpdateCount, 1);
    assert.equal(controller.value, 7);
  });
});

describe("StoreController (no browser)", () => {
  it("constructs against a plain host object, without any DOM", () => {
    const store = createStore(counterReducer, { count: 0 });
    const host = createFakeHost();
    assert.doesNotThrow(() => new StoreController(host, store));
  });

  it("subscribes on hostConnected and unsubscribes on hostDisconnected", () => {
    const store = createStore(counterReducer, { count: 0 });
    const host = createFakeHost();
    const controller = new StoreController(host, store);

    controller.hostConnected();
    store.dispatch({ type: "increment" });
    assert.equal(host.requestUpdateCount, 1);
    assert.equal(controller.value.count, 1);

    controller.hostDisconnected();
    store.dispatch({ type: "increment" });
    assert.equal(host.requestUpdateCount, 1);
  });

  it("only requests an update when the selected slice actually changes", () => {
    const store = createStore(counterReducer, { count: 0 });
    const host = createFakeHost();
    const controller = new StoreController(host, store, (state) => state.count);
    controller.hostConnected();

    store.dispatch({ type: "increment" });
    assert.equal(host.requestUpdateCount, 1);
    assert.equal(controller.value, 1);

    // A new state object with the same selected value must not trigger a
    // second update — the bail-out compares the selected slice, not the
    // whole state reference.
    store.dispatch({ type: "touch" });
    assert.equal(host.requestUpdateCount, 1);
    assert.equal(controller.value, 1);
  });
});
