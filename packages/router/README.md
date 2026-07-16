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

## Nested routes

A `RouteConfig` can declare `children` — nested routes matched against whatever's left of the path once the
parent's own `path` is consumed. The parent's `render` gets a second argument, `outlet`, a function that
returns the matched child's content (or `null` if none matched); call it wherever the nested content should
appear in the parent's own template:

```ts
const routes: RouteConfig<unknown>[] = [
  {
    path: "/dashboard",
    render: (params, outlet) => html`
      <dashboard-shell>
        <nav slot="nav">...</nav>
        ${outlet()}
      </dashboard-shell>
    `,
    children: [
      { path: "", render: () => html`<dashboard-overview></dashboard-overview>` }, // index route
      { path: "settings", render: () => html`<dashboard-settings></dashboard-settings>` },
      { path: "users/:id", render: (params) => html`<dashboard-user .userId=${params.id}></dashboard-user>` },
    ],
  },
];
```

- `/dashboard/settings` renders `<dashboard-shell>` with `<dashboard-settings>` in place of `outlet()`.
- `/dashboard` (the parent path hit exactly) matches the `path: ""` **index** child first, if one is declared
  — same convention as an index route in other nested routers. With no index child, the parent still renders,
  just with `outlet()` returning `null`.
- `/dashboard/nope` (nothing under `children` matches, and the parent doesn't fully consume the path on its
  own) means the whole `/dashboard` branch doesn't match at all — matching falls through to the next sibling
  route, the same as if `/dashboard` weren't there. A parent never renders with unaccounted-for path segments.
- Params merge down the tree: a `:param` captured by a parent is still in `params` inside every descendant's
  `render`.
- Nesting composes arbitrarily deep, and a leaf can itself use a trailing `*` wildcard to catch everything
  under it (e.g. a docs section with its own sub-router).
- Existing zero/one-argument `render` functions (`() => ...` or `(params) => ...`) keep working unchanged —
  `outlet` only matters once a route declares `children`.

`RouteController`/`<lit-material-router-outlet>` need no special handling for nested routes — both already
delegate matching to `matchRouteTree`, so nesting works the same way whether or not you own the outlet
yourself.

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

## Deploying under a subpath

If the app isn't served from its domain's root — a GitHub Pages project site at `/my-repo/`, for
instance — call `setBasePath()` once at startup, before constructing the first `RouteController`/
`<lit-material-router-outlet>`:

```ts
import { setBasePath } from "@lit-material/router";

setBasePath("/my-repo"); // e.g. import.meta.env.BASE_URL on Vite
```

Route configs, `navigate()` calls, and `route.current.path` all keep working exactly as written — in path
space relative to the app's own root — regardless of `setBasePath()`. It only affects two things internally:
`navigate()` prepends the configured base before calling `history.pushState()`, and `RouteController` strips
it back off `location.pathname` before matching. The one thing `setBasePath()` *doesn't* do is rewrite the
`href` you put in your own `<a>` tags — those are real attributes a browser also uses for "open in new tab"/
hover previews/copy-link, so they need the base prefix written in literally; build it from the same base
(`` `${basePath}${path}` ``) wherever you author one.

GitHub Pages specifically has no server-side rewrites, so a direct load or refresh of any route other than
the site root still 404s without a `404.html` fallback that redirects back to `index.html` — `setBasePath()`
solves routing once you're *on* the page, not the initial static-hosting request.

## API

| Export | Description |
| --- | --- |
| `<lit-material-router-outlet>` | Custom element. `.routes: RouteConfig[]` property (`children` supported, see "Nested routes"); renders the matched route's content, intercepts same-origin link clicks. |
| `RouteConfig<T>` | `{ path, render(params, outlet), children? }` — a route, optionally with nested routes. |
| `matchRoute(pattern, pathname)` | Dependency-free path matcher. Static segments, `:name` params, trailing `*` wildcard (captured as `params.wildcard`). Returns `{ params }` or `null` if `pattern` doesn't match the *whole* `pathname`. |
| `matchRoutePrefix(pattern, pathname)` | Like `matchRoute`, but `pattern` only has to match a prefix — returns `{ params, remaining }`, the building block nested-route matching is built on. |
| `matchRouteTree(routes, pathname, parentParams?)` | Recursively matches a (possibly nested) route tree, composing each level's `render(params, outlet)` into the next. What `RouteController` calls internally on every navigation. |
| `navigate(path, options?)` | Pushes (or with `{ replace: true }`, replaces) a history entry and notifies mounted outlets/controllers. |
| `RouteController` | Reactive controller — same lifecycle as `RippleController`/`FocusRingController` in `@lit-material/core` — for reading `.current` route/params without an outlet. |
| `setBasePath(path)` | Configures the path prefix `navigate()`/`RouteController` treat the app as deployed under — see "Deploying under a subpath." |
| `getBasePath()` | The path prefix configured via `setBasePath()` (`""` by default). |

## License

MIT
