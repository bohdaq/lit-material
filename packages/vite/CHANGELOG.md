# @lit-material/vite

## 1.5.0

### Patch Changes

- @lit-material/router@1.5.0

## 1.4.0

### Patch Changes

- @lit-material/router@1.4.0

## 1.3.0

### Patch Changes

- @lit-material/router@1.3.0

## 1.2.1

### Patch Changes

- @lit-material/router@1.2.1

## 1.2.0

### Patch Changes

- @lit-material/router@1.2.0

## 1.1.0

### Patch Changes

- Updated dependencies [a956860]
  - @lit-material/router@1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

### Patch Changes

- Updated dependencies [65ac716]
  - @lit-material/router@1.0.0

## 0.1.0

### Minor Changes

- 4d7ae3a: Whole-app server rendering with Vite. New `@lit-material/vite`: `litMaterial()` renders every page on the server in dev (route status, redirects, `<title>`, loader data, then hydration), and on `vite build` also builds the server entry and prerenders the paths in `prerender`; `createRequestHandler()` and `toNodeListener()` from `@lit-material/vite/server` serve the build from any Fetch or Node server, and `@lit-material/vite/client` loads Lit's hydration support. Router: `setServerRouteProvider()` lets server tooling tell every outlet (however deep in shadow roots) which route and data a render is for, and `@lit-material/router/server` exports the server-side pieces without defining the outlet element.

### Patch Changes

- Updated dependencies [4d7ae3a]
  - @lit-material/router@0.4.0
