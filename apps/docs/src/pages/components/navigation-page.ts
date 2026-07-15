import "@lit-material/navigation";
import "@lit-material/button";
import type { LitMaterialNavigationDrawer } from "@lit-material/navigation";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-navigation-page")
export class DocsNavigationPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-nav-drawer")
  private navDrawer?: LitMaterialNavigationDrawer;

  private readonly openDrawer = (): void => this.navDrawer?.show();

  override render() {
    return html`
      <h1>Navigation Drawer &amp; Rail</h1>
      <p>One package (<code>@lit-material/navigation</code>), matching the List/List Item precedent.</p>

      <section>
        <h2>Navigation Drawer</h2>
        <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
          <lit-material-navigation-drawer
            selected="0"
            style="height: 320px; border: 1px solid var(--md-sys-color-outline-variant, #cac4d0); border-radius: 12px;"
          >
            <span slot="header" style="font-weight: 500;">Mail</span>
            <lit-material-navigation-drawer-item><span slot="icon">📥</span>Inbox</lit-material-navigation-drawer-item>
            <lit-material-navigation-drawer-item><span slot="icon">📤</span>Sent</lit-material-navigation-drawer-item>
            <lit-material-navigation-drawer-item disabled
              ><span slot="icon">🗑️</span>Trash (disabled)</lit-material-navigation-drawer-item
            >
          </lit-material-navigation-drawer>

          <div>
            <lit-material-button variant="outlined" @click=${this.openDrawer}>Open modal drawer</lit-material-button>
            <lit-material-navigation-drawer id="demo-nav-drawer" variant="modal" selected="1">
              <span slot="header" style="font-weight: 500;">Mail</span>
              <lit-material-navigation-drawer-item><span slot="icon">📥</span>Inbox</lit-material-navigation-drawer-item>
              <lit-material-navigation-drawer-item><span slot="icon">📤</span>Sent</lit-material-navigation-drawer-item>
            </lit-material-navigation-drawer>
          </div>
        </div>
      </section>

      <section>
        <h2>Navigation Rail</h2>
        <lit-material-navigation-rail
          selected="0"
          style="height: 280px; border: 1px solid var(--md-sys-color-outline-variant, #cac4d0); border-radius: 12px;"
        >
          <lit-material-navigation-rail-item><span slot="icon">🎵</span>Music</lit-material-navigation-rail-item>
          <lit-material-navigation-rail-item><span slot="icon">🎬</span>Videos</lit-material-navigation-rail-item>
          <lit-material-navigation-rail-item disabled><span slot="icon">🖼️</span>Photos</lit-material-navigation-rail-item>
        </lit-material-navigation-rail>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-navigation-page": DocsNavigationPage;
  }
}
