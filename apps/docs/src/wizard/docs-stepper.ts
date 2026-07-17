import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface StepperStep {
  title: string;
}

/**
 * A linear, gated step indicator — deliberately not `lit-material-tabs`. Tabs let you freely jump to any
 * tab and roam between all of them with arrow keys; this is the opposite: only Next/Back (or clicking an
 * already-visited dot) can move you forward, and steps past `furthest` are inert. Retrofitting that gating
 * onto tabs would mean overriding most of its event handling anyway.
 */
@customElement("docs-stepper")
export class DocsStepper extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    ol {
      display: flex;
      align-items: center;
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem;
    }

    li {
      display: flex;
      align-items: center;
      flex: 1;
    }
    li:last-child {
      flex: 0 0 auto;
    }

    .connector {
      flex: 1;
      height: 1px;
      background: var(--md-sys-color-outline-variant);
      margin: 0 0.5rem;
    }

    .dot {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid var(--md-sys-color-outline-variant);
      background: var(--md-sys-color-surface-container-lowest);
      color: var(--md-sys-color-on-surface-variant);
    }

    button.dot {
      cursor: pointer;
      font-family: inherit;
      transition:
        background 120ms ease,
        border-color 120ms ease,
        color 120ms ease;
    }
    button.dot:hover {
      border-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-primary);
    }

    .dot[aria-current="step"] {
      background: var(--md-sys-color-primary);
      border-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }

    span.dot {
      opacity: 0.5;
    }

    .label {
      display: block;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--md-sys-color-on-surface-variant);
      text-align: center;
      margin-top: 0.4rem;
      max-width: 6rem;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 0 0 auto;
    }
  `;

  @property({ attribute: false }) steps: StepperStep[] = [];
  @property({ type: Number }) current = 0;
  @property({ type: Number }) furthest = 0;

  override render() {
    return html`
      <ol>
        ${this.steps.map(
          (step, index) => html`
            <li>
              <div class="step">
                ${index <= this.furthest
                  ? html`
                      <button
                        class="dot"
                        type="button"
                        aria-current=${index === this.current ? "step" : "false"}
                        aria-label="Step ${index + 1}: ${step.title}"
                        @click=${() => this.selectStep(index)}
                      >
                        ${index + 1}
                      </button>
                    `
                  : html`
                      <span class="dot" aria-disabled="true" aria-label="Step ${index + 1}: ${step.title}">
                        ${index + 1}
                      </span>
                    `}
                <span class="label">${step.title}</span>
              </div>
              ${index < this.steps.length - 1 ? html`<div class="connector"></div>` : null}
            </li>
          `,
        )}
      </ol>
    `;
  }

  private selectStep(index: number): void {
    if (index > this.furthest) return;
    this.dispatchEvent(new CustomEvent("step-select", { detail: { index }, bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-stepper": DocsStepper;
  }
}
