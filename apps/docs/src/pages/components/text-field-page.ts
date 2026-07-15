import "@lit-material/text-field";
import { LitElement, html, css } from "lit";
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

@customElement("docs-text-field-page")
export class DocsTextFieldPage extends LitElement {
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
        <lit-material-text-field variant="outlined" label="Name" required error-text="Required"></lit-material-text-field>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-text-field-page": DocsTextFieldPage;
  }
}
