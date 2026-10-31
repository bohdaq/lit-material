import "@lit-material/tabs";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
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
    ${["Music", "Videos", "Photos"].map(
      (name, i) => html`<lit-material-tab-panel ?selected=${String(i) === state.selected}><p>${name} panel</p></lit-material-tab-panel>`,
    )}
  `;
}

function markup(state: PlaygroundState): string {
  const disabled = state.photosDisabled ? " disabled" : "";
  return `<lit-material-tabs selected="${state.selected}">\n  <lit-material-tab>Music</lit-material-tab>\n  <lit-material-tab>Videos</lit-material-tab>\n  <lit-material-tab${disabled}>Photos</lit-material-tab>\n</lit-material-tabs>\n${["Music", "Videos", "Photos"]
    .map((name, i) => `<lit-material-tab-panel${String(i) === state.selected ? " selected" : ""}>${name} panel</lit-material-tab-panel>`)
    .join("\n")}`;
}

@customElement("docs-tabs-page")
export class DocsTabsPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Tabs</h1>
      <p>WAI-ARIA tabs pattern, automatic activation, sliding indicator. Optional <code>lit-material-tab-panel</code> siblings are paired by index and shown for the selected tab.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-tabs-page": DocsTabsPage;
  }
}
