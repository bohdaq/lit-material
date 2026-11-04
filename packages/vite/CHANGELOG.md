# @lit-material/vite

## 0.1.0

### Minor Changes

- 4d7ae3a: Whole-app server rendering with Vite. New `@lit-material/vite`: `litMaterial()` renders every page on the server in dev (route status, redirects, `<title>`, loader data, then hydration), and on `vite build` also builds the server entry and prerenders the paths in `prerender`; `createRequestHandler()` and `toNodeListener()` from `@lit-material/vite/server` serve the build from any Fetch or Node server, and `@lit-material/vite/client` loads Lit's hydration support. Router: `setServerRouteProvider()` lets server tooling tell every outlet (however deep in shadow roots) which route and data a render is for, and `@lit-material/router/server` exports the server-side pieces without defining the outlet element.

### Patch Changes

- Updated dependencies [4d7ae3a]
  - @lit-material/router@0.4.0
