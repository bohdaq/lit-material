import "@lit-material/status";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "status", label: "Status", options: ["ok", "warning", "error", "info", "neutral"], default: "ok" },
  { kind: "text", key: "label", label: "Label", default: "Healthy" },
];

const preview = (s: PlaygroundState) => html`<lit-material-status status=${s.status as string}>${s.label}</lit-material-status>`;
const markup = (s: PlaygroundState) => `<lit-material-status status="${s.status}">${s.label}</lit-material-status>`;

@customElement("docs-status-page")
export class DocsStatusPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Status</h1>
      <p>An icon and a short label coloured by state. Each state has its own glyph, so it never rests on colour alone.</p>
      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
      <section>
        <h2>Every state</h2>
        <div id="all-states" style="display: flex; flex-wrap: wrap; gap: 16px;">
          <lit-material-status status="ok">Healthy</lit-material-status>
          <lit-material-status status="warning">Probing</lit-material-status>
          <lit-material-status status="error">Failing checks</lit-material-status>
          <lit-material-status status="info">Draining</lit-material-status>
          <lit-material-status>Unknown</lit-material-status>
        </div>
      </section>
      <section>
        <h2>Pills</h2>
        <p>For compact values whose words already say the state, such as an HTTP status: filled, no glyph, a monospace label.</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <lit-material-status appearance="pill" mono status="ok">200 OK</lit-material-status>
          <lit-material-status appearance="pill" mono status="info">304 Not Modified</lit-material-status>
          <lit-material-status appearance="pill" mono status="warning">429 Too Many Requests</lit-material-status>
          <lit-material-status appearance="pill" mono status="error">503 Service Unavailable</lit-material-status>
          <lit-material-status appearance="pill">Draft</lit-material-status>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-status-page": DocsStatusPage;
  }
}
