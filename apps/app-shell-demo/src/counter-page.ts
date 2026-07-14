import "@lit-material/button";
import { StoreController } from "@lit-material/store";
import { themeContext } from "@lit-material/core";
import { ContextConsumer } from "@lit/context";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { counterStore } from "./store.js";

@customElement("demo-counter-page")
export class DemoCounterPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      max-width: 640px;
    }
    .count {
      font-size: 3rem;
      margin: 1rem 0;
    }
    .controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
  `;

  private readonly count = new StoreController(this, counterStore, (state) => state.count);
  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });

  override render() {
    return html`
      <h1>Counter</h1>
      <p>
        Backed by <code>@lit-material/store</code>. Navigate to <a href="/">Home</a> or
        <a href="/about">About</a> and back — the count is unchanged, because the store is a plain module-level
        instance, not component state. Color scheme right now: <strong>${this.theme.value?.colorScheme}</strong>.
      </p>
      <div class="count">${this.count.value}</div>
      <div class="controls">
        <lit-material-button variant="outlined" @click=${() => counterStore.dispatch({ type: "decrement" })}>
          −
        </lit-material-button>
        <lit-material-button variant="filled" @click=${() => counterStore.dispatch({ type: "increment" })}>
          +
        </lit-material-button>
        <lit-material-button variant="text" @click=${() => counterStore.dispatch({ type: "reset" })}>
          Reset
        </lit-material-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-counter-page": DemoCounterPage;
  }
}
