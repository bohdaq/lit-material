# Building apps with lit-material

`lit-material`'s component packages (button, dialog, navigation, ...) are enough to build individual UI, but a
whole application typically also needs a router, a place for cross-cutting state, and a way to thread values
(like the current theme) down a component tree without prop drilling — the trio a React app usually reaches
for (router, context, Redux). This guide shows the `lit-material` equivalents wired together in one minimal
example. See each package's own README for full API detail:

- [`@lit-material/router`](https://github.com/bohdaq/lit-material/tree/main/packages/router) — SPA routing.
- [`@lit-material/store`](https://github.com/bohdaq/lit-material/tree/main/packages/store) — a Redux-shaped
  state store.
- [`@lit-material/core`](https://github.com/bohdaq/lit-material/tree/main/packages/core)'s `themeContext` —
  built on the standard [`@lit/context`](https://www.npmjs.com/package/@lit/context) protocol.

## Install

```sh
npm install @lit-material/router @lit-material/store @lit-material/core @lit/context lit
```

## Wiring it together

```ts
// store.ts — one module-level store instance, shared across the app.
import { createStore } from "@lit-material/store";

export interface AppState {
  user: { name: string } | null;
}

type AppAction = { type: "login"; name: string } | { type: "logout" };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "login":
      return { user: { name: action.name } };
    case "logout":
      return { user: null };
  }
}

export const appStore = createStore(reducer, { user: null });
```

```ts
// app-shell.ts — provides the theme context and owns the route outlet.
import "@lit-material/router";
import type { RouteConfig } from "@lit-material/router";
import { themeContext, type ThemeState } from "@lit-material/core";
import { ContextProvider } from "@lit/context";
import { LitElement, html } from "lit";
import "./home-page.js";
import "./profile-page.js";

const routes: RouteConfig<unknown>[] = [
  { path: "/", render: () => html`<home-page></home-page>` },
  { path: "/profile", render: () => html`<profile-page></profile-page>` },
];

class AppShell extends LitElement {
  private readonly theme = new ContextProvider(this, {
    context: themeContext,
    initialValue: { colorScheme: "auto" } satisfies ThemeState,
  });

  override render() {
    return html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`;
  }
}
customElements.define("app-shell", AppShell);
```

```ts
// profile-page.ts — reads both the store (for app state) and the theme
// context (for cross-cutting UI state), the same two mechanisms a React app
// would reach for useSelector/dispatch and useContext.
import { StoreController } from "@lit-material/store";
import { themeContext } from "@lit-material/core";
import { ContextConsumer } from "@lit/context";
import { LitElement, html } from "lit";
import { appStore } from "./store.js";

class ProfilePage extends LitElement {
  private readonly user = new StoreController(this, appStore, (state) => state.user);
  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });

  override render() {
    return html`
      <p>Color scheme: ${this.theme.value?.colorScheme}</p>
      <p>${this.user.value ? `Hi, ${this.user.value.name}` : "Not logged in"}</p>
    `;
  }
}
customElements.define("profile-page", ProfilePage);
```

Any same-origin `<a href="/profile">` navigates via the outlet automatically; use
`navigate("/profile")` from `@lit-material/router` for programmatic navigation (e.g. after
`appStore.dispatch({ type: "login", name })`).

## What this doesn't cover

Data fetching/async loading state, forms/validation beyond what individual form-associated components
already provide, and i18n are deliberately not part of this trio yet — see `spec/PLAN.md` for the current
scope and open questions.
