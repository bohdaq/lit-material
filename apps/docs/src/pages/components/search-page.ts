import "@lit-material/search";
import "@lit-material/list";
import type { LitMaterialSearchBar } from "@lit-material/search";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query, state } from "lit/decorators.js";

const DESTINATIONS = ["Wi-Fi", "Bluetooth", "Display", "Sound", "Battery", "Storage", "Accessibility"];

@customElement("docs-search-page")
export class DocsSearchPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-search-bar")
  private searchBar?: LitMaterialSearchBar;

  @state()
  private query = "";

  @state()
  private selectedLog = "";

  private readonly handleInput = (): void => {
    this.query = this.searchBar?.value ?? "";
  };

  private readonly handleSelect = (event: Event): void => {
    const item = (event.target as HTMLElement).closest("lit-material-list-item");
    if (!item || !this.searchBar) return;
    this.searchBar.value = item.textContent?.trim() ?? "";
    this.selectedLog = `Selected: ${this.searchBar.value}`;
  };

  override render() {
    const matches = DESTINATIONS.filter((d) => d.toLowerCase().includes(this.query.toLowerCase()));

    return html`
      <h1>Search</h1>
      <p>
        A search bar (<code>lit-material-search-bar</code>) paired with a docked search view
        (<code>lit-material-search-view</code>) built on the Popover API. Focus the field below —
        the view opens on its own; type to filter, arrow keys highlight a suggestion, Enter picks it.
      </p>

      <div style="max-width: 480px;">
        <lit-material-search-bar
          id="demo-search-bar"
          placeholder="Search settings"
          @input=${this.handleInput}
        ></lit-material-search-bar>

        <lit-material-search-view anchor="demo-search-bar" @click=${this.handleSelect}>
          ${matches.length === 0
            ? html`<lit-material-list-item>No matches</lit-material-list-item>`
            : matches.map((d) => html`<lit-material-list-item interactive>${d}</lit-material-list-item>`)}
        </lit-material-search-view>
      </div>

      <p>${this.selectedLog}</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-search-page": DocsSearchPage;
  }
}
