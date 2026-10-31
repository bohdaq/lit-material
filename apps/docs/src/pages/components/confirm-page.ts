import "@lit-material/button";
import "@lit-material/confirm";
import { confirm } from "@lit-material/confirm";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-confirm-page")
export class DocsConfirmPage extends LitElement {
  static override styles = [pageStyles];

  @state() private result = "";

  private async ask(options: Parameters<typeof confirm>[0]) {
    this.result = (await confirm(options)) ? "Confirmed" : "Cancelled";
  }

  override render() {
    return html`
      <h1>Confirm</h1>
      <p>
        <code>await confirm({ … })</code> for actions that need a second look. Cancel has focus, so a stray Enter doesn't confirm;
        <code>require-text</code> keeps the button disabled until the name is typed.
      </p>
      <section>
        <h2>Plain</h2>
        <lit-material-button variant="outlined" @click=${() => this.ask({ headline: "Restart the server?", message: "Open connections are drained first.", confirmLabel: "Restart" })}
          >Restart</lit-material-button
        >
      </section>
      <section>
        <h2>Destructive, type the name to confirm</h2>
        <lit-material-button
          variant="outlined"
          @click=${() =>
            this.ask({
              headline: "Delete project web?",
              message: "Its VMs, disks and addresses are deleted too. This can't be undone.",
              confirmLabel: "Delete",
              destructive: true,
              requireText: "web",
            })}
          >Delete project</lit-material-button
        >
        <span role="status">${this.result}</span>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-confirm-page": DocsConfirmPage;
  }
}
