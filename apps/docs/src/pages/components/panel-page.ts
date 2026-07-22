import "@lit-material/panel";
import "@lit-material/button";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  {
    kind: "select",
    key: "variant",
    label: "Variant",
    options: ["default", "bordered", "raised"],
    default: "default",
  },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-panel variant=${state.variant as string} style="width: 280px;">
      <h3 slot="header">Filters</h3>
      <p>Panel content goes here.</p>
      <div slot="footer">
        <lit-material-button variant="text">Apply</lit-material-button>
      </div>
    </lit-material-panel>
  `;
}

function markup(state: PlaygroundState): string {
  return `<lit-material-panel variant="${state.variant}">\n  <h3 slot="header">Filters</h3>\n  <p>Panel content goes here.</p>\n  <div slot="footer">\n    <lit-material-button variant="text">Apply</lit-material-button>\n  </div>\n</lit-material-panel>`;
}

@customElement("docs-panel-page")
export class DocsPanelPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Panel</h1>
      <p>A generic content container with optional header and footer bands.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-panel-page": DocsPanelPage;
  }
}
