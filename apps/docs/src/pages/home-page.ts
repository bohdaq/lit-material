import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../styles/page-styles.js";

@customElement("docs-home-page")
export class DocsHomePage extends LitElement {
  static override styles = [
    pageStyles,
    css`
      :host {
        max-width: 760px;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--md-sys-color-primary);
        margin-bottom: 1rem;
      }
      .eyebrow::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--md-sys-color-primary);
      }

      .lede {
        font-size: 1.1rem;
        max-width: 56ch;
      }

      .stats {
        display: flex;
        gap: 2rem;
        margin: 2rem 0 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
      }
      .stat b {
        display: block;
        font-size: 1.75rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--md-sys-color-on-background);
      }
      .stat span {
        font-size: 0.78rem;
        color: var(--md-sys-color-on-surface-variant);
      }

      .steps {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .step {
        display: block;
        padding: 1.75rem;
        margin: 0;
      }
      .step .index {
        font-family: "JetBrains Mono", ui-monospace, monospace;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--md-sys-color-primary);
        margin-bottom: 0.5rem;
      }
      .step h3 {
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        margin: 0 0 0.5rem;
      }
    `,
  ];

  override render() {
    return html`
      <div class="eyebrow">Material Design 3 for Lit</div>
      <h1>lit-material</h1>
      <p class="lede">
        A Material Design 3 web component collection built with <a href="https://lit.dev/" target="_blank">Lit</a>
        — one package per component, no shared mega-bundle, no required adapter layer. Framework-agnostic,
        SSR-ready, and small enough to actually read the source of.
      </p>

      <div class="stats">
        <div class="stat"><b>24</b><span>components</span></div>
        <div class="stat"><b>31</b><span>packages</span></div>
        <div class="stat"><b>0</b><span>runtime deps beyond Lit</span></div>
      </div>

      <div class="steps">
        <section class="step">
          <div class="index">01</div>
          <h3>Link the design tokens once</h3>
          <p>
            Every component reads its colors, type, shape, elevation, and motion from these CSS custom
            properties — this only needs to happen once per page, at the document root, regardless of how many
            components you use.
          </p>
          <pre><code>&lt;link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" /&gt;</code></pre>
          <p>
            Dark mode follows <code>prefers-color-scheme</code> automatically; force it either way with a
            <code>color-scheme="light"</code> or <code>color-scheme="dark"</code> attribute on
            <code>&lt;html&gt;</code> — or generate your own palette from a seed color on the
            <a href="/theme">theme builder</a>.
          </p>
        </section>

        <section class="step">
          <div class="index">02</div>
          <h3>Install only what you use</h3>
          <p>Each component is its own npm package.</p>
          <pre><code>npm install @lit-material/button @lit-material/text-field</code></pre>
          <pre><code>import "@lit-material/button";
import "@lit-material/text-field";</code></pre>
          <pre><code>&lt;lit-material-button variant="filled"&gt;Save&lt;/lit-material-button&gt;
&lt;lit-material-text-field label="Name"&gt;&lt;/lit-material-text-field&gt;</code></pre>
          <p>Browse every component's live playground and API in the sidebar.</p>
        </section>

        <section class="step">
          <div class="index">03</div>
          <h3>Building a whole app?</h3>
          <p>
            <code>@lit-material/router</code> and <code>@lit-material/store</code> give you a router and a
            Redux-shaped state store; <code>@lit-material/core</code>'s <code>themeContext</code> and
            <code>localeContext</code> thread theme and locale state through a component tree without prop
            drilling; <code>@lit-material/task</code> and <code>@lit-material/form</code> add data-fetching
            and form-validation controllers with the same headless, bring-your-own-rendering shape. The
            <a href="/guide/building-apps">Building apps guide</a>
            walks through all of them wired together, or skip straight to a running starting point:
          </p>
          <pre><code>npm create lit-material-app my-app</code></pre>
        </section>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-home-page": DocsHomePage;
  }
}
