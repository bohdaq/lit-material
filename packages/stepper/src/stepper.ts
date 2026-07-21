import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { LitMaterialStep, StepOrientation } from "./step.js";
import { styles } from "./stepper-styles.js";

/**
 * Groups `lit-material-step` elements into a wizard-progress indicator,
 * driving each step's `active`/`step-number`/`orientation` and roving-focus
 * keyboard navigation (Left/Right for horizontal, Up/Down for vertical, plus
 * Home/End), marked with `aria-current="step"` on the active step — the ARIA
 * token defined specifically for step-by-step processes.
 *
 * Step *content* is deliberately out of scope, the same way `lit-material-tabs`
 * leaves panel content to the consumer: what "showing a step's content" means
 * varies too much (a plain `<div>`, a routed view, a multi-field form...) to
 * bake in one scheme. Listen for `change` and show your own content.
 *
 * @element lit-material-stepper
 *
 * @slot - `lit-material-step` elements.
 *
 * @csspart stepper - The container.
 *
 * @fires change - Fires when `selected` changes via user interaction.
 */
@customElement("lit-material-stepper")
export class LitMaterialStepper extends LitElement {
  static override styles = styles;

  /** Index of the active step. */
  @property({ type: Number }) selected = 0;
  @property({ reflect: true }) orientation: StepOrientation = "horizontal";
  /** When set, a step is only reachable once every step before it is `completed` (going back is always allowed). */
  @property({ type: Boolean }) linear = false;

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncSteps();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("selected") || changed.has("orientation")) {
      this.syncSteps();
    }
  }

  private get steps(): LitMaterialStep[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during the render phase — degrade to no steps rather than
    // throwing, since each step already renders its own SSR-visible state
    // from its own attributes anyway.
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-step"));
  }

  private get enabledSteps(): LitMaterialStep[] {
    return this.steps.filter((step) => !step.disabled);
  }

  private syncSteps(): void {
    this.steps.forEach((step, index) => {
      step.active = index === this.selected;
      step.stepNumber = index + 1;
      step.orientation = this.orientation;
    });
  }

  /**
   * A step is reachable if not linear, it's at/before the active step, or
   * every *enabled* step before it is completed — a disabled step can never
   * be completed, so it doesn't block later steps from becoming reachable.
   */
  private isReachable(index: number): boolean {
    if (!this.linear || index <= this.selected) return true;
    const steps = this.steps;
    for (let i = 0; i < index; i++) {
      const step = steps[i];
      if (step && !step.disabled && !step.completed) return false;
    }
    return true;
  }

  override render() {
    return html`<div class="stepper" part="stepper"><slot @slotchange=${this.syncSteps}></slot></div>`;
  }

  private select(step: LitMaterialStep): void {
    const index = this.steps.indexOf(step);
    if (index === -1 || step.disabled || !this.isReachable(index)) return;
    const isChange = index !== this.selected;
    this.selected = index;
    step.focus();
    if (isChange) this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  private readonly handleClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    const step = this.steps.find((candidate) => path.includes(candidate));
    if (step) this.select(step);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const steps = this.enabledSteps;
    if (steps.length === 0) return;
    // Not `document.activeElement`: steps are this element's own light-DOM
    // children, but `document.activeElement` retargets to the outermost
    // shadow host whenever this stepper is itself used inside another
    // component's shadow root (the normal case) rather than reporting the
    // actually-focused step. `getRootNode()` — the tree this stepper and its
    // steps both actually live in — resolves correctly regardless of how
    // deeply that tree itself is nested.
    const current = (this.getRootNode() as Document | ShadowRoot).activeElement as LitMaterialStep | null;
    const index = current ? steps.indexOf(current) : -1;

    const forwardKey = this.orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    const backwardKey = this.orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

    switch (event.key) {
      case forwardKey: {
        event.preventDefault();
        steps[index === -1 ? 0 : (index + 1) % steps.length]!.focus();
        break;
      }
      case backwardKey: {
        event.preventDefault();
        steps[index === -1 ? steps.length - 1 : (index - 1 + steps.length) % steps.length]!.focus();
        break;
      }
      case "Home": {
        event.preventDefault();
        steps[0]!.focus();
        break;
      }
      case "End": {
        event.preventDefault();
        steps[steps.length - 1]!.focus();
        break;
      }
      default:
        break;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-stepper": LitMaterialStepper;
  }
}
