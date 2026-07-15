import "@lit-material/checkbox";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "boolean", key: "checked", label: "Checked", default: false },
  { kind: "boolean", key: "indeterminate", label: "Indeterminate", default: false },
  { kind: "boolean", key: "error", label: "Error", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-checkbox
      ?checked=${state.checked as boolean}
      ?indeterminate=${state.indeterminate as boolean}
      ?error=${state.error as boolean}
      ?disabled=${state.disabled as boolean}
      aria-label="Demo checkbox"
    ></lit-material-checkbox>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [
    state.checked ? "checked" : null,
    state.indeterminate ? "indeterminate" : null,
    state.error ? "error" : null,
    state.disabled ? "disabled" : null,
  ]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-checkbox ${attrs} aria-label="Demo checkbox"></lit-material-checkbox>`;
}

@customElement("docs-checkbox-page")
export class DocsCheckboxPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  override render() {
    return html`
      <h1>Checkbox</h1>
      <p>Indeterminate state supported.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-checkbox-page": DocsCheckboxPage;
  }
}
