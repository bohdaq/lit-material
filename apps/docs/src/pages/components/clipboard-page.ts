import "@lit-material/clipboard";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-clipboard-page")
export class DocsClipboardPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Clipboard</h1>
      <p>
        Copy buttons that fall back to <code>execCommand("copy")</code> where the Clipboard API is missing (plain-http pages), and say
        when copying failed instead of claiming success.
      </p>
      <section>
        <h2>Value with copy</h2>
        <lit-material-clipboard-copy style="flex: 1 1 100%" label="Endpoint" value="https://backend.example.com/mcp/shalb"></lit-material-clipboard-copy>
      </section>
      <section>
        <h2>Masked secret</h2>
        <lit-material-clipboard-copy style="flex: 1 1 100%" label="API token" value="kdc_8f2a61c94e0b7d35" masked></lit-material-clipboard-copy>
      </section>
      <section>
        <h2>Copy button</h2>
        <code id="install-cmd">curl -fsSL https://rws8.tech/install.sh | sh</code>
        <lit-material-copy-button for="install-cmd" label="Copy install command"></lit-material-copy-button>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-clipboard-page": DocsClipboardPage;
  }
}
