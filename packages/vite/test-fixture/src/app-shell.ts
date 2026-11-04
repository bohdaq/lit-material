import { css, html, LitElement } from "lit";
import "@lit-material/router";
import { routes } from "./routes.js";

export class FixtureAppShell extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  override render() {
    return html`<header>Fixture</header>
      <main><lit-material-router-outlet .routes=${routes}></lit-material-router-outlet></main>`;
  }
}
customElements.define("fixture-app-shell", FixtureAppShell);
