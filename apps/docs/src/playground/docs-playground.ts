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
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }
    .preview {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      background: var(--md-sys-color-surface);
      min-height: 4rem;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      padding: 1rem;
      background: var(--md-sys-color-surface-container-low);
      border-block-start: 1px solid var(--md-sys-color-outline-variant);
    }
    .control {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.85rem;
    }
    .control label {
      color: var(--md-sys-color-on-surface-variant);
    }
    pre {
      margin: 0;
      padding: 0.75rem 1rem;
      background: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface);
      font-size: 0.85rem;
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
          <div class="control">
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
