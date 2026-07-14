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
