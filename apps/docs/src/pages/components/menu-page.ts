import "@lit-material/button";
import "@lit-material/menu";
import "@lit-material/list";
import type { LitMaterialMenu } from "@lit-material/menu";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query } from "lit/decorators.js";

@customElement("docs-menu-page")
export class DocsMenuPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-menu")
  private menu?: LitMaterialMenu;

  private readonly openMenu = (): void => this.menu?.show();

  override render() {
    return html`
      <h1>Menu</h1>
      <p>Native Popover API (<code>auto</code>) + hand-rolled positioning; items are List Item, reused.</p>

      <lit-material-button id="open-menu-btn" variant="outlined" @click=${this.openMenu}>Options ▾</lit-material-button>

      <lit-material-menu id="demo-menu" anchor="open-menu-btn">
        <lit-material-list-item interactive>
          <span slot="leading" aria-hidden="true">🔗</span>
          Share
        </lit-material-list-item>
        <lit-material-list-item interactive divider>
          <span slot="leading" aria-hidden="true">📋</span>
          Duplicate
        </lit-material-list-item>
        <lit-material-list-item interactive disabled>
          <span slot="leading" aria-hidden="true">📦</span>
          Archive
        </lit-material-list-item>
        <lit-material-list-item interactive>
          <span slot="leading" aria-hidden="true">🗑️</span>
          Delete
        </lit-material-list-item>
      </lit-material-menu>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-menu-page": DocsMenuPage;
  }
}
