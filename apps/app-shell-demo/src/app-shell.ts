import "@lit-material/router";
import "@lit-material/top-app-bar";
import "@lit-material/tabs";
import "@lit-material/icon-button";
import "@lit-material/button";
import type { RouteConfig } from "@lit-material/router";
import { RouteController, navigate } from "@lit-material/router";
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

interface NavEntry {
  path: string;
  label: string;
  render: () => unknown;
}

const navEntries: NavEntry[] = [
  { path: "/", label: "Home", render: () => html`<demo-home-page></demo-home-page>` },
  { path: "/counter", label: "Counter", render: () => html`<demo-counter-page></demo-counter-page>` },
  { path: "/about", label: "About", render: () => html`<demo-about-page></demo-about-page>` },
  { path: "/data", label: "Data", render: () => html`<demo-data-page></demo-data-page>` },
  { path: "/settings", label: "Settings", render: () => html`<demo-settings-page></demo-settings-page>` },
];

const routes: RouteConfig<unknown>[] = navEntries.map(({ path, render }) => ({ path, render }));

@customElement("app-shell")
export class AppShell extends LitElement {
  static override styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--md-sys-color-background);
      color: var(--md-sys-color-on-background);
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    main {
      max-width: 640px;
      margin: 0 auto;
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

  // Tracks the current route without owning an outlet — the router's own documented pattern for a
  // component that needs to react to navigation (e.g. highlighting the active tab) without rendering the
  // routed content itself. Keeps <lit-material-tabs>'s `selected` index in sync even when navigation
  // happens via a plain link click the outlet intercepts, not just via the tabs themselves.
  private readonly routeState = new RouteController(this, () => routes);

  private get selectedTabIndex(): number {
    const index = navEntries.findIndex((entry) => entry.path === this.routeState.current.path);
    return index === -1 ? 0 : index;
  }

  private readonly handleTabChange = (event: Event): void => {
    const tabs = event.target as HTMLElementTagNameMap["lit-material-tabs"];
    const entry = navEntries[tabs.selected];
    if (entry) navigate(entry.path);
  };

  private readonly handleThemeToggle = (event: Event): void => {
    const selected = (event.target as HTMLElementTagNameMap["lit-material-icon-button"]).selected;
    const colorScheme = selected ? "dark" : "light";
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
        <div class="actions" slot="trailing">
          <lit-material-button variant="text" @click=${this.toggleLocale}>
            ${this.locale.locale === "ar" ? "EN" : "AR"}
          </lit-material-button>
          <lit-material-icon-button
            toggle
            .selected=${this.theme.colorScheme === "dark"}
            aria-label="Toggle theme"
            @change=${this.handleThemeToggle}
          >
            <span slot="icon">🌙</span>
            <span slot="selected-icon">☀️</span>
          </lit-material-icon-button>
        </div>
      </lit-material-top-app-bar>
      <lit-material-tabs .selected=${this.selectedTabIndex} @change=${this.handleTabChange}>
        ${navEntries.map((entry) => html`<lit-material-tab>${entry.label}</lit-material-tab>`)}
      </lit-material-tabs>
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
