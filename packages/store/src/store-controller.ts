import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { Store } from "./store.js";

/**
 * Subscribes a Lit host to a `Store`, requesting an update only when the
 * selected slice actually changes (reference equality) — so a component that
 * selects one field doesn't re-render on unrelated state changes. Same
 * reactive-controller shape as `RippleController`/`FocusRingController` in
 * `@lit-material/core`.
 */
export class StoreController<S, A, V = S> implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly store: Store<S, A>;
  private readonly selector: (state: S) => V;
  private unsubscribe: (() => void) | null = null;
  private selected: V;

  constructor(host: ReactiveControllerHost, store: Store<S, A>, selector?: (state: S) => V) {
    this.host = host;
    this.store = store;
    this.selector = selector ?? ((state: S) => state as unknown as V);
    this.selected = this.selector(store.getState());
    host.addController(this);
  }

  get value(): V {
    return this.selected;
  }

  hostConnected(): void {
    this.selected = this.selector(this.store.getState());
    this.unsubscribe = this.store.subscribe(this.handleChange);
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private readonly handleChange = (): void => {
    const next = this.selector(this.store.getState());
    if (next === this.selected) return;
    this.selected = next;
    this.host.requestUpdate();
  };
}
