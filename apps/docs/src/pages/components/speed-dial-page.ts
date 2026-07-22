import "@lit-material/speed-dial";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "direction", label: "Direction", options: ["up", "down"], default: "up" },
];

function icon(pathD: string) {
  return html`
    <svg slot="icon" viewBox="0 0 24 24" style="width: 100%; height: 100%; display: block;">
      <path d=${pathD} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
}

const PLUS = "M12 5v14M5 12h14";
const SHARE =
  "M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .1.76L8.91 8.7a3 3 0 1 0 0 6.6l6.19 3.94A3 3 0 1 0 15.83 17L9.1 12.76a3 3 0 0 0 0-1.52L15.83 7A3 3 0 0 0 18 8z";
const EDIT = "M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z";
const PRINT = "M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z";

function preview(state: PlaygroundState) {
  const direction = state.direction as string;
  return html`
    <div style="min-height: 220px; display: flex; align-items: ${direction === "up" ? "flex-end" : "flex-start"};">
      <lit-material-speed-dial label="Actions" direction=${direction}>
        ${icon(PLUS)}
        <lit-material-speed-dial-action label="Share">${icon(SHARE)}</lit-material-speed-dial-action>
        <lit-material-speed-dial-action label="Edit">${icon(EDIT)}</lit-material-speed-dial-action>
        <lit-material-speed-dial-action label="Print" disabled>${icon(PRINT)}</lit-material-speed-dial-action>
      </lit-material-speed-dial>
    </div>
  `;
}

function markup(state: PlaygroundState): string {
  return `<lit-material-speed-dial label="Actions" direction="${state.direction}">\n  <svg slot="icon" viewBox="0 0 24 24">...</svg>\n  <lit-material-speed-dial-action label="Share">\n    <svg slot="icon" viewBox="0 0 24 24">...</svg>\n  </lit-material-speed-dial-action>\n  ...\n</lit-material-speed-dial>`;
}

@customElement("docs-speed-dial-page")
export class DocsSpeedDialPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Speed Dial</h1>
      <p>A FAB that expands into a column of actions — built on the native Popover API, like Menu.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-speed-dial-page": DocsSpeedDialPage;
  }
}
