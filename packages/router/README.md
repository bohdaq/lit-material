# @lit-material/router

A tiny client-side router for building whole applications with
[lit-material](https://github.com/bohdaq/lit-material) — not just individual components. Path matching
(`/users/:id`-style, no regex/`URLPattern` dependency), an SPA route outlet that intercepts same-origin
`<a>` clicks, and a reactive controller for reading the current route without owning an outlet.

There's no `screenshot.png` here — the outlet itself renders nothing but the matched route's own content,
so there's nothing package-specific to capture; see whatever component is used *inside* a route for its own
screenshot.

**Client-side only.** Routing depends on `window.history`/`location`, so — unlike every other
`@lit-material/*` package — this one isn't safe to import from an SSR entry point.

## Install

```sh
npm install @lit-material/router
```

## Usage

```ts
import "@lit-material/router";
import type { RouteConfig } from "@lit-material/router";
import { html } from "lit";

const routes: RouteConfig<unknown>[] = [
  { path: "/", render: () => html`<home-page></home-page>` },
  { path: "/users/:id", render: (params) => html`<user-page .userId=${params.id}></user-page>` },
  { path: "/*", render: (params) => html`<not-found-page path=${params.wildcard}></not-found-page>` },
];
```

```html
<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>
```

Any same-origin `<a href="/users/42">` anywhere on the page — including inside another component's shadow
root — becomes an SPA navigation automatically; no need to call anything yourself for plain links. Use
`navigate()` for programmatic navigation (redirects, post-submit routing):

```ts
import { navigate } from "@lit-material/router";

navigate("/users/42");
navigate("/login", { replace: true }); // replaces the current history entry instead of pushing
```

To read the current route from a component that doesn't own the outlet (e.g. highlighting the active item
in a `NavigationRail`), use `RouteController` directly:

```ts
import { RouteController } from "@lit-material/router";
import { LitElement, html } from "lit";

class SideNav extends LitElement {
  private readonly route = new RouteController(this, () => routes);

  override render() {
    return html`<a href="/users/42" ?active=${this.route.current.path === "/users/42"}>Profile</a>`;
  }
}
```

## API

| Export | Description |
| --- | --- |
| `<lit-material-router-outlet>` | Custom element. `.routes: RouteConfig[]` property; renders the matched route's content, intercepts same-origin link clicks. |
| `matchRoute(pattern, pathname)` | Dependency-free path matcher. Static segments, `:name` params, trailing `*` wildcard (captured as `params.wildcard`). Returns `{ params }` or `null`. |
| `navigate(path, options?)` | Pushes (or with `{ replace: true }`, replaces) a history entry and notifies mounted outlets/controllers. |
| `RouteController` | Reactive controller — same lifecycle as `RippleController`/`FocusRingController` in `@lit-material/core` — for reading `.current` route/params without an outlet. |

## License

MIT
