# @lit-material/router

## 1.4.0

## 1.3.0

## 1.2.1

## 1.2.0

## 1.1.0

### Minor Changes

- a956860: Hash routing for apps served as static files: `setRouterMode("hash")` keeps the route after the `#`, and `routeHref(path)` builds link hrefs for either mode.

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

## 0.4.0

### Minor Changes

- 4d7ae3a: Whole-app server rendering with Vite. New `@lit-material/vite`: `litMaterial()` renders every page on the server in dev (route status, redirects, `<title>`, loader data, then hydration), and on `vite build` also builds the server entry and prerenders the paths in `prerender`; `createRequestHandler()` and `toNodeListener()` from `@lit-material/vite/server` serve the build from any Fetch or Node server, and `@lit-material/vite/client` loads Lit's hydration support. Router: `setServerRouteProvider()` lets server tooling tell every outlet (however deep in shadow roots) which route and data a render is for, and `@lit-material/router/server` exports the server-side pieces without defining the outlet element.

## 0.3.0

### Minor Changes

- cf9e5cb: Route data. A route's `loader(context)` runs after its guards pass, alongside the chain's other loaders and lazy `load()`s, with an `AbortSignal` a newer navigation aborts; its result is `context.data` in `render` and `title`, and `RouteController.current.data`. The previous page stays up (`pending`) until the data is in, a failing loader fires `lit-material-route-error`, and a route with a loader never renders without its data. On the server `resolveRoute()` runs the loaders and returns `data` and `search`; give the outlet `.data=${result.data}` and embed `routeDataScript(result)` in the page, and the browser's first render reuses that data instead of loading again.

## 0.2.0

### Minor Changes

- 8507493: Framework bindings, generated from the custom elements manifest. `@lit-material/<pkg>/react` has a React wrapper per element, built on `@lit/react` (optional peer dependencies `@lit/react` and `react`): properties are set as properties and events map to `onChange`-style props. `@lit-material/<pkg>/jsx` types the elements in React 19 JSX and `@lit-material/<pkg>/vue` in Vue templates (load either with `import type {} from ...`). `dist/web-types.json` (JetBrains, found through the `web-types` field) and `dist/vscode.html-custom-data.json` give editor completion and docs in any template, Angular's included.

## 0.1.0

### Minor Changes

- ebbcb7e: Router v2. Routes take `redirect` (with `:params`), `guard` (sync or async: `true`, `false` to cancel, or a path to redirect to), `load` for lazy routes (the previous page stays up, with the outlet's `pending` attribute, until it settles; failures fire `lit-material-route-error`), `title` (into `document.title` through the outlet's `title-template`) and `status`. `render` gets a third argument with the `query`, and `parseQuery`/`formatQuery`/`queryParam` read and write it typed. The outlet restores scroll position on back/forward and scrolls to the top or the `#hash` target on new navigations (`scroll-restoration="none"` opts out). On the server the outlet renders the route for its `path` attribute, and `resolveRoute(routes, url)` runs redirects, guards and loads without a browser and returns the status and title, so routed pages can be prerendered. `render` is now optional (a route without it wraps its children). Size budget raised from 1.8 to 4.5 KB gzipped for these.

## 0.0.6

### Patch Changes

- 9ce5b18: Array data renders on the server: bar chart `data`, line chart `series`, sparkline `values`, chip input `values`, pagination `page-size-options`, dual list `items` and `selected`, and table `columns` and `rows` take a JSON attribute, so server-rendered markup carries the data and hydrates to the same output (a property set on the server never reaches the markup). `lit-material-router-outlet` renders empty on the server instead of throwing for want of `location`, which failed the whole page's render.

## 0.0.5

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.

## 0.0.4

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
