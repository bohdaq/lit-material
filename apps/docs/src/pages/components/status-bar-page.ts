import "@lit-material/status-bar";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-status-bar-page")
export class DocsStatusBarPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Status bar</h1>
      <p>
        A thin bar along the bottom of an app window: the open file, the save state, the connection, a shortcut hint. Items at the start and the
        end; on a narrow window it wraps instead of clipping. Tone colours an item, so say the state in words too.
      </p>
      <section>
        <h2>An editor's status bar</h2>
        <lit-material-status-bar>
          <lit-material-status-bar-item>shop-api/orders/create-order.yaml</lit-material-status-bar-item>
          <lit-material-status-bar-item tone="warning">Unsaved · ⌘S writes the file</lit-material-status-bar-item>
          <lit-material-status-bar-item slot="end">Proxy off</lit-material-status-bar-item>
          <lit-material-status-bar-item slot="end">TLS 1.3 · h2</lit-material-status-bar-item>
          <lit-material-status-bar-item slot="end" button description="Show keyboard shortcuts">? Shortcuts</lit-material-status-bar-item>
        </lit-material-status-bar>
      </section>
      <section>
        <h2>Tones and links</h2>
        <lit-material-status-bar label="Sync">
          <lit-material-status-bar-item tone="success">Synced</lit-material-status-bar-item>
          <lit-material-status-bar-item tone="error" href="#conflicts">2 conflicts</lit-material-status-bar-item>
        </lit-material-status-bar>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-status-bar-page": DocsStatusBarPage;
  }
}
