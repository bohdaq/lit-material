# Building apps with lit-material

`lit-material`'s component packages (button, dialog, navigation, ...) are enough to build individual UI, but a
whole application typically also needs a router, a place for cross-cutting state, and a way to thread values
(like the current theme) down a component tree without prop drilling — the trio a React app usually reaches
for (router, context, Redux). This guide shows the `lit-material` equivalents wired together in one minimal
example, then extends it with data fetching, form validation, and i18n. See each package's own README for
full API detail:

- [`@lit-material/router`](https://github.com/bohdaq/lit-material/tree/main/packages/router) — SPA routing.
- [`@lit-material/store`](https://github.com/bohdaq/lit-material/tree/main/packages/store) — a Redux-shaped
  state store.
- [`@lit-material/core`](https://github.com/bohdaq/lit-material/tree/main/packages/core)'s `themeContext`/
  `localeContext` — built on the standard [`@lit/context`](https://www.npmjs.com/package/@lit/context)
  protocol.
- [`@lit-material/task`](https://github.com/bohdaq/lit-material/tree/main/packages/task) — a reactive
  controller for async work (data fetching).
- [`@lit-material/form`](https://github.com/bohdaq/lit-material/tree/main/packages/form) — a reactive
  controller tracking a `<form>`'s aggregate validity.

## Install

```sh
npm install @lit-material/router @lit-material/store @lit-material/core @lit-material/task @lit-material/form @lit/context lit
```

(Add `@lit/localize` too if you're using the i18n section below.)

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

## Data fetching

```ts
// profile-page.ts, extended — fetch the profile itself, keyed by a route param.
import { TaskController } from "@lit-material/task";
import { html } from "lit";

class ProfilePage extends LitElement {
  // ...theme/store as above...

  private readonly profileTask = new TaskController(this, {
    task: ([userId], signal) => fetch(`/api/users/${userId}`, { signal }).then((r) => r.json()),
    args: () => [this.user.value?.name] as const,
  });

  override render() {
    return this.profileTask.render({
      pending: () => html`Loading…`,
      complete: (profile) => html`<p>${profile.bio}</p>`,
      error: () => html`Couldn't load profile.`,
    });
  }
}
```

`TaskController` re-runs `task` automatically whenever `args()` returns a shallowly different value (checked
before every render), aborting a superseded run via the `AbortSignal` it passes in — no stale-response race
if `userId` changes again before the first fetch resolves.

## Form validation

```ts
// settings-page.ts
import { FormController } from "@lit-material/form";
import { html } from "lit";
import { query } from "lit/decorators.js";
import "@lit-material/text-field";
import "@lit-material/button";

class SettingsPage extends LitElement {
  @query("form") private readonly formEl?: HTMLFormElement;
  private readonly form = new FormController(this, () => this.formEl);

  override render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <lit-material-text-field name="email" label="Email" required type="email"></lit-material-text-field>
        <lit-material-button type="submit" ?disabled=${!this.form.valid}>Save</lit-material-button>
      </form>
    `;
  }

  private handleSubmit(event: SubmitEvent): void {
    if (!this.form.reportValidity()) event.preventDefault();
  }
}
```

`form.checkValidity()`/`reportValidity()` already aggregate across native inputs and any form-associated
`lit-material` component (Text Field, Checkbox, Radio, Switch, Slider) via the same `ElementInternals` APIs —
`FormController` just makes that aggregate result *reactive*, so the Save button above disables itself as the
user types instead of only failing on submit.

## Internationalization (i18n)

None of `lit-material`'s own components have hardcoded, translatable strings baked into their templates —
every visible label is either slotted content or a consumer-supplied property (`aria-label`, `label`, etc.),
so translating an app built with `lit-material` is purely about your own app's strings. `localeContext` is
just the connective tissue for threading the active locale down the tree, the same shape `themeContext` uses
for color scheme; combine it with [`@lit/localize`](https://www.npmjs.com/package/@lit/localize) (the Lit
team's own message-extraction/translation tool) for the actual translated strings:

```ts
// app-shell.ts, extended
import { localeContext, type LocaleState } from "@lit-material/core";
import { configureLocalization } from "@lit/localize";
import { sourceLocale, targetLocales } from "./generated/locale-codes.js"; // from `lit-localize` CLI output

const { setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale) => import(`./generated/locales/${locale}.js`),
});

class AppShell extends LitElement {
  // ...theme provider as above...
  private readonly locale = new ContextProvider(this, {
    context: localeContext,
    initialValue: { locale: sourceLocale } satisfies LocaleState,
  });

  private async switchLocale(locale: string): Promise<void> {
    await setLocale(locale);
    this.locale.setValue({ locale });
  }
}
```

Any component under the app shell reads `msg("Hello")`-wrapped strings (translated per `@lit/localize`'s own
mechanism, independent of context) and, if it needs the *current locale value itself* (e.g. to format a date,
or render a `<html dir>`-aware layout), consumes `localeContext` the same way `profile-page.ts` above consumes
`themeContext`.

RTL (`dir="rtl"`): most components use logical CSS properties (`margin-inline-start`, `padding-inline`, etc.),
which flip automatically with `dir` — but this hasn't been comprehensively audited, and a handful of
components position elements with physical `left`/`right` in ways that won't mirror correctly (Switch's
thumb position is one confirmed example). Full RTL verification across every component remains open — see
`spec/PLAN.md`'s "Unverified quality-bar items."

## What this doesn't cover

Pagination/column-resizing/row-virtualization for `@lit-material/data-table`, `@lit/localize`'s own message
extraction workflow (its CLI, not something `lit-material` wraps), and anything listed as a scope cut in an
individual component's own README are still out of scope — see `spec/PLAN.md` for the full current-status
picture and open questions.
