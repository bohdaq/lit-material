import "@lit-material/stepper";
import "@lit-material/button";
import type { LitMaterialStepper } from "@lit-material/stepper";
import { LitElement, html, nothing } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query, state } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "orientation", label: "Orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  { kind: "boolean", key: "linear", label: "Linear", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-stepper orientation=${state.orientation as string} ?linear=${state.linear as boolean}>
      <lit-material-step completed>
        <span slot="label">Account</span>
      </lit-material-step>
      <lit-material-step>
        <span slot="label">Shipping</span>
        <span slot="description">Choose a delivery method</span>
      </lit-material-step>
      <lit-material-step error>
        <span slot="label">Payment</span>
      </lit-material-step>
      <lit-material-step>
        <span slot="label">Review</span>
      </lit-material-step>
    </lit-material-stepper>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [`orientation="${state.orientation}"`, state.linear ? "linear" : null].filter(Boolean).join(" ");
  return `<lit-material-stepper ${attrs}>\n  <lit-material-step completed>\n    <span slot="label">Account</span>\n  </lit-material-step>\n  ...\n</lit-material-stepper>`;
}

const wizardSteps = ["Account", "Shipping", "Payment"];

@customElement("docs-stepper-page")
export class DocsStepperPage extends LitElement {
  static override styles = [pageStyles];

  @query("#wizard") private wizard?: LitMaterialStepper;

  @state() private completed = new Set<number>();

  private get current(): number {
    return this.wizard?.selected ?? 0;
  }

  private readonly handleNext = (): void => {
    if (!this.wizard) return;
    this.completed.add(this.wizard.selected);
    this.completed = new Set(this.completed);
    if (this.wizard.selected < wizardSteps.length - 1) this.wizard.selected += 1;
    this.requestUpdate();
  };

  private readonly handleBack = (): void => {
    if (!this.wizard || this.wizard.selected === 0) return;
    this.wizard.selected -= 1;
    this.requestUpdate();
  };

  private readonly handleStepChange = (): void => {
    this.requestUpdate();
  };

  override render() {
    return html`
      <h1>Stepper</h1>
      <p>A wizard-progress indicator — numbered/checkmark/error steps, horizontal or vertical, linear or free navigation.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Linear wizard, with content</h2>
        <p>
          Step content is out of scope for <code>lit-material-stepper</code> — this page owns it, listening for
          <code>change</code> and driving a "Next"/"Back" pair.
        </p>
        <lit-material-stepper id="wizard" linear @change=${this.handleStepChange} style="max-width: 480px;">
          ${wizardSteps.map(
            (label, index) => html`
              <lit-material-step ?completed=${this.completed.has(index)}>
                <span slot="label">${label}</span>
              </lit-material-step>
            `,
          )}
        </lit-material-stepper>
        <div style="margin-block-start: 16px; padding: 16px; border-radius: 12px; background: var(--md-sys-color-surface-container, #f3edf7);">
          ${this.current === 0
            ? html`<p>Sign in or create an account to continue.</p>`
            : this.current === 1
              ? html`<p>Pick a shipping address and delivery speed.</p>`
              : html`<p>Enter payment details to finish.</p>`}
        </div>
        <div style="margin-block-start: 12px; display: flex; gap: 8px;">
          <lit-material-button variant="text" ?disabled=${this.current === 0} @click=${this.handleBack}
            >Back</lit-material-button
          >
          ${this.current < wizardSteps.length - 1
            ? html`<lit-material-button variant="filled" @click=${this.handleNext}>Next</lit-material-button>`
            : nothing}
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-stepper-page": DocsStepperPage;
  }
}
