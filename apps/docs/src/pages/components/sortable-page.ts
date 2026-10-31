import "@lit-material/sortable";
import type { SortDetail } from "@lit-material/sortable";
import { repeat } from "lit/directives/repeat.js";
import { state } from "lit/decorators.js";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-sortable-page")
export class DocsSortablePage extends LitElement {
  static override styles = [pageStyles];

  @state() private steps = ["Build image", "Run tests", "Push to registry", "Deploy to staging", "Smoke test"];

  private readonly onSort = (e: CustomEvent<SortDetail>) => {
    const steps = [...this.steps];
    const [moved] = steps.splice(e.detail.from, 1);
    steps.splice(e.detail.to, 0, moved!);
    this.steps = steps;
  };

  override render() {
    return html`
      <h1>Sortable</h1>
      <section>
        <p>Drag a handle, or focus one and press Space, then ↑/↓, then Space again.</p>
        <lit-material-sortable label="Steps" @sort=${this.onSort} style="max-width: 360px;">
          ${repeat(this.steps, (s) => s, (s) => html`<div data-sort-id=${s} style="display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--md-sys-color-outline-variant);">
            <button data-sort-handle aria-label=${`Reorder ${s}`} style="cursor: grab; border: 0; background: none; color: inherit; font-size: 18px;">⋮⋮</button>${s}
          </div>`)}
        </lit-material-sortable>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-sortable-page": DocsSortablePage;
  }
}
