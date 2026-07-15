// One module-level store instance, shared across the app. See
// @lit-material/store's README for the full API.
import { createStore } from "@lit-material/store";

export interface AppState {
  count: number;
}

export type AppAction = { type: "increment" } | { type: "decrement" };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
  }
}

export const appStore = createStore(reducer, { count: 0 });
