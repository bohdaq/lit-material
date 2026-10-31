import "@lit-material/dual-list";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-dual-list-page")
export class DocsDualListPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Dual list selector</h1>
      <section>
        <p>Move items between the lists: click to mark, double-click or the arrows to move, or use the keyboard.</p>
        <lit-material-dual-list-selector
          filterable
          chosen-label="Granted"
          .items=${[
            { value: "vm:read", label: "Read VMs" },
            { value: "vm:write", label: "Manage VMs" },
            { value: "disk:write", label: "Manage disks" },
            { value: "net:write", label: "Manage networks" },
            { value: "secrets:read", label: "Read secrets" },
            { value: "billing", label: "Billing", disabled: true },
          ]}
          .selected=${["vm:read"]}
        ></lit-material-dual-list-selector>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-dual-list-page": DocsDualListPage;
  }
}
