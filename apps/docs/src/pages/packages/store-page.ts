import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import { guidePageStyles } from "../../styles/guide-page-styles.js";
import { withBase } from "../../with-base.js";

const usageCode = [
  'import { createStore, StoreController } from "@lit-material/store";',
  'import { LitElement, html } from "lit";',
  "",
  "interface CounterState {",
  "  count: number;",
  "}",
  "",
  'type CounterAction = { type: "increment" } | { type: "decrement" };',
  "",
  "function counterReducer(state: CounterState, action: CounterAction): CounterState {",
  "  switch (action.type) {",
  '    case "increment":',
  "      return { count: state.count + 1 };",
  '    case "decrement":',
  "      return { count: state.count - 1 };",
  "  }",
  "}",
  "",
  "// One store instance, shared by however many components need it.",
  "export const counterStore = createStore(counterReducer, { count: 0 });",
  "",
  "class MyCounter extends LitElement {",
  "  // Select the whole state...",
  "  private readonly store = new StoreController(this, counterStore);",
  "",
  "  // ...or a slice, so this host only re-renders when that slice changes:",
  "  // private readonly count = new StoreController(this, counterStore, (state) => state.count);",
  "",
  "  override render() {",
  "    return html`",
  "      <p>${this.store.value.count}</p>",
  '      <button @click=${() => counterStore.dispatch({ type: "increment" })}>+</button>',
  "    `;",
  "  }",
  "}",
].join("\n");

@customElement("docs-store-page")
export class DocsStorePage extends LitElement {
  static override styles = [pageStyles, guidePageStyles];

  override render() {
    return html`
      <div class="eyebrow">App shell · @lit-material/store</div>
      <h1>Store</h1>
      <p class="lede">
        A tiny, dependency-free state store for building whole applications with lit-material — not just
        individual components. <code>createStore</code> has Redux's exact four-function shape
        (<code>getState</code>/<code>dispatch</code>/<code>subscribe</code>, driven by a pure reducer) and
        works anywhere, including during SSR, since it has no dependency on the DOM or on Lit.
        <code>StoreController</code> is the Lit reactive controller that subscribes a component to a store and
        calls <code>requestUpdate()</code> only when the selected slice of state actually changes.
      </p>

      <section class="doc-section">
        <h2>Install</h2>
        <pre><code>npm install @lit-material/store</code></pre>
      </section>

      <section class="doc-section">
        <h2>Usage</h2>
        <pre><code>${usageCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>API</h2>
        <h3><code>createStore(reducer, preloadedState)</code></h3>
        <p>Returns a <code>Store&lt;S, A&gt;</code>:</p>
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>getState(): S</code></td>
              <td>Current state.</td>
            </tr>
            <tr>
              <td><code>dispatch(action: A): A</code></td>
              <td>Runs the reducer, updates state, notifies subscribers, returns the action.</td>
            </tr>
            <tr>
              <td><code>subscribe(listener): () =&gt; void</code></td>
              <td>Registers a listener called after every dispatch; returns an unsubscribe function.</td>
            </tr>
          </tbody>
        </table>

        <h3><code>new StoreController(host, store, selector?)</code></h3>
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>.value</code></td>
              <td>The currently selected state (whole state if no <code>selector</code> given).</td>
            </tr>
            <tr>
              <td><code>selector</code></td>
              <td>Optional <code>(state: S) => V</code>. The host only re-renders when the selected value changes, not on every dispatch.</td>
            </tr>
          </tbody>
        </table>
        <p>
          Subscribes in <code>hostConnected()</code> and unsubscribes in <code>hostDisconnected()</code>, the
          same reactive-controller lifecycle <code>RippleController</code>/<code>FocusRingController</code> in
          <a href=${withBase("/packages/core")}>@lit-material/core</a> use.
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-store-page": DocsStorePage;
  }
}
