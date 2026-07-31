import "@lit-material/overflow-menu";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const ACTIONS = ["Share", "Duplicate", "Archive", "Rename", "Delete"];

const controls: PlaygroundControl[] = [
  { kind: "select", key: "width", label: "Container width", options: ["150px", "250px", "400px", "600px"], default: "250px" },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-overflow-menu style="width: ${state.width}; border: 1px dashed #ccc; padding: 4px;">
      ${ACTIONS.map((action) => html`<button>${action}</button>`)}
    </lit-material-overflow-menu>
  `;
}

function markup(state: PlaygroundState): string {
  const items = ACTIONS.map((action) => `  <button>${action}</button>`).join("\n");
  return `<lit-material-overflow-menu style="width: ${state.width};">\n${items}\n</lit-material-overflow-menu>`;
}

@customElement("docs-overflow-menu-page")
export class DocsOverflowMenuPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Overflow Menu</h1>
      <p>A responsive action row that collapses overflowing items into a kebab (⋮) menu. Try narrowing the container width below.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-overflow-menu-page": DocsOverflowMenuPage;
  }
}
