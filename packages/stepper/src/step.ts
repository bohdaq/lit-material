import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./step-styles.js";

export type StepOrientation = "horizontal" | "vertical";

/**
 * A single step in a `lit-material-stepper` — a numbered (or checkmark/error)
 * circle, a connector line to the next step, and a label/description. Purely
 * presentational: it has no click handler of its own — the parent stepper
 * listens for the bubbling click (the same `event.composedPath()` delegation
 * `lit-material-select` and `lit-material-tab`'s parent use) and drives
 * `active`/`stepNumber`/`orientation`/roving `tabindex` from there.
 *
 * `completed` and `error` are yours to set based on real state (form
 * validity, a submitted request, ...) — they're never inferred from the
 * step's position relative to the active one.
 *
 * @element lit-material-step
 *
 * @slot label - The step's label.
 * @slot description - Optional supporting text shown below the label.
 *
 * @csspart step - The button (background/padding).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 * @csspart circle - The numbered/checkmark/error indicator circle.
 * @csspart connector - The line connecting this step to the next one.
 */
@customElement("lit-material-step")
export class LitMaterialStep extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Managed by the parent stepper: whether this is the currently selected step. */
  @property({ type: Boolean, reflect: true }) active = false;
  /** Yours to set — not inferred from `active`/position. Shows a checkmark instead of the step number. */
  @property({ type: Boolean, reflect: true }) completed = false;
  /** Yours to set. Shows an error indicator instead of the step number, and colors the label. */
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 1-based number shown in the circle. Managed by the parent stepper; defaults to 1 standalone. */
  @property({ type: Number, attribute: "step-number" }) stepNumber = 1;
  /** Managed by the parent stepper to match its own `orientation`. */
  @property({ reflect: true }) orientation: StepOrientation = "horizontal";

  @query(".state-layer") private readonly stateLayerElement?: HTMLElement;

  private readonly focusRing = new FocusRingController(this);
  private readonly ripple = new RippleController(this);

  protected override firstUpdated(): void {
    if (this.stateLayerElement) this.ripple.attach(this.stateLayerElement);
  }

  override render() {
    return html`
      <button
        class="step"
        part="step"
        type="button"
        aria-current=${this.active ? "step" : nothing}
        tabindex=${this.active ? "0" : "-1"}
        ?disabled=${this.disabled}
      >
        <div class="state-layer" part="ripple"></div>
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        <div class="row">
          <span class="circle" part="circle">${this.renderCircleContent()}</span>
          <span class="connector" part="connector"></span>
        </div>
        <span class="text">
          <span class="label" part="label"><slot name="label"></slot></span>
          <span class="description" part="description"><slot name="description"></slot></span>
        </span>
      </button>
    `;
  }

  private renderCircleContent() {
    if (this.error) {
      return html`
        <svg class="icon" part="icon" viewBox="0 0 18 18" aria-hidden="true">
          <line x1="9" y1="4" x2="9" y2="10"></line>
          <line x1="9" y1="13.5" x2="9" y2="13.6"></line>
        </svg>
      `;
    }
    if (this.completed) {
      return html`
        <svg class="icon" part="icon" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M4 9.5 L7.2 12.7 L14 5.5"></path>
        </svg>
      `;
    }
    return this.stepNumber;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-step": LitMaterialStep;
  }
}
