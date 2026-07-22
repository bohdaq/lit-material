import "@lit-material/simple-list";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [];

function preview(_state: PlaygroundState) {
  return html`
    <lit-material-simple-list style="width: 200px;">
      <lit-material-simple-list-item href="#overview">Overview</lit-material-simple-list-item>
      <lit-material-simple-list-item href="#billing" current>Billing</lit-material-simple-list-item>
      <lit-material-simple-list-item href="#settings">Settings</lit-material-simple-list-item>
    </lit-material-simple-list>
  `;
}

function markup(_state: PlaygroundState): string {
  return `<lit-material-simple-list>\n  <lit-material-simple-list-item href="#overview">Overview</lit-material-simple-list-item>\n  <lit-material-simple-list-item href="#billing" current>Billing</lit-material-simple-list-item>\n  <lit-material-simple-list-item href="#settings">Settings</lit-material-simple-list-item>\n</lit-material-simple-list>`;
}

@customElement("docs-simple-list-page")
export class DocsSimpleListPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Simple List</h1>
      <p>A plain, lightweight list of links or buttons — no ripple, no leading/trailing icons.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-simple-list-page": DocsSimpleListPage;
  }
}
