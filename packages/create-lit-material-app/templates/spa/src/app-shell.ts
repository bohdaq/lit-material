import "@lit-material/router";
import "@lit-material/top-app-bar";
import "@lit-material/button";
import type { RouteConfig } from "@lit-material/router";
import { themeContext, type ThemeState } from "@lit-material/core";
import { ContextProvider } from "@lit/context";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./home-page.js";
import "./about-page.js";

const routes: RouteConfig<unknown>[] = [
  { path: "/", render: () => html`<home-page></home-page>` },
  { path: "/about", render: () => html`<about-page></about-page>` },
];

@customElement("app-shell")
export class AppShell extends LitElement {
  static override styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--md-sys-color-background);
      color: var(--md-sys-color-on-background);
    }
    nav {
      display: flex;
      gap: 1rem;
      align-items: center;
      padding-inline: 1rem;
    }
    nav a {
      color: var(--md-sys-color-on-surface);
    }
    main {
      padding: 1.5rem;
    }
  `;

  @state()
  private theme: ThemeState = { colorScheme: "light" };

  private readonly themeProvider = new ContextProvider(this, {
    context: themeContext,
    initialValue: this.theme,
  });

  private readonly toggleTheme = (): void => {
    const colorScheme = this.theme.colorScheme === "dark" ? "light" : "dark";
    this.theme = { ...this.theme, colorScheme };
    this.themeProvider.setValue(this.theme);
    document.documentElement.setAttribute("color-scheme", colorScheme);
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.documentElement.setAttribute("color-scheme", this.theme.colorScheme);
  }

  override render() {
    return html`
      <lit-material-top-app-bar>
        {{PROJECT_NAME}}
        <nav slot="trailing">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <lit-material-button variant="text" @click=${this.toggleTheme}>
            ${this.theme.colorScheme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </lit-material-button>
        </nav>
      </lit-material-top-app-bar>
      <main>
        <lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-shell": AppShell;
  }
}
