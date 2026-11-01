import "@lit-material/back-to-top";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-back-to-top-page")
export class DocsBackToTopPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1 id="back-to-top-heading">Back to top</h1>
      <section>
        <p>Scroll down this page: past 200 pixels a button appears at the bottom corner. It scrolls back up and moves focus to this heading.</p>
        <div style="height: 1600px; border-inline-start: 2px dashed var(--md-sys-color-outline-variant); padding-inline-start: 12px;">A long page…</div>
      </section>
      <lit-material-back-to-top threshold="200" target="back-to-top-heading"></lit-material-back-to-top>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-back-to-top-page": DocsBackToTopPage;
  }
}
