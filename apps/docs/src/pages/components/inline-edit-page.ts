import "@lit-material/inline-edit";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-inline-edit-page")
export class DocsInlineEditPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Inline edit</h1>
      <section>
        <p>Edit in place: Enter saves, Escape cancels. This one refuses names with spaces and takes a second to save.</p>
        <lit-material-inline-edit
          label="Project name"
          value="web-frontend"
          .validator=${(v: string) => (/\s/.test(v) ? "No spaces" : v ? "" : "Required")}
          .save=${(v: string) => new Promise<string | void>((r) => setTimeout(() => r(v === "taken" ? "That name is taken" : undefined), 1000))}
        ></lit-material-inline-edit>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-inline-edit-page": DocsInlineEditPage;
  }
}
