import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("about-page")
export class AboutPage extends LitElement {
  override render() {
    return html`
      <h1>About</h1>
      <p>
        Add more routes in <code>app-shell.ts</code>'s <code>routes</code> array, more reducer cases in
        <code>store.ts</code>, and reach for
        <a href="https://github.com/bohdaq/lit-material/tree/main/packages/task">@lit-material/task</a>
        for data fetching or
        <a href="https://github.com/bohdaq/lit-material/tree/main/packages/form">@lit-material/form</a>
        for form validation as you grow this app. See the
        <a href="https://bohdaq.github.io/lit-material/guide/building-apps">Building apps guide</a> for all of
        lit-material's app-shell primitives wired together in one guide.
      </p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "about-page": AboutPage;
  }
}
