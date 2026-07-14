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

## License

MIT
