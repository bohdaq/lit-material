import "@lit-material/list";
import "@lit-material/menu";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

const APPS = [
  ["Grafana", "Dashboards and alerts"],
  ["Billing portal", "Invoices and payment methods"],
  ["Docs", "Guides and API reference"],
  ["Status", "Incidents and uptime"],
];

@customElement("docs-app-launcher-page")
export class DocsAppLauncherPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>App launcher</h1>
      <section>
        <p>A grid button for a top bar that opens the other apps a person can go to. <code>searchable</code> adds a filter field.</p>
        <lit-material-app-launcher searchable>
          ${APPS.map(
            ([name, about]) => html`<lit-material-list-item href="#">${name}<span slot="supporting-text">${about}</span></lit-material-list-item>`,
          )}
        </lit-material-app-launcher>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-app-launcher-page": DocsAppLauncherPage;
  }
}
