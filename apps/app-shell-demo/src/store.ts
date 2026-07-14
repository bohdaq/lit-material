import { createStore } from "@lit-material/store";

export interface CounterState {
  count: number;
}

export type CounterAction = { type: "increment" } | { type: "decrement" } | { type: "reset" };

function reducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: 0 };
  }
}

// One module-level store instance, shared by every page — this is what
// proves state survives client-side navigation between routes.
export const counterStore = createStore(reducer, { count: 0 });
