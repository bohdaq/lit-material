import "@lit-material/router";
import "@lit-material/top-app-bar";
import "@lit-material/navigation/adaptive-navigation.js";
import "@lit-material/menu";
import "@lit-material/list";
import "@lit-material/avatar";
import "@lit-material/button";
import "@lit-material/color-scheme";
import { navigate, RouteController, type RouteConfig } from "@lit-material/router";
import type { LitMaterialMenu } from "@lit-material/menu";
import type { NavigationDestination } from "@lit-material/navigation";
import { LitElement, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { orgs, type Org } from "./api.js";
import { expandIcon, homeIcon, peopleIcon, settingsIcon } from "./icons.js";
import "./pages/home-page.js";
import "./pages/members-page.js";
import "./pages/settings-page.js";
import "./pages/sign-in-page.js";

// Real paths (/members), not #/ hashes: dev and `vite preview` serve index.html for every path. In production,
// have your server do the same (rws: `spa_fallback = "index.html"`).
const routes: RouteConfig<unknown>[] = [
  { path: "/sign-in", title: "Sign in", render: () => html`<sign-in-page></sign-in-page>` },
  { path: "/", title: "Home", render: () => html`<home-page></home-page>` },
  { path: "/members", title: "Members", render: () => html`<members-page></members-page>` },
  { path: "/settings", title: "Settings", render: () => html`<settings-page></settings-page>` },
  { path: "/*", title: "Not found", render: () => html`<p>That page doesn't exist. <a href="/">Go home</a></p>` },
];

const destinations: (NavigationDestination & { href: string })[] = [
  { label: "Home", icon: homeIcon, href: "/" },
  { label: "Members", icon: peopleIcon, href: "/members" },
  { label: "Settings", icon: settingsIcon, href: "/settings" },
];

/**
 * The console frame: a top bar with the organization switcher and the account menu, navigation that is a
 * drawer, a rail or a bottom bar depending on the window, and the routed page. The sign-in page gets the
 * whole window.
 */
@customElement("app-shell")
export class AppShell extends LitElement {
  static override styles = css`
    :host {
      display: grid;
      grid-template: "bar bar" auto "nav main" 1fr / auto 1fr;
      min-height: 100vh;
    }
    :host([bare]) {
      display: block;
    }
    lit-material-top-app-bar {
      grid-area: bar;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    lit-material-adaptive-navigation {
      grid-area: nav;
    }
    main {
      grid-area: main;
      min-width: 0;
      box-sizing: border-box;
      width: 100%;
      max-width: 1120px;
      padding: 24px;
    }
    .org {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-inline-start: 8px;
      padding: 6px 8px 6px 12px;
      border: 0;
      border-radius: 8px;
      background: none;
      color: inherit;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .org:hover {
      background: var(--md-sys-color-surface-container-high);
    }
    .org:focus-visible {
      outline: 2px solid var(--md-sys-color-primary);
    }
    .org svg {
      width: 20px;
      height: 20px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 4px;
      padding-inline-end: 8px;
    }
    .account {
      padding: 4px;
      border: 0;
      border-radius: 50%;
      background: none;
      cursor: pointer;
    }
    .account:focus-visible {
      outline: 2px solid var(--md-sys-color-primary);
    }
    @media (max-width: 599.98px) {
      :host {
        grid-template: "bar" auto "main" 1fr / 1fr;
        padding-bottom: 80px;
      }
      lit-material-adaptive-navigation {
        position: fixed;
        inset: auto 0 0;
        z-index: 1;
      }
      main {
        padding: 16px;
      }
    }
  `;

  private readonly route = new RouteController(this, () => routes);

  @state() private org: Org = orgs[0]!;
  @query("#org-menu") private readonly orgMenu!: LitMaterialMenu;
  @query("#account-menu") private readonly accountMenu!: LitMaterialMenu;

  override updated(): void {
    this.toggleAttribute("bare", this.route.current.path === "/sign-in");
  }

  override render() {
    const outlet = html`<lit-material-router-outlet .routes=${routes} title-template="%s · {{PROJECT_NAME}}"></lit-material-router-outlet>`;
    if (this.route.current.path === "/sign-in") return outlet;
    const path = this.route.current.path;
    const selected = destinations.findIndex((d) => (d.href === "/" ? path === "/" : path.startsWith(d.href)));
    return html`
      <lit-material-top-app-bar>
        <button slot="leading" class="org" @click=${(e: Event) => this.orgMenu.show(e.currentTarget as HTMLElement)}>
          ${this.org.name} ${expandIcon}
        </button>
        <div slot="trailing" class="actions">
          <lit-material-color-scheme-toggle></lit-material-color-scheme-toggle>
          <button class="account" aria-label="Account" @click=${(e: Event) => this.accountMenu.show(e.currentTarget as HTMLElement)}>
            <lit-material-avatar initials="AL" alt=""></lit-material-avatar>
          </button>
        </div>
      </lit-material-top-app-bar>
      <lit-material-menu id="org-menu">
        ${orgs.map(
          (org) => html`<lit-material-list-item interactive ?selected=${org.id === this.org.id} @click=${() => (this.org = org)}>
            ${org.name}
          </lit-material-list-item>`,
        )}
      </lit-material-menu>
      <lit-material-menu id="account-menu">
        <lit-material-list-item interactive @click=${() => navigate("/settings")}>Settings</lit-material-list-item>
        <lit-material-list-item interactive @click=${() => navigate("/sign-in")}>Sign out</lit-material-list-item>
      </lit-material-menu>
      <lit-material-adaptive-navigation label="Main" .destinations=${destinations} .selected=${selected}></lit-material-adaptive-navigation>
      <main>${outlet}</main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-shell": AppShell;
  }
}
