import "@lit-material/button";
import "@lit-material/dialog";
import type { LitMaterialDialog } from "@lit-material/dialog";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query } from "lit/decorators.js";

@customElement("docs-dialog-page")
export class DocsDialogPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-dialog")
  private dialog?: LitMaterialDialog;

  private readonly openDialog = (): void => this.dialog?.show();
  private readonly cancelDialog = (): void => this.dialog?.close("cancel");
  private readonly deleteDialog = (): void => this.dialog?.close("delete");

  override render() {
    return html`
      <h1>Dialog</h1>
      <p>Native <code>&lt;dialog&gt;</code>-based, modal, focus trap via the browser.</p>

      <lit-material-button variant="filled" @click=${this.openDialog}>Open dialog</lit-material-button>

      <lit-material-dialog id="demo-dialog">
        <span slot="icon" aria-hidden="true">⚠️</span>
        <span slot="headline">Delete file?</span>
        This action cannot be undone. The file will be permanently removed from your account.
        <div slot="actions">
          <lit-material-button variant="text" @click=${this.cancelDialog}>Cancel</lit-material-button>
          <lit-material-button variant="filled" @click=${this.deleteDialog}>Delete</lit-material-button>
        </div>
      </lit-material-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-dialog-page": DocsDialogPage;
  }
}
