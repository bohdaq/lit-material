import "@lit-material/select";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "variant", label: "Variant", options: ["filled", "outlined"], default: "filled" },
  { kind: "text", key: "label", label: "Label", default: "Size" },
  { kind: "boolean", key: "required", label: "Required", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-select
      variant=${state.variant as string}
      label=${state.label as string}
      ?required=${state.required as boolean}
      ?disabled=${state.disabled as boolean}
      style="max-width: 220px;"
    >
      <lit-material-select-option value="s">Small</lit-material-select-option>
      <lit-material-select-option value="m">Medium</lit-material-select-option>
      <lit-material-select-option value="l">Large</lit-material-select-option>
    </lit-material-select>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [
    `variant="${state.variant}"`,
    `label="${state.label}"`,
    state.required ? "required" : null,
    state.disabled ? "disabled" : null,
  ]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-select ${attrs}>\n  <lit-material-select-option value="s">Small</lit-material-select-option>\n  ...\n</lit-material-select>`;
}

@customElement("docs-select-page")
export class DocsSelectPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    h2 {
      width: 100%;
    }
  `;

  override render() {
    return html`
      <h1>Select</h1>
      <p>A listbox-pattern combobox (select-only) on the native Popover API, the same foundation as Menu.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Error, disabled option</h2>
        <lit-material-select label="Plan" required error error-text="Please choose a plan" style="max-width: 220px;">
          <lit-material-select-option value="free">Free</lit-material-select-option>
          <lit-material-select-option value="pro">Pro</lit-material-select-option>
        </lit-material-select>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-select-page": DocsSelectPage;
  }
}
