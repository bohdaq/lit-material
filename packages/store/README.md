# @lit-material/store

A tiny, dependency-free state store for building whole applications with
[lit-material](https://github.com/bohdaq/lit-material) — not just individual components. `createStore` has
Redux's exact four-function shape (`getState`/`dispatch`/`subscribe`, driven by a pure reducer) and works
anywhere, including during SSR, since it has no dependency on the DOM or on Lit. `StoreController` is the Lit
[reactive controller](https://lit.dev/docs/composition/controllers/) that subscribes a component to a store
and calls `requestUpdate()` only when the selected slice of state actually changes.

There's no `screenshot.png` in this README — unlike lit-material's UI components, `@lit-material/store` has no
visual output of its own to capture, following the same precedent as
[`@lit-material/core`](https://github.com/bohdaq/lit-material/tree/main/packages/core) and
[`@lit-material/tokens`](https://github.com/bohdaq/lit-material/tree/main/packages/tokens).

## Install

```sh
npm install @lit-material/store
```

## Usage

```ts
import { createStore, StoreController } from "@lit-material/store";
import { LitElement, html } from "lit";

interface CounterState {
  count: number;
}

type CounterAction = { type: "increment" } | { type: "decrement" };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
  }
}

// One store instance, shared by however many components need it — a module-level
// singleton, or created once in your app's entry point and passed down (e.g. via
// @lit-material/core's theme context pattern, or plain constructor/property passing).
export const counterStore = createStore(counterReducer, { count: 0 });

class MyCounter extends LitElement {
  // Select the whole state...
  private readonly store = new StoreController(this, counterStore);

  // ...or a slice, so this host only re-renders when that slice changes:
  // private readonly count = new StoreController(this, counterStore, (state) => state.count);

  override render() {
    return html`
      <p>${this.store.value.count}</p>
      <button @click=${() => counterStore.dispatch({ type: "increment" })}>+</button>
    `;
  }
}
```

## API

### `createStore(reducer, preloadedState)`

Returns a `Store<S, A>`:

| Method                       | Description                                                              |
| ----------------------------- | -------------------------------------------------------------------------- |
| `getState(): S`               | Current state.                                                             |
| `dispatch(action: A): A`      | Runs the reducer, updates state, notifies subscribers, returns the action. |
| `subscribe(listener): () => void` | Registers a listener called after every dispatch; returns an unsubscribe function. |

### `new StoreController(host, store, selector?)`

| Property/method | Description                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `.value`          | The currently selected state (whole state if no `selector` given).                                |
| `selector`         | Optional `(state: S) => V`. The host only re-renders when the *selected* value changes, not on every dispatch. |

Subscribes in `hostConnected()` and unsubscribes in `hostDisconnected()`, the same reactive-controller
lifecycle `RippleController`/`FocusRingController` in `@lit-material/core` use.

## License

MIT
