import "@lit-material/data-list";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [];

function preview(_state: PlaygroundState) {
  return html`
    <lit-material-data-list style="width: 400px;">
      <lit-material-data-list-item>
        <lit-material-data-list-cell fill>invoice-2024-01.pdf</lit-material-data-list-cell>
        <lit-material-data-list-cell>2.1 MB</lit-material-data-list-cell>
      </lit-material-data-list-item>
      <lit-material-data-list-item expandable open>
        <lit-material-data-list-cell fill>invoice-2024-02.pdf</lit-material-data-list-cell>
        <lit-material-data-list-cell>1.8 MB</lit-material-data-list-cell>
        <span slot="expanded-content">Uploaded by Jane Doe on Feb 3.</span>
      </lit-material-data-list-item>
      <lit-material-data-list-item selected>
        <lit-material-data-list-cell fill>invoice-2024-03.pdf</lit-material-data-list-cell>
        <lit-material-data-list-cell>950 KB</lit-material-data-list-cell>
      </lit-material-data-list-item>
    </lit-material-data-list>
  `;
}

function markup(_state: PlaygroundState): string {
  return `<lit-material-data-list>\n  <lit-material-data-list-item>\n    <lit-material-data-list-cell fill>invoice-2024-01.pdf</lit-material-data-list-cell>\n    <lit-material-data-list-cell>2.1 MB</lit-material-data-list-cell>\n  </lit-material-data-list-item>\n  <lit-material-data-list-item expandable>\n    <lit-material-data-list-cell fill>invoice-2024-02.pdf</lit-material-data-list-cell>\n    <lit-material-data-list-cell>1.8 MB</lit-material-data-list-cell>\n    <span slot="expanded-content">Uploaded by Jane Doe on Feb 3.</span>\n  </lit-material-data-list-item>\n  <lit-material-data-list-item selected>\n    <lit-material-data-list-cell fill>invoice-2024-03.pdf</lit-material-data-list-cell>\n    <lit-material-data-list-cell>950 KB</lit-material-data-list-cell>\n  </lit-material-data-list-item>\n</lit-material-data-list>`;
}

@customElement("docs-data-list-page")
export class DocsDataListPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Data List</h1>
      <p>A list of flexible, multi-cell rows, optionally expandable.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-data-list-page": DocsDataListPage;
  }
}
