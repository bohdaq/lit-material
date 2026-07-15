import "@lit-material/button";
import "@lit-material/snackbar";
import type { LitMaterialSnackbar } from "@lit-material/snackbar";
import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-snackbar-page")
export class DocsSnackbarPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-snackbar")
  private snackbar?: LitMaterialSnackbar;

  @query("#demo-snackbar-undo")
  private snackbarUndo?: LitMaterialSnackbar;

  @state()
  private undoLog = "";

  private readonly showSnackbar = (): void => this.snackbar?.show();
  private readonly showSnackbarUndo = (): void => this.snackbarUndo?.show();
  private readonly handleUndo = (): void => {
    this.undoLog = "Undo clicked";
  };

  override render() {
    return html`
      <h1>Snackbar</h1>
      <p>Native Popover API (<code>manual</code>); auto-dismiss, hover/focus pause, queueing left to the caller.</p>

      <section>
        <lit-material-button variant="filled" @click=${this.showSnackbar}>Show snackbar</lit-material-button>
        <lit-material-button variant="outlined" @click=${this.showSnackbarUndo}>Show with action</lit-material-button>
      </section>

      <lit-material-snackbar id="demo-snackbar" duration="0">Message sent</lit-material-snackbar>

      <lit-material-snackbar id="demo-snackbar-undo" closable duration="0">
        Conversation archived
        <lit-material-button slot="action" variant="text" @click=${this.handleUndo}>Undo</lit-material-button>
      </lit-material-snackbar>
      <p>${this.undoLog}</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-snackbar-page": DocsSnackbarPage;
  }
}
