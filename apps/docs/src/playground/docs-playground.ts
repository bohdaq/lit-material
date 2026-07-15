import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { PlaygroundControl, PlaygroundState } from "./controls.js";
import { defaultState } from "./controls.js";

/**
 * Generic control-panel component: renders `controls` as form inputs bound
 * to state, live-re-rendering `preview(state)` plus a read-only
 * `markup(state)` source snippet. Used on every attribute/variant-driven
 * component page for the "live playground (editable props)" capability.
 */
@customElement("docs-playground")
export class DocsPlayground extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .preview {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 3rem 2rem;
      min-height: 5rem;
      background-color: var(--md-sys-color-surface);
      background-image: radial-gradient(circle, var(--md-sys-color-outline-variant) 1px, transparent 1px);
      background-size: 18px 18px;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding: 1.1rem 1.25rem;
      background: var(--md-sys-color-surface-container-low);
      border-block: 1px solid var(--md-sys-color-outline-variant);
    }
    .control {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .control label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--md-sys-color-on-surface-variant);
    }
    .control.boolean label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      text-transform: none;
      letter-spacing: normal;
      font-weight: 500;
      font-size: 0.85rem;
      color: var(--md-sys-color-on-surface);
    }

    select,
    input[type="text"] {
      font-family: inherit;
      font-size: 0.85rem;
      color: var(--md-sys-color-on-surface);
      background: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
      padding: 0.35rem 0.6rem;
      min-width: 9rem;
    }
    select:focus-visible,
    input[type="text"]:focus-visible,
    input[type="checkbox"]:focus-visible {
      outline: 2px solid var(--md-sys-color-primary);
      outline-offset: 1px;
    }
    input[type="checkbox"] {
      accent-color: var(--md-sys-color-primary);
      width: 1rem;
      height: 1rem;
    }

    .markup-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 1.25rem 0;
      background: var(--md-sys-color-surface-container-highest);
    }
    .markup-label span {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--md-sys-color-on-surface-variant);
    }
    .dots {
      display: flex;
      gap: 5px;
    }
    .dots i {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--md-sys-color-outline-variant);
    }

    pre {
      margin: 0;
      padding: 1rem 1.25rem 1.25rem;
      background: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface);
      font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.82rem;
      line-height: 1.6;
      overflow-x: auto;
    }
  `;

  @property({ attribute: false })
  controls: PlaygroundControl[] = [];

  @property({ attribute: false })
  preview!: (state: PlaygroundState) => unknown;

  @property({ attribute: false })
  markup!: (state: PlaygroundState) => string;

  @state()
  private values: PlaygroundState | null = null;

  private currentValues(): PlaygroundState {
    return this.values ?? defaultState(this.controls);
  }

  private readonly handleChange = (control: PlaygroundControl, next: string | boolean): void => {
    this.values = { ...this.currentValues(), [control.key]: next };
  };

  override render() {
    const values = this.currentValues();
    return html`
      <div class="preview">${this.preview(values)}</div>
      <div class="controls">${this.controls.map((control) => this.renderControl(control, values))}</div>
      <div class="markup-label">
        <span>Markup</span>
        <div class="dots"><i></i><i></i><i></i></div>
      </div>
      <pre>${this.markup(values)}</pre>
    `;
  }

  private renderControl(control: PlaygroundControl, values: PlaygroundState) {
    const value = values[control.key];
    switch (control.kind) {
      case "select":
        return html`
          <div class="control">
            <label for=${control.key}>${control.label}</label>
            <select
              id=${control.key}
              @change=${(event: Event) => this.handleChange(control, (event.target as HTMLSelectElement).value)}
            >
              ${control.options.map(
                (option) => html`<option value=${option} ?selected=${option === value}>${option}</option>`,
              )}
            </select>
          </div>
        `;
      case "boolean":
        return html`
          <div class="control boolean">
            <label>
              <input
                type="checkbox"
                .checked=${Boolean(value)}
                @change=${(event: Event) => this.handleChange(control, (event.target as HTMLInputElement).checked)}
              />
              ${control.label}
            </label>
          </div>
        `;
      case "text":
        return html`
          <div class="control">
            <label for=${control.key}>${control.label}</label>
            <input
              id=${control.key}
              type="text"
              .value=${String(value ?? "")}
              @input=${(event: Event) => this.handleChange(control, (event.target as HTMLInputElement).value)}
            />
          </div>
        `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-playground": DocsPlayground;
  }
}
