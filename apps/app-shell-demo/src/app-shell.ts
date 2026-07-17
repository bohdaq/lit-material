import "@lit-material/router";
import "@lit-material/top-app-bar";
import "@lit-material/button";
import type { RouteConfig } from "@lit-material/router";
import { themeContext, localeContext, type ThemeState, type LocaleState } from "@lit-material/core";
import { ContextProvider } from "@lit/context";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Locale } from "./i18n.js";
import "./home-page.js";
import "./counter-page.js";
import "./about-page.js";
import "./data-page.js";
import "./settings-page.js";

const routes: RouteConfig<unknown>[] = [
  { path: "/", render: () => html`<demo-home-page></demo-home-page>` },
  { path: "/counter", render: () => html`<demo-counter-page></demo-counter-page>` },
  { path: "/about", render: () => html`<demo-about-page></demo-about-page>` },
  { path: "/data", render: () => html`<demo-data-page></demo-data-page>` },
  { path: "/settings", render: () => html`<demo-settings-page></demo-settings-page>` },
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
      padding: 0 1rem;
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

  @state()
  private locale: LocaleState = { locale: "en", direction: "ltr" };

  private readonly themeProvider = new ContextProvider(this, {
    context: themeContext,
    initialValue: this.theme,
  });

  private readonly localeProvider = new ContextProvider(this, {
    context: localeContext,
    initialValue: this.locale,
  });

  private readonly toggleTheme = (): void => {
    const colorScheme = this.theme.colorScheme === "dark" ? "light" : "dark";
    this.theme = { ...this.theme, colorScheme };
    this.themeProvider.setValue(this.theme);
    document.documentElement.setAttribute("color-scheme", colorScheme);
  };

  private readonly toggleLocale = (): void => {
    const locale: Locale = this.locale.locale === "en" ? "ar" : "en";
    const direction = locale === "ar" ? "rtl" : "ltr";
    this.locale = { locale, direction };
    this.localeProvider.setValue(this.locale);
    document.documentElement.dir = direction;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.documentElement.setAttribute("color-scheme", this.theme.colorScheme);
  }

  override render() {
    return html`
      <lit-material-top-app-bar>
        lit-material app-shell demo
        <nav slot="trailing">
          <a href="/">Home</a>
          <a href="/counter">Counter</a>
          <a href="/about">About</a>
          <a href="/data">Data</a>
          <a href="/settings">Settings</a>
          <lit-material-button variant="text" @click=${this.toggleLocale}>
            ${this.locale.locale === "ar" ? "EN" : "AR"}
          </lit-material-button>
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
