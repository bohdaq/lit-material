import "@lit-material/icon-button";
import "@lit-material/drawer";
import type { LitMaterialDrawer } from "@lit-material/drawer";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query } from "lit/decorators.js";

@customElement("docs-drawer-page")
export class DocsDrawerPage extends LitElement {
  static override styles = [pageStyles];

  @query("#notifications")
  private drawer?: LitMaterialDrawer;

  private readonly openDrawer = (): void => this.drawer?.show();
  private readonly closeDrawer = (): void => this.drawer?.close();

  override render() {
    return html`
      <h1>Drawer</h1>
      <p>A non-modal, persistent overlay panel — for a notification drawer or any contextual panel that stays open alongside the page.</p>

      <lit-material-icon-button aria-label="Notifications" @click=${this.openDrawer}>🔔</lit-material-icon-button>

      <lit-material-drawer id="notifications">
        <div slot="header">
          <span>Notifications</span>
          <lit-material-icon-button aria-label="Close" @click=${this.closeDrawer}>✕</lit-material-icon-button>
        </div>
        <p>New comment on your post.</p>
        <p>Your export finished.</p>
        <p>Weekly summary is ready.</p>
      </lit-material-drawer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-drawer-page": DocsDrawerPage;
  }
}
