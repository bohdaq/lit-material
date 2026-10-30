import "@lit-material/table";
import "@lit-material/status";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import type { TableColumn } from "@lit-material/table";

type Backend = { url: string; weight: number; healthy: boolean };

const columns: TableColumn<Backend>[] = [
  { key: "url", label: "Backend", mono: true },
  { key: "weight", label: "Weight", numeric: true },
  {
    key: "healthy",
    label: "Health",
    render: (row) => html`<lit-material-status status=${row.healthy ? "ok" : "error"}>${row.healthy ? "Healthy" : "Failing checks"}</lit-material-status>`,
  },
];

const rows: Backend[] = [
  { url: "http://10.0.0.5:8080", weight: 3, healthy: true },
  { url: "http://10.0.0.6:8080", weight: 1, healthy: true },
  { url: "http://10.0.0.7:8080", weight: 1, healthy: false },
];

@customElement("docs-table-page")
export class DocsTablePage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Table</h1>
      <p>A real <code>&lt;table&gt;</code> from data: caption, column headers, numeric and monospace columns, a scroll container.</p>
      <lit-material-table caption="Backends of upstream web" .columns=${columns} .rows=${rows}></lit-material-table>
      <section>
        <h2>Compact, empty</h2>
        <lit-material-table density="compact" .columns=${columns} .rows=${[]}><span slot="empty">No backends configured.</span></lit-material-table>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-table-page": DocsTablePage;
  }
}
