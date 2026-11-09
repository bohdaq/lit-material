import "@lit-material/method-tag";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "WS", "GQL", "SSE", "gRPC"];

@customElement("docs-method-tag-page")
export class DocsMethodTagPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Method tag</h1>
      <p>An HTTP or API method as a short monospace label, coloured by method. The text is the method, so colour is never the only cue.</p>
      <section>
        <h2>Every method</h2>
        <p>${methods.map((m) => html`<lit-material-method-tag method=${m}></lit-material-method-tag>&nbsp;&nbsp;`)}</p>
      </section>
      <section>
        <h2>Medium</h2>
        <p><lit-material-method-tag method="POST" size="medium"></lit-material-method-tag> /v2/orders</p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-method-tag-page": DocsMethodTagPage;
  }
}
