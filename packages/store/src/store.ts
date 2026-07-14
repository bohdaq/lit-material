export type Reducer<S, A> = (state: S, action: A) => S;

export interface Store<S, A> {
  getState(): S;
  dispatch(action: A): A;
  subscribe(listener: () => void): () => void;
}

/**
 * A minimal, dependency-free store with Redux's exact four-function shape
 * (`getState`/`dispatch`/`subscribe`, driven by a pure reducer). Framework-agnostic —
 * has no dependency on Lit or the DOM, so it's safe to construct during SSR or in tests.
 */
export function createStore<S, A>(reducer: Reducer<S, A>, preloadedState: S): Store<S, A> {
  let state = preloadedState;
  const listeners = new Set<() => void>();

  return {
    getState(): S {
      return state;
    },
    dispatch(action: A): A {
      state = reducer(state, action);
      for (const listener of listeners) {
        listener();
      }
      return action;
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
