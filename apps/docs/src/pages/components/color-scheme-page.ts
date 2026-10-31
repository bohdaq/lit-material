import "@lit-material/color-scheme";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-color-scheme-page")
export class DocsColorSchemePage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Color Scheme</h1>
      <p>
        A light/dark switch that sets <code>color-scheme</code> on <code>&lt;html&gt;</code>, remembers the choice and keeps every
        toggle in sync. The one in this site's header is the <code>cycle</code> variant.
      </p>
      <section>
        <h2>Toggle (light ↔ dark)</h2>
        <lit-material-color-scheme-toggle></lit-material-color-scheme-toggle>
      </section>
      <section>
        <h2>Cycle (light → dark → system)</h2>
        <lit-material-color-scheme-toggle cycle></lit-material-color-scheme-toggle>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-color-scheme-page": DocsColorSchemePage;
  }
}
