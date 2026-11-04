# @lit-material/router

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
