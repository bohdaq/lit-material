import type { ReactiveController, ReactiveControllerHost } from "lit";

export interface RippleHost extends ReactiveControllerHost, HTMLElement {}

/**
 * Drives the pressed-state of a ripple surface element via pointer events.
 * The host renders an element (e.g. `<div part="ripple">`) inside its shadow
 * root and registers it with `attach()`; the actual ripple animation is pure
 * CSS keyed off the `data-pressed` attribute this controller toggles, so it
 * stays declarative and testable without canvas/JS-driven animation.
 */
export class RippleController implements ReactiveController {
  private readonly host: RippleHost;
  private surface: HTMLElement | null = null;

  constructor(host: RippleHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.host.addEventListener("pointerdown", this.handlePointerDown);
    this.host.addEventListener("pointerup", this.handlePointerEnd);
    this.host.addEventListener("pointercancel", this.handlePointerEnd);
    this.host.addEventListener("pointerleave", this.handlePointerEnd);
  }

  hostDisconnected(): void {
    this.host.removeEventListener("pointerdown", this.handlePointerDown);
    this.host.removeEventListener("pointerup", this.handlePointerEnd);
    this.host.removeEventListener("pointercancel", this.handlePointerEnd);
    this.host.removeEventListener("pointerleave", this.handlePointerEnd);
  }

  /** Registers the element that should visually respond to press state. */
  attach(surface: HTMLElement): void {
    this.surface = surface;
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || this.isDisabled()) return;
    this.surface?.setAttribute("data-pressed", "");
  };

  private readonly handlePointerEnd = (): void => {
    this.surface?.removeAttribute("data-pressed");
  };

  private isDisabled(): boolean {
    return "disabled" in this.host && Boolean((this.host as unknown as { disabled?: boolean }).disabled);
  }
}
