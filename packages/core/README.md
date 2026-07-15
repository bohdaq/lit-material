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

## Locale context

`localeContext` is the same pattern as `themeContext`, applied to i18n: a shared context key for threading
the active locale (and an optional explicit text-direction override) down a component tree, so components
that need to format a date or render a `dir`-aware layout can read it without prop drilling.

```ts
import { localeContext, type LocaleState } from "@lit-material/core";
import { ContextProvider } from "@lit/context";

class AppShell extends LitElement {
  private readonly locale = new ContextProvider(this, {
    context: localeContext,
    initialValue: { locale: "en" } satisfies LocaleState,
  });
}
```

`@lit-material/core` only defines the key and the `LocaleState` shape (`{ locale: string; direction?: "ltr" |
"rtl" }`) here too — none of `lit-material`'s own components have hardcoded, translatable strings (every
visible label is slotted content or a consumer-supplied property), so the actual translation runtime is your
app's own concern. Combine `localeContext` with
[`@lit/localize`](https://www.npmjs.com/package/@lit/localize) (the Lit team's own message-extraction/
translation tool) for the translated strings themselves — see the docs app's "Building apps" guide
(`apps/docs`, `/guide/building-apps`) for a worked example wiring both together.

## License

MIT
