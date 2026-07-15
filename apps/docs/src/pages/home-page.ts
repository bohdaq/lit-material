import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("docs-home-page")
export class DocsHomePage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      max-width: 720px;
    }
    pre {
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    code {
      background: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface-variant);
      padding: 0.1em 0.4em;
      border-radius: 4px;
    }
    ol {
      padding-left: 1.2rem;
    }
    li {
      margin-bottom: 1.5rem;
    }
  `;

  override render() {
    return html`
      <h1>lit-material</h1>
      <p>
        A Material Design 3 web component collection built with <a href="https://lit.dev/" target="_blank">Lit</a>,
        published as independently installable, framework-agnostic packages — one package per component, no
        shared mega-bundle, no required adapter layer.
      </p>

      <ol>
        <li>
          <strong>Link the design tokens once</strong>, at the document root — every component reads its colors,
          type, shape, elevation, and motion from these CSS custom properties, so this only needs to happen once
          per page regardless of how many components you use.
          <pre><code>&lt;link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" /&gt;</code></pre>
          Dark mode follows <code>prefers-color-scheme</code> automatically; force it either way with a
          <code>color-scheme="light"</code> or <code>color-scheme="dark"</code> attribute on <code>&lt;html&gt;</code>
          (see the <a href="/theme">theme builder</a> for generating your own palette from a seed color).
        </li>
        <li>
          <strong>Install only the components you actually use</strong> — each one is its own npm package.
          <pre><code>npm install @lit-material/button @lit-material/text-field</code></pre>
          <pre><code>import "@lit-material/button";
import "@lit-material/text-field";</code></pre>
          <pre><code>&lt;lit-material-button variant="filled"&gt;Save&lt;/lit-material-button&gt;
&lt;lit-material-text-field label="Name"&gt;&lt;/lit-material-text-field&gt;</code></pre>
          Browse every component's live playground and API in the sidebar.
        </li>
        <li>
          <strong>Building a whole app, not just a page?</strong> <code>@lit-material/router</code> and
          <code>@lit-material/store</code> give you a router and a Redux-shaped state store, and
          <code>@lit-material/core</code>'s <code>themeContext</code> threads theme state through a component
          tree without prop drilling — the
          <a href="https://github.com/bohdaq/lit-material/blob/main/spec/BUILDING_APPS.md" target="_blank"
            >BUILDING_APPS.md guide</a
          >
          walks through all three wired together.
        </li>
      </ol>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-home-page": DocsHomePage;
  }
}
