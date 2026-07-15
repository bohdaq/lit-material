import "@lit-material/router";
import "@lit-material/button";
import { RouteController, type RouteConfig } from "@lit-material/router";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { navEntries, groupLabels, type NavGroup } from "./route-manifest.js";

const groupOrder: NavGroup[] = ["guide", "theme", "packages", "components"];

@customElement("docs-app-shell")
export class DocsAppShell extends LitElement {
  static override styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--md-sys-color-background);
      color: var(--md-sys-color-on-background);
      font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
    }

    header {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 0 1.5rem;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      background: color-mix(in srgb, var(--md-sys-color-background) 78%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .wordmark {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--md-sys-color-on-background);
      text-decoration: none;
      border-bottom: none !important;
    }
    .wordmark .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--md-sys-color-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent);
    }

    .layout {
      display: flex;
      align-items: flex-start;
    }

    .sidebar {
      width: 240px;
      flex-shrink: 0;
      box-sizing: border-box;
      padding: 2rem 1rem 2rem 1.5rem;
      height: calc(100vh - 60px);
      overflow-y: auto;
      position: sticky;
      top: 60px;
      border-inline-end: 1px solid var(--md-sys-color-outline-variant);
    }

    .sidebar h2 {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.65;
      margin: 1.75rem 0.6rem 0.5rem;
    }
    .sidebar h2:first-child {
      margin-top: 0;
    }

    .sidebar a {
      position: relative;
      display: block;
      padding: 0.4rem 0.6rem;
      margin-inline-start: 0.15rem;
      border-radius: 8px;
      color: var(--md-sys-color-on-surface-variant);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition:
        background 120ms ease,
        color 120ms ease;
    }
    .sidebar a:hover {
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
    }
    .sidebar a.active {
      background: var(--md-sys-color-surface-container-high);
      color: var(--md-sys-color-primary);
      font-weight: 600;
    }
    .sidebar a.active::before {
      content: "";
      position: absolute;
      inset-inline-start: -0.9rem;
      top: 22%;
      bottom: 22%;
      width: 2px;
      border-radius: 2px;
      background: var(--md-sys-color-primary);
    }

    main {
      flex: 1;
      min-width: 0;
      max-width: 880px;
      padding: 3.5rem 3rem 6rem;
      box-sizing: border-box;
    }
  `;

  @state()
  private colorScheme: "light" | "dark" = "light";

  private readonly route = new RouteController(this, () => []);

  private readonly routes: RouteConfig<unknown>[] = navEntries.map((entry) => ({
    path: entry.path,
    render: entry.render,
  }));

  private readonly toggleTheme = (): void => {
    this.colorScheme = this.colorScheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("color-scheme", this.colorScheme);
  };

  override render() {
    const currentPath = this.route.current.path;
    return html`
      <header>
        <a class="wordmark" href="/"><span class="dot"></span>lit-material</a>
        <lit-material-button variant="text" @click=${this.toggleTheme}>
          ${this.colorScheme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </lit-material-button>
      </header>
      <div class="layout">
        <nav class="sidebar">
          ${groupOrder.map((group) => {
            const entries = navEntries.filter((entry) => entry.group === group);
            if (entries.length === 0) return null;
            return html`
              <h2>${groupLabels[group]}</h2>
              ${entries.map(
                (entry) =>
                  html`<a href=${entry.path} class=${entry.path === currentPath ? "active" : ""}
                    >${entry.label}</a
                  >`,
              )}
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
