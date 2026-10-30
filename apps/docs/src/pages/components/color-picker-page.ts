import "@lit-material/color-picker";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "text", key: "label", label: "Label", default: "Accent color" },
  { kind: "text", key: "value", label: "Value", default: "#6750a4" },
  { kind: "boolean", key: "required", label: "Required", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-color-picker
      label=${state.label as string}
      value=${state.value as string}
      ?required=${state.required as boolean}
      ?disabled=${state.disabled as boolean}
    ></lit-material-color-picker>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [
    `label="${state.label}"`,
    `value="${state.value}"`,
    state.required ? "required" : null,
    state.disabled ? "disabled" : null,
  ]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-color-picker ${attrs}></lit-material-color-picker>`;
}

@customElement("docs-color-picker-page")
export class DocsColorPickerPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Color Picker</h1>
      <p>
        A swatch trigger that opens a preset color grid plus a native <code>&lt;input type="color"&gt;</code>
        for arbitrary values.
      </p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>No value</h2>
        <lit-material-color-picker label="Accent color"></lit-material-color-picker>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-color-picker-page": DocsColorPickerPage;
  }
}
