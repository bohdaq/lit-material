import "@lit-material/text-field";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "variant", label: "Variant", options: ["filled", "outlined"], default: "filled" },
  { kind: "text", key: "label", label: "Label", default: "Email" },
  { kind: "boolean", key: "required", label: "Required", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-text-field
      variant=${state.variant as string}
      label=${state.label as string}
      ?required=${state.required as boolean}
      ?disabled=${state.disabled as boolean}
    ></lit-material-text-field>
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
  return `<lit-material-text-field ${attrs}></lit-material-text-field>`;
}

const textareaControls: PlaygroundControl[] = [
  { kind: "select", key: "variant", label: "Variant", options: ["filled", "outlined"], default: "outlined" },
  { kind: "text", key: "label", label: "Label", default: "Comments" },
  { kind: "boolean", key: "required", label: "Required", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function textareaPreview(state: PlaygroundState) {
  return html`
    <lit-material-textarea
      variant=${state.variant as string}
      label=${state.label as string}
      ?required=${state.required as boolean}
      ?disabled=${state.disabled as boolean}
      maxlength="280"
    ></lit-material-textarea>
  `;
}

function textareaMarkup(state: PlaygroundState): string {
  const attrs = [
    `variant="${state.variant}"`,
    `label="${state.label}"`,
    state.required ? "required" : null,
    state.disabled ? "disabled" : null,
    `maxlength="280"`,
  ]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-textarea ${attrs}></lit-material-textarea>`;
}

@customElement("docs-text-field-page")
export class DocsTextFieldPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Text Field</h1>
      <p>Filled and outlined, with validation states.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>With counter &amp; icons</h2>
        <lit-material-text-field variant="outlined" label="Bio" maxlength="40">
          <span slot="leading-icon" aria-hidden="true">✏️</span>
          <span slot="trailing-icon" aria-hidden="true">😀</span>
        </lit-material-text-field>
      </section>

      <section>
        <h2>Prefix / suffix</h2>
        <lit-material-text-field variant="filled" label="Price" prefix="$" suffix=".00" type="number"></lit-material-text-field>
      </section>

      <section>
        <h2>Error</h2>
        <lit-material-text-field variant="outlined" label="Name" required error error-text="Required"></lit-material-text-field>
      </section>

      <h1>Textarea</h1>
      <p>Multi-line body text, sharing text field's floating-label/filled/outlined/error design.</p>

      <docs-playground
        .controls=${textareaControls}
        .preview=${textareaPreview}
        .markup=${textareaMarkup}
      ></docs-playground>

      <section>
        <h2>Error</h2>
        <lit-material-textarea variant="outlined" label="Comments" required error error-text="Required"></lit-material-textarea>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-text-field-page": DocsTextFieldPage;
  }
}
