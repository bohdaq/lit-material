import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";

export type SplitOrientation = "horizontal" | "vertical";

let nextId = 0;

/**
 * Two panes with a divider between them that you drag, or move from the
 * keyboard: request and response, editor and preview, list and detail.
 *
 * `position` is the start pane's share in percent, kept between `min` and
 * `max`. The divider is a WAI-ARIA window splitter: arrow keys move it
 * (Shift for bigger steps), Home/End go to `min`/`max`, and Enter collapses
 * the start pane to `min` and restores it. `orientation="vertical"` stacks
 * the panes.
 *
 * @element lit-material-split-panel
 *
 * @slot start - The first pane (left, or top when vertical).
 * @slot end - The second pane.
 *
 * @fires change - When the divider has moved (after a drag or a key press); `detail: { position }`.
 *
 * @csspart divider - The divider.
 *
 * @cssprop --lit-material-split-panel-divider-size - Divider thickness (default `8px`; the visible line is 1px).
 */
@customElement("lit-material-split-panel")
export class LitMaterialSplitPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      min-height: 0;
    }
    .split {
      --_divider: var(--lit-material-split-panel-divider-size, 8px);
      display: grid;
      height: 100%;
      grid-template-columns: minmax(0, var(--_start)) var(--_divider) minmax(0, var(--_end));
      grid-template-rows: minmax(0, 1fr);
    }
    :host([orientation="vertical"]) .split {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: minmax(0, var(--_start)) var(--_divider) minmax(0, var(--_end));
    }
    :host([hidden]) {
      display: none;
    }
    .pane {
      min-width: 0;
      min-height: 0;
      overflow: auto;
    }
    .divider {
      position: relative;
      cursor: col-resize;
      touch-action: none;
      outline: none;
    }
    :host([orientation="vertical"]) .divider {
      cursor: row-resize;
    }
    .divider::before {
      content: "";
      position: absolute;
      inset-block: 0;
      inset-inline-start: calc(50% - 0.5px);
      width: 1px;
      background: var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
      transition: background-color 100ms linear, width 100ms linear, inset-inline-start 100ms linear;
    }
    :host([orientation="vertical"]) .divider::before {
      inset-inline: 0;
      inset-block-start: calc(50% - 0.5px);
      width: auto;
      height: 1px;
    }
    .divider:hover::before,
    .divider.dragging::before,
    .divider:focus-visible::before {
      background: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      width: 3px;
      inset-inline-start: calc(50% - 1.5px);
    }
    :host([orientation="vertical"]) .divider:hover::before,
    :host([orientation="vertical"]) .divider.dragging::before,
    :host([orientation="vertical"]) .divider:focus-visible::before {
      width: auto;
      inset-inline-start: 0;
      height: 3px;
      inset-block-start: calc(50% - 1.5px);
    }
    @media (prefers-reduced-motion: reduce) {
      .divider::before {
        transition: none;
      }
    }
  `;

  /** The start pane's share, in percent. */
  @property({ type: Number, reflect: true }) position = 50;

  /** Smallest start pane, in percent. */
  @property({ type: Number }) min = 10;

  /** Largest start pane, in percent. */
  @property({ type: Number }) max = 90;

  @property({ reflect: true }) orientation: SplitOrientation = "horizontal";

  /** Accessible name of the divider; name it after the start pane, e.g. "Request". Default: "Resize panes", translated. */
  @property() label?: string;

  private readonly localize = new LocalizeController(this);

  @property({ type: Boolean, reflect: true }) disabled = false;

  private readonly uid = `split-${++nextId}`;

  private dragging = false;

  /** Where Enter restores to after collapsing. */
  private restore: number | null = null;

  private clamp(value: number): number {
    return Math.round(Math.min(this.max, Math.max(this.min, value)) * 10) / 10;
  }

  protected override willUpdate(): void {
    this.position = this.clamp(this.position);
  }

  private set(value: number, emit: boolean): void {
    const next = this.clamp(value);
    if (next === this.position) return;
    this.position = next;
    if (emit) this.emit();
  }

  private emit(): void {
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { position: this.position } }));
  }

  private fromPointer(event: PointerEvent): number {
    const box = this.getBoundingClientRect();
    if (this.orientation === "vertical") return ((event.clientY - box.top) / box.height) * 100;
    const rtl = getComputedStyle(this).direction === "rtl";
    const x = rtl ? box.right - event.clientX : event.clientX - box.left;
    return (x / box.width) * 100;
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (this.disabled || event.button !== 0) return;
    const divider = event.currentTarget as HTMLElement;
    try {
      divider.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers (as tests dispatch) aren't "active": Firefox throws.
    }
    divider.classList.add("dragging");
    this.dragging = true;
    event.preventDefault();
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (this.dragging) this.set(this.fromPointer(event), false);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (!this.dragging) return;
    this.dragging = false;
    (event.currentTarget as HTMLElement).classList.remove("dragging");
    this.emit();
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    const step = event.shiftKey ? 10 : 1;
    const vertical = this.orientation === "vertical";
    const rtl = getComputedStyle(this).direction === "rtl";
    const keys: Record<string, number> = vertical
      ? { ArrowUp: -step, ArrowDown: step }
      : { ArrowLeft: rtl ? step : -step, ArrowRight: rtl ? -step : step };
    if (event.key in keys) {
      this.set(this.position + keys[event.key]!, true);
    } else if (event.key === "Home") {
      this.set(this.min, true);
    } else if (event.key === "End") {
      this.set(this.max, true);
    } else if (event.key === "Enter") {
      if (this.position > this.min) {
        this.restore = this.position;
        this.set(this.min, true);
      } else {
        this.set(this.restore ?? 50, true);
      }
    } else {
      return;
    }
    event.preventDefault();
  };

  override render() {
    return html`<div class="split" style="--_start: ${this.position}fr; --_end: ${100 - this.position}fr">
      <div class="pane" id="${this.uid}-start"><slot name="start"></slot></div>
      <div
        part="divider"
        class="divider"
        role="separator"
        tabindex=${this.disabled ? "-1" : "0"}
        aria-label=${this.label ?? this.localize.term("splitPanel.resizePanes", "Resize panes")}
        aria-controls="${this.uid}-start"
        aria-orientation=${this.orientation === "vertical" ? "horizontal" : "vertical"}
        aria-valuenow=${this.position}
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-disabled=${this.disabled ? "true" : "false"}
        @pointerdown=${this.onPointerDown}
        @pointermove=${this.onPointerMove}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerUp}
        @keydown=${this.onKeyDown}
      ></div>
      <div class="pane"><slot name="end"></slot></div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-split-panel": LitMaterialSplitPanel;
  }
}
