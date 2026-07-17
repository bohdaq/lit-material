import type { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * A reactive controller that tracks a native `<form>`'s aggregate validity
 * for a Lit host — e.g. to reactively enable/disable a submit button as the
 * user types, instead of only finding out on submit.
 *
 * Deliberately *not* a validity-aggregation engine: `form.checkValidity()`/
 * `form.reportValidity()` already aggregate across every participant —
 * native inputs and any form-associated custom element alike (that's the
 * entire point of `ElementInternals`/`formAssociated`, which every
 * form-associated `lit-material` component — Checkbox, Radio, Switch,
 * Slider, Text Field — already implements correctly). What's actually
 * missing is *reactivity*: native form validity isn't observable without
 * manually wiring up your own event listeners, which is what this
 * controller does, calling `host.requestUpdate()` only when the aggregate
 * `valid` result actually changes.
 *
 * Listens for `input`/`change` (typing-driven updates, deferred to a
 * microtask so a form-associated custom element's own `ElementInternals`
 * update — which typically happens in its `updated()`, i.e. *after* the
 * `change` event it just dispatched — has settled before the aggregate
 * check runs) and the capturing-phase `invalid` event (fired once per
 * invalid field, dispatched *by* `checkValidity()`/`reportValidity()`
 * itself — including this controller's own calls to them — or a submit
 * attempt; it never bubbles, so this is only observable via a capture
 * listener on an ancestor, not a normal bubbling one).
 *
 * The `invalid` handler deliberately does not call `checkValidity()`/
 * `reportValidity()` again — since those two methods are themselves what
 * dispatch `invalid` in the first place, doing so is circular and hangs
 * the page in an infinite loop for as long as any field stays invalid.
 * Seeing `invalid` fire at all already answers the question (the form
 * isn't fully valid), so the handler just records that directly.
 */
export class FormController implements ReactiveController {
  valid = true;

  private readonly host: ReactiveControllerHost;
  private readonly getForm: () => HTMLFormElement | null | undefined;
  private form?: HTMLFormElement;

  constructor(host: ReactiveControllerHost, getForm: () => HTMLFormElement | null | undefined) {
    this.host = host;
    this.getForm = getForm;
    host.addController(this);
  }

  hostConnected(): void {
    this.attach();
  }

  hostUpdated(): void {
    // hostConnected() fires as part of connectedCallback(), *before* the
    // host's first render — if `getForm()` reads a `@query()`-resolved
    // element, it's still undefined at that point, so attach() silently
    // no-ops there. hostUpdated() runs after every render (including the
    // first), so this is what actually attaches in that common case;
    // attach() no-ops on every call after the first since the form
    // reference doesn't change without an explicit refresh().
    this.attach();
  }

  hostDisconnected(): void {
    this.detach();
  }

  /** Re-resolves `getForm()` and re-attaches — call if the form reference could have changed. */
  refresh(): void {
    this.detach();
    this.attach();
  }

  /** Re-checks validity without showing native validation UI. Same boolean `form.checkValidity()` returns. */
  checkValidity(): boolean {
    const result = this.form?.checkValidity() ?? true;
    this.setValid(result);
    return result;
  }

  /** Re-checks validity and shows native validation UI for the first invalid field. */
  reportValidity(): boolean {
    const result = this.form?.reportValidity() ?? true;
    this.setValid(result);
    return result;
  }

  private attach(): void {
    const form = this.getForm();
    if (!form || form === this.form) return;
    this.form = form;
    form.addEventListener("input", this.handleChange);
    form.addEventListener("change", this.handleChange);
    form.addEventListener("invalid", this.handleInvalid, true);
    // Deferred a microtask for the same reason handleChange is: this typically runs from
    // hostUpdated(), synchronously right after the host's own first render — but a form-associated
    // child (e.g. a required, still-empty Text Field) that *just* connected as part of that same
    // render hasn't run its own first update yet, so its ElementInternals validity is still unset
    // (defaults to valid). Queuing this lets any such pending child update flush first, so the
    // very first check already reflects real validity instead of only catching up on the next
    // input/change event.
    queueMicrotask(() => this.checkValidity());
  }

  private detach(): void {
    if (!this.form) return;
    this.form.removeEventListener("input", this.handleChange);
    this.form.removeEventListener("change", this.handleChange);
    this.form.removeEventListener("invalid", this.handleInvalid, true);
    this.form = undefined;
  }

  private readonly handleChange = (): void => {
    queueMicrotask(() => this.checkValidity());
  };

  private readonly handleInvalid = (): void => {
    this.setValid(false);
  };

  private setValid(next: boolean): void {
    if (next === this.valid) return;
    this.valid = next;
    this.host.requestUpdate();
  }
}
