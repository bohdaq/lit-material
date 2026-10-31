import "@lit-material/truncate";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-truncate-page")
export class DocsTruncatePage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Truncate</h1>
      <section>
        <p>Long IDs, hashes and paths: the full text stays in the DOM for copy and screen readers; hover shows it.</p>
        <div style="display: grid; gap: 12px; max-width: 320px;">
          <lit-material-truncate value="Production database (eu-central-1, primary replica)"></lit-material-truncate>
          <lit-material-truncate position="middle" value="sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"></lit-material-truncate>
          <lit-material-truncate position="middle" tail-length="14" value="/var/lib/rws/acme/certificates/api.example.com.pem"></lit-material-truncate>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-truncate-page": DocsTruncatePage;
  }
}
