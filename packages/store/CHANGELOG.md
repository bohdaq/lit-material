# @lit-material/store

## 1.4.0

## 1.3.0

## 1.2.1

## 1.2.0

## 1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

## 0.1.0

### Minor Changes

- d84d8b9: Developer tooling.

  - New `@lit-material/testing`: `fixture()` renders a template and waits until every nested Lit element has updated; `getByRole`/`getByLabel`/`getByText` (and `queryBy*`, `getAllBy*`, `findBy*`) find elements by role, accessible name and text through shadow roots and slots, with `checked`/`selected`/`expanded`/`pressed`/`level` filters and errors that list what was found; `waitForUpdate`, `waitFor`, `queryDeep`; `user.click/type/clear/commit/press`. Works in any browser test runner.
  - New `@lit-material/devtools` (for development builds): `connectStore(store)` records actions and states and connects to the Redux DevTools extension, time travel included; `connectRouter()` logs navigations; `<lit-material-devtools>` (from `@lit-material/devtools/panel.js`) is an in-page panel with the store's state tree, action log, jump-to-state, and each router outlet's current route.
  - `@lit-material/store`: `replaceState(state)` sets the state without the reducer and notifies subscribers (for time travel and tests); `createStore`'s return type includes it.

## 0.0.2

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
