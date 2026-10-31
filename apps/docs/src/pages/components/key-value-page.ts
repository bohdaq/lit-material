import "@lit-material/key-value";
import type { KeyValueEntry } from "@lit-material/key-value";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-key-value-page")
export class DocsKeyValuePage extends LitElement {
  static override styles = [pageStyles];

  @state() private labels: KeyValueEntry[] = [
    { key: "app", value: "web" },
    { key: "tier", value: "frontend" },
  ];

  override render() {
    return html`
      <h1>Key/value editor</h1>
      <p>
        Labels, annotations, environment variables. Duplicate and missing keys are flagged; paste
        <code>KEY=value</code> lines into a key field to add several rows at once.
      </p>
      <section>
        <h2>Labels</h2>
        <lit-material-key-value-editor
          key-label="Label"
          add-label="Add label"
          key-pattern="([a-z0-9]([-a-z0-9.]*[a-z0-9])?/)?[A-Za-z0-9]([-A-Za-z0-9_.]*[A-Za-z0-9])?"
          key-pattern-message="Letters, digits, - _ . and an optional prefix/"
          .entries=${this.labels}
          @change=${(e: CustomEvent<{ entries: KeyValueEntry[] }>) => (this.labels = e.detail.entries)}
        ></lit-material-key-value-editor>
        <pre>${JSON.stringify(Object.fromEntries(this.labels.map((l) => [l.key, l.value])), null, 2)}</pre>
      </section>
      <section>
        <h2>Secret values</h2>
        <lit-material-key-value-editor
          key-label="Variable"
          add-label="Add variable"
          mask-values
          .entries=${[{ key: "DATABASE_URL", value: "postgres://app@db/app" }]}
        ></lit-material-key-value-editor>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-key-value-page": DocsKeyValuePage;
  }
}
