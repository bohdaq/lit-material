# @lit-material/router

A small router for building whole applications with
[lit-material](https://github.com/bohdaq/lit-material) — not just individual components. Path matching
(`/users/:id`-style, no regex/`URLPattern` dependency), an SPA route outlet that intercepts same-origin
`<a>` clicks, and a reactive controller for reading the current route without owning an outlet. Routes can
redirect, guard, lazy-load, read a typed query and set the page title; the outlet restores scroll position on
back/forward; and routes resolve on the server, so routed pages can be prerendered.

There's no `screenshot.png` here — the outlet itself renders nothing but the matched route's own content,
so there's nothing package-specific to capture; see whatever component is used *inside* a route for its own
screenshot.

**On the server** there's no `location`: `lit-material-router-outlet` renders the route for its `path`
attribute, or nothing without one. See [Server rendering and prerendering](#server-rendering-and-prerendering).

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

`RouteController`/`<lit-material-router-outlet>` need no special handling for nested routes — both
delegate matching to `matchRouteChain`, so nesting works the same way whether or not you own the outlet
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

## Redirects and guards

`redirect` sends a path elsewhere, replacing the history entry; a string target may use the matched
`:params`. `guard` runs before a route — and everything nested in it — is shown, outermost first:

- `true` (or nothing): go ahead.
- `false`: cancel. The page still showing stays, and the address bar goes back to it.
- a path: redirect there, e.g. to `/login` when signed out.

Guards may be async. While one runs, the previous page stays up and the outlet has the `pending` attribute,
for a progress bar. A route without `render` just wraps its children, which suits a guard layer:

```ts
const routes: RouteConfig<unknown>[] = [
  { path: "/u/:id", redirect: "/users/:id" },
  {
    path: "/admin",
    guard: async () => ((await session.user()) ? true : "/login"),
    children: [
      { path: "", render: () => html`<admin-home></admin-home>` },
      { path: "users", render: () => html`<admin-users></admin-users>` },
    ],
  },
];
```

A guard in the browser is for the user's sake; the server still has to check every request it serves.

Cancelling a navigation the browser has already made (a link click or back/forward) puts the old URL back
with `replaceState`, so the history entry stays, pointing at the page still showing.

## Lazy routes

`load` is called the first time a route matches, so the route's code stays out of the first bundle:

```ts
{ path: "/reports", load: () => import("./reports-page.js"), render: () => html`<reports-page></reports-page>` }
```

On later navigations the outlet keeps the previous page up (with `pending`) until `load` settles, so the new
page never shows as undefined elements. On the first page load it renders straight away, so server-rendered
markup hydrates as is, and the elements upgrade once their code arrives. A `load` that throws fires
`lit-material-route-error` on the outlet (`detail.error`) and keeps the previous page; the next visit tries
again. A newer navigation always wins over one still loading.

## Route data

`loader` loads what a route shows before it's shown, after its guards pass. Its result is `data` in the
route context, for `render` and `title`; a parent's and a child's loaders run at the same time:

```ts
const routes: RouteConfig<unknown>[] = [
  {
    path: "/users/:id",
    loader: ({ params, signal }) => api.get<User>(`/users/${params.id}`, { signal }),
    title: ({ data }) => (data as User).name,
    render: (_params, _outlet, { data }) => html`<user-page .user=${data}></user-page>`,
  },
];
```

- The previous page stays up (with `pending`) until the data is in; a newer navigation aborts the loader's
  `signal`; a loader that throws fires `lit-material-route-error` and keeps the previous page.
- A route with a loader never renders without its data. `RouteController.current.data` is the innermost
  route's data.
- On the server, `resolveRoute()` runs the loaders and returns their results as `data` — see below. The
  browser's first render uses that data instead of loading again.
- Loaders run on every navigation. To reuse data across visits, load it through a cached
  [`TaskCache`](../task) or your own cache inside the loader.

## Query parameters

`render` gets a third argument, `{ path, params, query }`, where `query` is the URL's `URLSearchParams`;
`RouteController.current.query` is the same. `parseQuery` reads it typed, falling back to the default for a
missing or malformed value (a hand-edited `?page=abc` never reaches the page as `NaN`), and `formatQuery`
writes it back, leaving defaults out so `/users?page=1` and `/users` aren't two URLs for one page:

```ts
import { formatQuery, navigate, parseQuery, queryParam } from "@lit-material/router";

const usersQuery = {
  q: queryParam.string(),
  page: queryParam.number(1),
  sort: queryParam.oneOf(["name", "created"]), // first option is the default
  archived: queryParam.boolean(),             // ?archived, ?archived=true, ?archived=1
  tag: queryParam.list(),                      // ?tag=a&tag=b
};

const routes: RouteConfig<unknown>[] = [
  {
    path: "/users",
    render: (_params, _outlet, { query }) => {
      const { page, sort, tag } = parseQuery(usersQuery, query); // number, "name" | "created", string[]
      return html`<user-list .page=${page} .sort=${sort} .tags=${tag}></user-list>`;
    },
  },
];

navigate(`/users${formatQuery(usersQuery, { page: 2, sort: "created" })}`); // /users?page=2&sort=created
```

`queryParam.number(undefined)` / `queryParam.string(undefined)` make an optional parameter
(`number | undefined`).

## Titles and scrolling

The innermost matched route's `title` (a string, or a function of the route context) goes in
`document.title`, through the outlet's `title-template`. A route without one, reached from a route with
one, puts back the title the page started with; an app that never uses `title` keeps full control of
`document.title`.

```ts
const routes: RouteConfig<unknown>[] = [
  { path: "/users/:id", title: ({ params }) => `User ${params.id}`, render: /* ... */ },
  { path: "/*", title: "Not found", status: 404, render: /* ... */ },
];
```

```html
<lit-material-router-outlet .routes=${routes} title-template="%s · Admin"></lit-material-router-outlet>
```

After a navigation the outlet scrolls the window to the top, or to the `#hash` target (searched in the
document, then in the routed content). On back/forward it scrolls to where the reader was on that entry,
including after a reload (positions are kept in `sessionStorage`). Set `scroll-restoration="none"` to leave
scrolling to the app — for instance when the page scrolls inside its own container rather than the window.

## Server rendering and prerendering

`resolveRoute(routes, url)` does what the outlet does in the browser, without `location` or `history`:
follows redirects, runs guards, and waits for every `load` on the path, so the route's elements are defined
before rendering. It returns:

| Field | |
| --- | --- |
| `status` | `200`, or the innermost route's `status` (say `404` on a catch-all), `404` when nothing matches, `403` when a guard cancels, `302` after a redirect. |
| `redirect` | With `302`: where to send the client (the end of the redirect chain). |
| `path` | The path that matched. |
| `title` | The route's title, for the `<title>` in the head. |
| `params`, `content` | As the outlet will render them. |
| `data`, `search` | The loaders' results by position in the matched chain, and the query string: pass them to the outlet and `routeDataScript`. |

Render `<lit-material-router-outlet>` with that `path`, the same routes and the loader `data`, and embed the
data with `routeDataScript(result)`: in the browser the outlet matches `location` to the same content, takes
the embedded data instead of running the loaders again, and hydrates without a re-render:

```ts
import { resolveRoute, routeDataScript } from "@lit-material/router";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

const result = await resolveRoute(routes, request.url);
if (result.redirect) return Response.redirect(new URL(result.redirect, request.url), 302);

const body = await collectResult(render(html`
  <title>${result.title}</title>
  <lit-material-router-outlet .routes=${routes} path=${result.path} .data=${result.data}></lit-material-router-outlet>
  ${unsafeHTML(routeDataScript(result))}
`));
return new Response(body, { status: result.status });
```

`routeDataScript` escapes the JSON so the data can't end the script element; it's `type="application/json"`,
so a Content-Security-Policy doesn't need to allow it as a script.

For a static site, call it for each path you prerender and write the result to `<path>/index.html`.

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
| `<lit-material-router-outlet>` | Custom element. `.routes: RouteConfig[]`; renders the matched route's content, intercepts same-origin link clicks. Attributes: `path` (used only where there's no `location`), `title-template` (default `"%s"`), `scroll-restoration` (`"restore"` / `"none"`), `pending` (read-only, reflected). `.current` is the route showing. Fires `lit-material-route-error`. |
| `RouteConfig<T>` | `{ path, render?(params, outlet, context), children?, redirect?, guard?, load?, loader?, title?, status? }`. |
| `RouteContext` | `{ path, params, query, data? }` — what `render`, `guard`, `redirect`, `loader` (plus `signal`) and `title` functions get. |
| `routeDataScript(result)`, `ROUTE_DATA_ID` | The `<script type="application/json">` carrying `resolveRoute()`'s loader data to the browser's first render. |
| `matchRoute(pattern, pathname)` | Dependency-free path matcher. Static segments, `:name` params, trailing `*` wildcard (captured as `params.wildcard`). Returns `{ params }` or `null` if `pattern` doesn't match the *whole* `pathname`. |
| `matchRoutePrefix(pattern, pathname)` | Like `matchRoute`, but `pattern` only has to match a prefix — returns `{ params, remaining }`, the building block nested-route matching is built on. |
| `matchRouteChain(routes, pathname)` | The matched routes, outermost first, each with its params — without rendering or running guards. |
| `matchRouteTree(routes, pathname, parentParams?, query?)` | `matchRouteChain` then render: `{ content, params, chain }`, or `null`. |
| `resolveRoute(routes, url)` | Redirects, guards and lazy loads without a browser — see "Server rendering and prerendering". |
| `parseQuery(schema, query)`, `formatQuery(schema, values)`, `queryParam` | Typed query parameters — see "Query parameters". |
| `navigate(path, options?)` | Pushes (or with `{ replace: true }`, replaces) a history entry and notifies mounted outlets/controllers. |
| `RouteController` | Reactive controller — same lifecycle as `RippleController`/`FocusRingController` in `@lit-material/core` — for reading `.current` (`path`, `params`, `query`, `content`, `title`) without an outlet. It only matches; guards, redirects and loads run in the outlet (pass `{ resolve: true }` to run them in your own). |
| `setBasePath(path)` | Configures the path prefix `navigate()`/`RouteController` treat the app as deployed under — see "Deploying under a subpath." |
| `getBasePath()` | The path prefix configured via `setBasePath()` (`""` by default). |

## License

MIT
