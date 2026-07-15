import "@lit-material/tabs";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "selected", label: "Selected tab", options: ["0", "1", "2"], default: "0" },
  { kind: "boolean", key: "photosDisabled", label: "Disable “Photos” tab", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-tabs selected=${state.selected as string}>
      <lit-material-tab>Music</lit-material-tab>
      <lit-material-tab>Videos</lit-material-tab>
      <lit-material-tab ?disabled=${state.photosDisabled as boolean}>Photos</lit-material-tab>
    </lit-material-tabs>
  `;
}

function markup(state: PlaygroundState): string {
  const disabled = state.photosDisabled ? " disabled" : "";
  return `<lit-material-tabs selected="${state.selected}">\n  <lit-material-tab>Music</lit-material-tab>\n  <lit-material-tab>Videos</lit-material-tab>\n  <lit-material-tab${disabled}>Photos</lit-material-tab>\n</lit-material-tabs>`;
}

@customElement("docs-tabs-page")
export class DocsTabsPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  override render() {
    return html`
      <h1>Tabs</h1>
      <p>WAI-ARIA tabs pattern, automatic activation, sliding indicator. No tabpanel management — click a tab or use arrow keys.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-tabs-page": DocsTabsPage;
  }
}
