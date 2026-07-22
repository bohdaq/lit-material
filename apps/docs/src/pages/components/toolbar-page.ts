import "@lit-material/toolbar";
import "@lit-material/button";
import "@lit-material/chip";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [{ kind: "boolean", key: "dense", label: "Dense", default: false }];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-toolbar ?dense=${state.dense as boolean} style="background: var(--md-sys-color-surface-container, #f3edf7);">
      <lit-material-chip>Active</lit-material-chip>
      <lit-material-chip>Archived</lit-material-chip>
      <lit-material-toolbar-spacer></lit-material-toolbar-spacer>
      <lit-material-button variant="filled">Save</lit-material-button>
    </lit-material-toolbar>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = state.dense ? " dense" : "";
  return `<lit-material-toolbar${attrs}>\n  <lit-material-chip>Active</lit-material-chip>\n  <lit-material-chip>Archived</lit-material-chip>\n  <lit-material-toolbar-spacer></lit-material-toolbar-spacer>\n  <lit-material-button variant="filled">Save</lit-material-button>\n</lit-material-toolbar>`;
}

@customElement("docs-toolbar-page")
export class DocsToolbarPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Toolbar</h1>
      <p>A row of grouped controls above a piece of content, with a spacer to push trailing items to the far end.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-toolbar-page": DocsToolbarPage;
  }
}
