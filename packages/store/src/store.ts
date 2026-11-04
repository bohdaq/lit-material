export type Reducer<S, A> = (state: S, action: A) => S;

export interface Store<S, A> {
  getState(): S;
  dispatch(action: A): A;
  subscribe(listener: () => void): () => void;
  /**
   * Swaps in a whole new state without running the reducer, then notifies subscribers. For tooling such as
   * time travel in `@lit-material/devtools` and hydrating from a snapshot; app code should dispatch actions.
   * Optional so hand-written `Store` implementations stay valid.
   */
  replaceState?(state: S): void;
}

/**
 * A minimal, dependency-free store with Redux's exact four-function shape
 * (`getState`/`dispatch`/`subscribe`, driven by a pure reducer). Framework-agnostic —
 * has no dependency on Lit or the DOM, so it's safe to construct during SSR or in tests.
 */
export function createStore<S, A>(reducer: Reducer<S, A>, preloadedState: S): Store<S, A> & { replaceState(state: S): void } {
  let state = preloadedState;
  const listeners = new Set<() => void>();

  const notify = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    getState(): S {
      return state;
    },
    dispatch(action: A): A {
      state = reducer(state, action);
      notify();
      return action;
    },
    replaceState(next: S): void {
      state = next;
      notify();
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
