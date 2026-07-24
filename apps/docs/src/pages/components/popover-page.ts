import "@lit-material/button";
import "@lit-material/popover";
import type { LitMaterialPopover } from "@lit-material/popover";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query } from "lit/decorators.js";

@customElement("docs-popover-page")
export class DocsPopoverPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-popover")
  private popoverElement?: LitMaterialPopover;

  private readonly openPopover = (): void => this.popoverElement?.show();
  private readonly closePopover = (): void => this.popoverElement?.close();

  override render() {
    return html`
      <h1>Popover</h1>
      <p>A richer, click-triggered overlay — a title, body content, and optional footer actions — distinct from the tooltip.</p>

      <lit-material-button id="open-popover-btn" variant="outlined" @click=${this.openPopover}>Storage usage</lit-material-button>

      <lit-material-popover id="demo-popover" anchor="open-popover-btn">
        <span slot="header">Storage usage</span>
        You're using 4.2 GB of your 15 GB plan.
        <lit-material-button slot="footer" variant="text" @click=${this.closePopover}>Upgrade</lit-material-button>
      </lit-material-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-popover-page": DocsPopoverPage;
  }
}
