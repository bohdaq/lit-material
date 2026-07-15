import "@lit-material/top-app-bar";
import "@lit-material/icon-button";
import type { LitMaterialTopAppBar } from "@lit-material/top-app-bar";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-top-app-bar-page")
export class DocsTopAppBarPage extends LitElement {
  static override styles = [pageStyles];

  @query("#scroll-demo lit-material-top-app-bar")
  private barInScrollDemo?: LitMaterialTopAppBar;

  @query("#scroll-demo")
  private scrollDemo?: HTMLDivElement;

  override firstUpdated(): void {
    if (this.scrollDemo && this.barInScrollDemo) {
      this.barInScrollDemo.scrollTarget = this.scrollDemo;
    }
  }

  override render() {
    return html`
      <h1>Top App Bar</h1>
      <p>Center-aligned, small, medium, large variants.</p>

      <section>
        <lit-material-top-app-bar variant="center-aligned">Center-aligned</lit-material-top-app-bar>
      </section>

      <section>
        <div
          id="scroll-demo"
          style="
            max-width: 480px;
            height: 180px;
            overflow-y: auto;
            border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
            border-radius: 12px;
          "
        >
          <lit-material-top-app-bar style="position: sticky; top: 0; z-index: 1;">
            Inbox
            <lit-material-icon-button slot="leading" aria-label="Menu">☰</lit-material-icon-button>
            <lit-material-icon-button slot="trailing" aria-label="Search">🔍</lit-material-icon-button>
            <lit-material-icon-button slot="trailing" aria-label="More options">⋮</lit-material-icon-button>
          </lit-material-top-app-bar>
          <p style="padding: 16px; margin: 0;">
            Scroll this panel — the bar picks up elevation once its own <code>scrollTarget</code> passes the
            threshold, not the page's scroll.
          </p>
          <p style="padding: 0 16px 200px; margin: 0;">Keep scrolling…</p>
        </div>
      </section>

      <section>
        <lit-material-top-app-bar variant="medium">
          Medium
          <lit-material-icon-button slot="leading" aria-label="Menu">☰</lit-material-icon-button>
          <lit-material-icon-button slot="trailing" aria-label="More options">⋮</lit-material-icon-button>
        </lit-material-top-app-bar>
      </section>

      <section>
        <lit-material-top-app-bar variant="large">
          Large
          <lit-material-icon-button slot="leading" aria-label="Menu">☰</lit-material-icon-button>
          <lit-material-icon-button slot="trailing" aria-label="More options">⋮</lit-material-icon-button>
        </lit-material-top-app-bar>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-top-app-bar-page": DocsTopAppBarPage;
  }
}
