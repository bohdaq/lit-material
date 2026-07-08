import type { ReactiveController, ReactiveControllerHost } from "lit";

export interface FocusRingHost extends ReactiveControllerHost, HTMLElement {}

/**
 * Tracks keyboard-visible focus on the host so components can render a focus
 * ring only for keyboard/AT users, not mouse clicks.
 *
 * Native `:focus-visible` can't be used directly here: with
 * `shadowRootOptions.delegatesFocus: true` (used so the host's `.focus()`
 * delegates into the real internal control), Chromium/Firefox propagate
 * `:focus` from the delegate target up to the host, but NOT `:focus-visible`
 * — the host only ever matches plain `:focus`. So instead this tracks the
 * last pointer-vs-keyboard interaction directly, the same heuristic
 * `:focus-visible` itself is built on.
 */
export class FocusRingController implements ReactiveController {
  private readonly host: FocusRingHost;
  visible = false;
  private pointerActive = false;

  constructor(host: FocusRingHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.host.addEventListener("pointerdown", this.handlePointerDown);
    this.host.addEventListener("focusin", this.handleFocusIn);
    this.host.addEventListener("focusout", this.handleFocusOut);
  }

  hostDisconnected(): void {
    this.host.removeEventListener("pointerdown", this.handlePointerDown);
    this.host.removeEventListener("focusin", this.handleFocusIn);
    this.host.removeEventListener("focusout", this.handleFocusOut);
  }

  private readonly handlePointerDown = (): void => {
    this.pointerActive = true;
    // A pointer press dismisses an existing ring immediately, even if the
    // host was already focused (and so won't get a fresh `focusin`).
    if (this.visible) {
      this.visible = false;
      this.host.requestUpdate();
    }
  };

  private readonly handleFocusIn = (): void => {
    this.visible = !this.pointerActive;
    this.pointerActive = false;
    this.host.requestUpdate();
  };

  private readonly handleFocusOut = (): void => {
    this.visible = false;
    this.pointerActive = false;
    this.host.requestUpdate();
  };
}
