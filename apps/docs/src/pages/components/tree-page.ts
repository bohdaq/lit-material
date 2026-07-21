import "@lit-material/tree";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [{ kind: "boolean", key: "multiple", label: "Multi-select", default: false }];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-tree ?multiple=${state.multiple as boolean} style="max-width: 320px;">
      <lit-material-tree-item expanded>
        <span slot="label">Documents</span>
        <lit-material-tree-item selected>
          <span slot="label">Resume.pdf</span>
        </lit-material-tree-item>
        <lit-material-tree-item disabled>
          <span slot="label">Cover Letter.pdf</span>
        </lit-material-tree-item>
        <lit-material-tree-item>
          <span slot="label">Projects</span>
          <lit-material-tree-item>
            <span slot="label">lit-material</span>
          </lit-material-tree-item>
        </lit-material-tree-item>
      </lit-material-tree-item>
      <lit-material-tree-item>
        <span slot="label">Photos</span>
      </lit-material-tree-item>
    </lit-material-tree>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = state.multiple ? " multiple" : "";
  return `<lit-material-tree${attrs}>\n  <lit-material-tree-item expanded>\n    <span slot="label">Documents</span>\n    <lit-material-tree-item selected>\n      <span slot="label">Resume.pdf</span>\n    </lit-material-tree-item>\n    ...\n  </lit-material-tree-item>\n  ...\n</lit-material-tree>`;
}

@customElement("docs-tree-page")
export class DocsTreePage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Tree</h1>
      <p>
        A hierarchical, expand-collapse list — arbitrarily nested nodes, single- or multi-select,
        arrow-key navigation across every visible node.
      </p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-tree-page": DocsTreePage;
  }
}
