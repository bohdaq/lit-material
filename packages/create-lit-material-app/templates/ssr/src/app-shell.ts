import "@lit-material/router";
import "@lit-material/top-app-bar";
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { routes } from "./routes.js";

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
      padding-inline: 1rem;
    }
    nav a {
      color: var(--md-sys-color-on-surface);
    }
    main {
      max-width: 48rem;
      margin-inline: auto;
      padding: 1.5rem;
    }
  `;

  override render() {
    return html`
      <lit-material-top-app-bar>
        {{PROJECT_NAME}}
        <nav slot="trailing">
          <a href="/">Posts</a>
          <a href="/about">About</a>
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
