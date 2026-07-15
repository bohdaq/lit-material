import "@lit-material/router";
import "@lit-material/top-app-bar";
import "@lit-material/button";
import type { RouteConfig } from "@lit-material/router";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { navEntries, groupLabels, type NavGroup } from "./route-manifest.js";

const groupOrder: NavGroup[] = ["guide", "theme", "components"];

@customElement("docs-app-shell")
export class DocsAppShell extends LitElement {
  static override styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--md-sys-color-background);
      color: var(--md-sys-color-on-background);
    }
    .layout {
      display: flex;
      align-items: flex-start;
    }
    .sidebar {
      width: 220px;
      flex-shrink: 0;
      box-sizing: border-box;
      padding: 1rem;
      height: 100vh;
      overflow-y: auto;
      position: sticky;
      top: 0;
      border-inline-end: 1px solid var(--md-sys-color-outline-variant);
    }
    .sidebar h2 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--md-sys-color-on-surface-variant);
      margin: 1.25rem 0 0.5rem;
    }
    .sidebar h2:first-child {
      margin-top: 0;
    }
    .sidebar a {
      display: block;
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      color: var(--md-sys-color-on-surface);
      text-decoration: none;
      font-size: 0.9rem;
    }
    .sidebar a:hover {
      background: var(--md-sys-color-surface-container);
    }
    main {
      flex: 1;
      min-width: 0;
      padding: 1.5rem 2rem 4rem;
      box-sizing: border-box;
    }
  `;

  @state()
  private colorScheme: "light" | "dark" = "light";

  private readonly routes: RouteConfig<unknown>[] = navEntries.map((entry) => ({
    path: entry.path,
    render: entry.render,
  }));

  private readonly toggleTheme = (): void => {
    this.colorScheme = this.colorScheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("color-scheme", this.colorScheme);
  };

  override render() {
    return html`
      <lit-material-top-app-bar>
        lit-material docs
        <lit-material-button slot="trailing" variant="text" @click=${this.toggleTheme}>
          ${this.colorScheme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </lit-material-button>
      </lit-material-top-app-bar>
      <div class="layout">
        <nav class="sidebar">
          ${groupOrder.map((group) => {
            const entries = navEntries.filter((entry) => entry.group === group);
            if (entries.length === 0) return null;
            return html`
              <h2>${groupLabels[group]}</h2>
              ${entries.map((entry) => html`<a href=${entry.path}>${entry.label}</a>`)}
            `;
          })}
        </nav>
        <main>
          <lit-material-router-outlet .routes=${this.routes}></lit-material-router-outlet>
        </main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-app-shell": DocsAppShell;
  }
}
