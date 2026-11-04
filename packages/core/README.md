# @lit-material/core

Shared [Lit](https://lit.dev/) reactive controllers used across
[lit-material](https://github.com/bohdaq/lit-material) components: `RippleController`
(pointer-driven press state for a state-layer element) and `FocusRingController`
(keyboard-vs-pointer focus detection for an accessible focus ring).

`RippleController` and `FocusRingController` are internal building blocks for other
`@lit-material/*` packages, not meant to be a general-purpose public API on their own yet.

## Theme context

`themeContext` is different: it's meant to be used directly by apps built with lit-material. It's a
shared [`@lit/context`](https://www.npmjs.com/package/@lit/context) key for threading MD3 theme state
(dark/light mode, an optional Material You seed color) down a component tree — the `lit-material`
equivalent of a React theme context. `@lit-material/core` only defines the key and the `ThemeState`
shape; provide and consume it with `@lit/context`'s own API directly (`npm install @lit/context`
alongside this package):

```ts
import { themeContext, type ThemeState } from "@lit-material/core";
import { ContextProvider, ContextConsumer } from "@lit/context";
import { LitElement, html } from "lit";

class AppShell extends LitElement {
  private readonly themeProvider = new ContextProvider(this, {
    context: themeContext,
    initialValue: { colorScheme: "auto" } satisfies ThemeState,
  });

  override render() {
    return html`<slot></slot>`;
  }
}

class ThemedWidget extends LitElement {
  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });

  override render() {
    return html`<p>Color scheme: ${this.theme.value?.colorScheme}</p>`;
  }
}
```

The `@provide`/`@consume` decorators from `@lit/context` work the same way, if you prefer decorators
over explicit controllers.

## Localization and text direction

Components render a few words of their own: button names ("Dismiss", "Next page"), screen-reader
announcements, validation messages, counts. They go through `LocalizeController`, in the
`@lit-material/core/localize.js` entry (kept separate so a component pulls in only this, about 0.9 KB
gzipped):

```ts
import { LocalizeController, isRtl } from "@lit-material/core/localize.js";

class MyElement extends LitElement {
  private readonly localize = new LocalizeController(this);

  override render() {
    return html`
      <button aria-label=${this.localize.term("myElement.close", "Close")}>×</button>
      <span>${this.localize.term("myElement.files", { one: "{count} file", other: "{count} files" }, { count: 3 })}</span>
      <span>${this.localize.date(new Date(), { month: "long" })}</span>
    `;
  }
}
```

- **Language:** the nearest `lang` attribute above the element, through shadow roots, else `<html lang>`,
  else the fallback (`"en"`, see `setFallbackLocale`). `localize.lang` has it. Components re-render when
  `<html lang>`/`<html dir>` changes or translations are registered; after changing `lang` lower down, call
  `localize.refresh()` on affected elements (or re-render them).
- **Messages:** `term(key, english, args?)` returns the registered translation for the language, else its
  base language's (`de` for `de-AT`), else the English given. `{name}` placeholders are filled from `args`,
  numbers formatted for the language; a plural object is chosen by `args.count` through `Intl.PluralRules`.
- **Translations:** `registerTranslation({ $code: "de", "alert.dismiss": "Schließen", ... })`, or import
  ready catalogs from [`@lit-material/translations`](../translations). Registering a language again merges.
- **Direction:** `isRtl(el)` is true when the element is laid out right to left (`dir` attributes, through
  shadow roots). Components flip horizontal arrow keys, pointer maths and directional icons with it; their
  CSS uses logical properties.
- **Server rendering:** there's no page to read `<html lang>` from, so the element's own `lang` attribute or
  the fallback locale applies.

### Locale context

`localeContext` is the `themeContext` pattern applied to the active locale — `{ locale, direction? }` —
for app code that wants to provide it down a tree. Components don't read it: they read `lang`/`dir`
attributes, which work without JavaScript, on the server and across frameworks. A provider should set
`lang` and `dir` on its host (or on `<html>`) so components follow:

```ts
import { localeContext, type LocaleState } from "@lit-material/core";
import { ContextProvider } from "@lit/context";

class AppShell extends LitElement {
  private readonly locale = new ContextProvider(this, {
    context: localeContext,
    initialValue: { locale: "de" } satisfies LocaleState,
  });

  override connectedCallback() {
    super.connectedCallback();
    this.lang = this.locale.value.locale;
  }
}
```

For your app's own strings, use [`@lit/localize`](https://lit.dev/docs/localization/overview/) or
`registerTranslation` with your own keys.

## `cssProps`

Sets inline styles through the CSSOM (`element.style.setProperty`) rather than a `style` attribute, so they
work under a Content-Security-Policy without `'unsafe-inline'` for styles. Lit's `styleMap` writes the
attribute on its first render, which such a policy blocks.

```ts
import { cssProps } from "@lit-material/core/css-props.js";

html`<div class="bar" style=${cssProps({ width: `${percent}%`, "--indent": "12px", color: undefined })}></div>`;
```

Names may be camelCase or kebab-case, custom properties keep their `--`; `null`, `undefined` and `""` leave a
property out (and remove it if it was set). On the server it renders the same styles as an attribute.

## `setAriaElements`

Points a control inside a shadow root at elements in the page, by ids given to the host. An id
copied onto the inner control (`aria-labelledby="name-label"`) resolves to nothing there, because
ids resolve within one tree; ARIA element reflection can reach the host's trees.

```ts
protected override updated(): void {
  setAriaElements(this.renderRoot.querySelector("input"), "ariaLabelledByElements", this.ariaLabelledBy, this);
}
```

`property` is `ariaLabelledByElements`, `ariaDescribedByElements` or `ariaControlsElements`; `ids` is
space-separated. In browsers without element reflection it does nothing.

## License

MIT
