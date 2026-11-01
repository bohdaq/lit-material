import "@lit-material/button";
import "@lit-material/dialog";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import type { LitMaterialAboutDialog } from "@lit-material/dialog";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-about-dialog-page")
export class DocsAboutDialogPage extends LitElement {
  static override styles = [pageStyles];

  @query("lit-material-about-dialog") private readonly about!: LitMaterialAboutDialog;

  override render() {
    return html`
      <h1>About dialog</h1>
      <section>
        <p>What a Help → About menu item opens: name and logo, version details, legal lines.</p>
        <lit-material-button @click=${() => this.about.show()}>About this app</lit-material-button>
        <lit-material-about-dialog product-name="Acme Console">
          <svg slot="logo" viewBox="0 0 32 32" width="40" height="40" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#6750a4" /><path d="M9 22l7-13 7 13z" fill="#fff" /></svg>
          <dl style="display: grid; grid-template-columns: auto 1fr; gap: 4px 16px; margin: 0;">
            <dt>Version</dt><dd style="margin: 0">2.4.1</dd>
            <dt>Build</dt><dd style="margin: 0">2026-11-01 · 03c3708</dd>
            <dt>Server</dt><dd style="margin: 0">rws 18.17.0</dd>
          </dl>
          <span slot="legal">© 2026 Acme. Licensed under the MIT license.</span>
        </lit-material-about-dialog>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-about-dialog-page": DocsAboutDialogPage;
  }
}
