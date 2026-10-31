import "@lit-material/split-panel";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-split-panel-page")
export class DocsSplitPanelPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Split panel</h1>
      <section>
        <p>Drag the divider, or focus it and use the arrow keys; Enter collapses and restores the left pane.</p>
        <lit-material-split-panel label="Request" position="40" style="height: 240px; border: 1px solid var(--md-sys-color-outline-variant); border-radius: 8px;">
          <div slot="start" style="padding: 16px;"><strong>Request</strong><p>GET /api/projects</p></div>
          <div slot="end" style="padding: 16px;"><strong>Response</strong><p>200 OK · 1.2 KiB · 84 ms</p></div>
        </lit-material-split-panel>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-split-panel-page": DocsSplitPanelPage;
  }
}
