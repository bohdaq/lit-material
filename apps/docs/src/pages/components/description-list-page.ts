import "@lit-material/description-list";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [{ kind: "boolean", key: "horizontal", label: "Horizontal", default: false }];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-description-list ?horizontal=${state.horizontal as boolean} style="width: 320px;">
      <lit-material-description-list-group>
        <span slot="term">Status</span>
        Active
      </lit-material-description-list-group>
      <lit-material-description-list-group>
        <span slot="term">Owner</span>
        Jane Doe
      </lit-material-description-list-group>
    </lit-material-description-list>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = state.horizontal ? " horizontal" : "";
  return `<lit-material-description-list${attrs}>\n  <lit-material-description-list-group>\n    <span slot="term">Status</span>\n    Active\n  </lit-material-description-list-group>\n  <lit-material-description-list-group>\n    <span slot="term">Owner</span>\n    Jane Doe\n  </lit-material-description-list-group>\n</lit-material-description-list>`;
}

@customElement("docs-description-list-page")
export class DocsDescriptionListPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Description List</h1>
      <p>Metadata display — a set of term/description pairs.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-description-list-page": DocsDescriptionListPage;
  }
}
