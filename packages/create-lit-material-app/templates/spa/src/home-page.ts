import "@lit-material/button";
import { StoreController } from "@lit-material/store";
import { themeContext } from "@lit-material/core";
import { ContextConsumer } from "@lit/context";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { appStore } from "./store.js";

@customElement("home-page")
export class HomePage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      max-width: 640px;
    }
    code {
      background: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface-variant);
      padding: 0.1em 0.4em;
      border-radius: 4px;
    }
  `;

  private readonly count = new StoreController(this, appStore, (state) => state.count);
  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });

  override render() {
    return html`
      <h1>{{PROJECT_NAME}}</h1>
      <p>
        Scaffolded by <code>create-lit-material-app</code> — this page and <code>/about</code> are two
        routes rendered by <code>&lt;lit-material-router-outlet&gt;</code> from
        <code>@lit-material/router</code>; the count below lives in <code>@lit-material/store</code>
        (navigate away and back — it's still there); the color scheme
        (<strong>${this.theme.value?.colorScheme}</strong>) comes from <code>@lit-material/core</code>'s
        <code>themeContext</code>, toggled from the top bar.
      </p>
      <p>Count: <strong>${this.count.value}</strong></p>
      <lit-material-button variant="filled" @click=${() => appStore.dispatch({ type: "increment" })}>
        +1
      </lit-material-button>
      <lit-material-button variant="outlined" @click=${() => appStore.dispatch({ type: "decrement" })}>
        -1
      </lit-material-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "home-page": HomePage;
  }
}
