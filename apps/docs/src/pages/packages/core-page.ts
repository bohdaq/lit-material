import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import { guidePageStyles } from "../../styles/guide-page-styles.js";
import { withBase } from "../../with-base.js";

const themeCode = [
  'import { themeContext, type ThemeState } from "@lit-material/core";',
  'import { ContextProvider, ContextConsumer } from "@lit/context";',
  'import { LitElement, html } from "lit";',
  "",
  "class AppShell extends LitElement {",
  "  private readonly themeProvider = new ContextProvider(this, {",
  "    context: themeContext,",
  '    initialValue: { colorScheme: "auto" } satisfies ThemeState,',
  "  });",
  "",
  "  override render() {",
  "    return html`<slot></slot>`;",
  "  }",
  "}",
  "",
  "class ThemedWidget extends LitElement {",
  '  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });',
  "",
  "  override render() {",
  "    return html`<p>Color scheme: ${this.theme.value?.colorScheme}</p>`;",
  "  }",
  "}",
].join("\n");

const localeCode = [
  'import { localeContext, type LocaleState } from "@lit-material/core";',
  'import { ContextProvider } from "@lit/context";',
  "",
  "class AppShell extends LitElement {",
  "  private readonly locale = new ContextProvider(this, {",
  "    context: localeContext,",
  '    initialValue: { locale: "en" } satisfies LocaleState,',
  "  });",
  "}",
].join("\n");

@customElement("docs-core-page")
export class DocsCorePage extends LitElement {
  static override styles = [pageStyles, guidePageStyles];

  override render() {
    return html`
      <div class="eyebrow">App shell · <code>@lit-material/core</code></div>
      <h1>Core</h1>
      <p class="lede">
        Shared Lit reactive controllers used across <code>lit-material</code> components:
        <code>RippleController</code> (press state from the pointer, drawn on a state layer element) and
        <code>FocusRingController</code> (tells keyboard focus from pointer focus, for an accessible focus
        ring). Those two are internal building blocks for other <code>@lit-material/*</code> packages, not yet
        meant as a public API for general use.
      </p>
      <p>
        <code>themeContext</code> and <code>localeContext</code> are different: they are meant to be used
        directly by apps built with <code>lit-material</code>.
      </p>

      <section class="doc-section">
        <h2>Theme context</h2>
        <p>
          A shared <a href="https://www.npmjs.com/package/@lit/context" target="_blank"><code>@lit/context</code></a> key
          for passing MD3 theme state (dark or light mode, an optional Material You seed color) down a
          component tree: the <code>lit-material</code> equivalent of a React theme context.
          <code>@lit-material/core</code> only defines the key and the <code>ThemeState</code> shape; provide
          and consume it with <code>@lit/context</code>'s own API directly (<code>npm install @lit/context</code>
          alongside this package):
        </p>
        <pre tabindex="0"><code>${themeCode}</code></pre>
        <p>
          The <code>@provide</code>/<code>@consume</code> decorators from <code>@lit/context</code> work the
          same way, if you prefer decorators over explicit controllers.
        </p>
      </section>

      <section class="doc-section">
        <h2>Locale context</h2>
        <p>
          The same pattern as <code>themeContext</code>, applied to i18n: a shared context key for threading
          the active locale (and an optional override for the text direction) down a component tree, so
          components that format a date or lay out by <code>dir</code> can read it without prop drilling.
        </p>
        <pre tabindex="0"><code>${localeCode}</code></pre>
        <p>
          <code>@lit-material/core</code> only defines the key and the <code>LocaleState</code> shape
          (<code>{ locale: string; direction?: "ltr" | "rtl" }</code>). None of the <code>lit-material</code>
          components have fixed strings to translate, so the translation runtime is your app's own concern.
          Combine <code>localeContext</code> with
          <a href="https://www.npmjs.com/package/@lit/localize" target="_blank"><code>@lit/localize</code></a> for the
          translated strings themselves. See the <a href=${withBase("/guide/building-apps")}>Building apps guide</a> for a
          worked example wiring both together.
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-core-page": DocsCorePage;
  }
}
