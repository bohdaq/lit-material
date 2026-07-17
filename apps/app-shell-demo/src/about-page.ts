import "@lit-material/card";
import "@lit-material/list";
import "@lit-material/button";
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
    }
    lit-material-list {
      margin: 0 0 1.25rem;
    }
    lit-material-button {
      margin-top: 0.5rem;
    }
  `;

  private readonly count = new StoreController(this, counterStore, (state) => state.count);
  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });

  override render() {
    return html`
      <lit-material-card variant="elevated">
        <h1>About this demo</h1>
        <lit-material-list>
          <lit-material-list-item divider>
            <code slot="overline">@lit-material/router</code>
            <span slot="supporting-text"
              >&lt;lit-material-router-outlet&gt; in the app shell, intercepting same-origin link clicks so
              navigation never reloads the page.</span
            >
            Routing
          </lit-material-list-item>
          <lit-material-list-item divider>
            <code slot="overline">@lit-material/store</code>
            <span slot="supporting-text"
              >A Redux-shaped store shared across every route. Count carried over from the counter page.</span
            >
            State: ${this.count.value}
          </lit-material-list-item>
          <lit-material-list-item>
            <code slot="overline">@lit-material/core</code>
            <span slot="supporting-text"
              >themeContext, provided once in the app shell, consumed here via @lit/context.</span
            >
            Theme: ${this.theme.value?.colorScheme}
          </lit-material-list-item>
        </lit-material-list>
        <lit-material-button variant="text" href="https://bohdaq.github.io/lit-material/guide/building-apps">
          See the Building apps guide →
        </lit-material-button>
      </lit-material-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-about-page": DemoAboutPage;
  }
}
