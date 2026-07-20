import "@lit-material/button";
import "@lit-material/sheet";
import type { LitMaterialSideSheet, LitMaterialBottomSheet } from "@lit-material/sheet";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query } from "lit/decorators.js";

@customElement("docs-sheet-page")
export class DocsSheetPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-side-sheet")
  private sideSheet?: LitMaterialSideSheet;

  @query("#demo-bottom-sheet")
  private bottomSheet?: LitMaterialBottomSheet;

  private readonly openSideSheet = (): void => this.sideSheet?.show();
  private readonly closeSideSheet = (): void => this.sideSheet?.close();
  private readonly openBottomSheet = (): void => this.bottomSheet?.show();
  private readonly closeBottomSheet = (): void => this.bottomSheet?.close();

  override render() {
    return html`
      <h1>Sheet</h1>
      <p>Side sheet and bottom sheet, both native <code>&lt;dialog&gt;</code>-based (modal by default for bottom sheet).</p>

      <section>
        <h2>Side Sheet</h2>
        <lit-material-button variant="outlined" @click=${this.openSideSheet}>Open details</lit-material-button>

        <lit-material-side-sheet id="demo-side-sheet" variant="modal">
          <span slot="header">Details</span>
          <p>Contextual content lives here — filters, a form, a details panel.</p>
          <lit-material-button variant="text" @click=${this.closeSideSheet}>Close</lit-material-button>
        </lit-material-side-sheet>
      </section>

      <section>
        <h2>Bottom Sheet</h2>
        <lit-material-button variant="outlined" @click=${this.openBottomSheet}>Open actions</lit-material-button>

        <lit-material-bottom-sheet id="demo-bottom-sheet">
          <span slot="header">More actions</span>
          <p>Share, save, or delete — a bottom sheet is the go-to spot for a short action list.</p>
          <lit-material-button variant="text" @click=${this.closeBottomSheet}>Close</lit-material-button>
        </lit-material-bottom-sheet>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-sheet-page": DocsSheetPage;
  }
}
