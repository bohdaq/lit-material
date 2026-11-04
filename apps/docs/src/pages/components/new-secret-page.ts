import "@lit-material/button";
import "@lit-material/clipboard/new-secret.js";
import { LitElement, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-new-secret-page")
export class DocsNewSecretPage extends LitElement {
  static override styles = [pageStyles];

  @state() private token = "";

  override render() {
    return html`
      <h1>New secret</h1>
      <p>A token, API key or recovery code shown once, right after it was created: the value with a copy button and a warning that it won't be shown again. Screen readers hear it appear, and focus lands on the value. A "Done" button in the <code>actions</code> slot drops it from the page.</p>
      <section>
        <lit-material-button @click=${() => (this.token = `pat_${crypto.randomUUID().replaceAll("-", "")}`)}>Create token</lit-material-button>
        ${this.token
          ? html`<lit-material-new-secret label="Access token &quot;ci&quot;" .value=${this.token} style="margin-top: 16px">
              <lit-material-button slot="actions" variant="text" @click=${() => (this.token = "")}>Done</lit-material-button>
            </lit-material-new-secret>`
          : nothing}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-new-secret-page": DocsNewSecretPage;
  }
}
