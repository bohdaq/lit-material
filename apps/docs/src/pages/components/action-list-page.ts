import "@lit-material/button";
import "@lit-material/icon-button";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-action-list-page")
export class DocsActionListPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Action list</h1>
      <section>
        <h2>A form's actions, at the end</h2>
        <lit-material-action-list align="end" label="Form actions">
          <lit-material-button variant="text">Cancel</lit-material-button>
          <lit-material-button>Save</lit-material-button>
        </lit-material-action-list>
      </section>
      <section>
        <h2>Groups</h2>
        <lit-material-action-list>
          <lit-material-action-list>
            <lit-material-button variant="outlined">Import</lit-material-button>
            <lit-material-button variant="outlined">Export</lit-material-button>
          </lit-material-action-list>
          <lit-material-action-list>
            <lit-material-button variant="tonal">Run all</lit-material-button>
          </lit-material-action-list>
        </lit-material-action-list>
      </section>
      <section>
        <h2>Spread out</h2>
        <lit-material-action-list align="between">
          <lit-material-button variant="text">Back</lit-material-button>
          <lit-material-button>Next</lit-material-button>
        </lit-material-action-list>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-action-list-page": DocsActionListPage;
  }
}
