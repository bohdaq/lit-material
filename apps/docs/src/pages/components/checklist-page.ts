import "@lit-material/button";
import "@lit-material/clipboard";
import "@lit-material/stepper/checklist.js";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-checklist-page")
export class DocsChecklistPage extends LitElement {
  static override styles = [pageStyles];

  @state() private invited = false;

  override render() {
    return html`
      <h1>Checklist</h1>
      <p>Getting started on a home page: what's done, what's next, and how to do it. The next task is open; a task is ticked when your app sets <code>done</code> from real state, never by a click on the box. Dismissible, and remembered as dismissed per browser with <code>storage-key</code>.</p>
      <section>
        <lit-material-checklist heading="Get started" dismissible>
          <lit-material-checklist-item label="Install the CLI" done>
            <lit-material-clipboard-copy label="Install command" value="npm install -g hitop"></lit-material-clipboard-copy>
          </lit-material-checklist-item>
          <lit-material-checklist-item label="Invite a teammate" ?done=${this.invited}>
            <p>People you invite get an email with a link to join.</p>
            <lit-material-button @click=${() => (this.invited = true)}>Invite (marks it done)</lit-material-button>
          </lit-material-checklist-item>
          <lit-material-checklist-item label="Choose a plan">
            <p>Free works for one person. Teams need a paid plan.</p>
          </lit-material-checklist-item>
        </lit-material-checklist>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-checklist-page": DocsChecklistPage;
  }
}
