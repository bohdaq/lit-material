import { StoreController } from "@lit-material/store";
import { themeContext } from "@lit-material/core";
import { ContextConsumer } from "@lit/context";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { counterStore } from "./store.js";

@customElement("demo-about-page")
export class DemoAboutPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      max-width: 640px;
    }
    ul {
      padding-left: 1.2rem;
    }
  `;

  private readonly count = new StoreController(this, counterStore, (state) => state.count);
  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });

  override render() {
    return html`
      <h1>About this demo</h1>
      <ul>
        <li><code>@lit-material/router</code> — <code>&lt;lit-material-router-outlet&gt;</code> in the app
          shell, intercepting same-origin link clicks so navigation never reloads the page.</li>
        <li><code>@lit-material/store</code> — a Redux-shaped store shared across every route. Count carried
          over from the counter page: <strong>${this.count.value}</strong>.</li>
        <li><code>@lit-material/core</code>'s <code>themeContext</code> — provided once in the app shell,
          consumed here via <code>@lit/context</code>. Current scheme:
          <strong>${this.theme.value?.colorScheme}</strong>.</li>
      </ul>
      <p>See <code>spec/BUILDING_APPS.md</code> in the repo for the full write-up.</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-about-page": DemoAboutPage;
  }
}
