---
"@lit-material/testing": minor
"@lit-material/devtools": minor
"@lit-material/store": minor
---

Developer tooling.

- New `@lit-material/testing`: `fixture()` renders a template and waits until every nested Lit element has updated; `getByRole`/`getByLabel`/`getByText` (and `queryBy*`, `getAllBy*`, `findBy*`) find elements by role, accessible name and text through shadow roots and slots, with `checked`/`selected`/`expanded`/`pressed`/`level` filters and errors that list what was found; `waitForUpdate`, `waitFor`, `queryDeep`; `user.click/type/clear/commit/press`. Works in any browser test runner.
- New `@lit-material/devtools` (for development builds): `connectStore(store)` records actions and states and connects to the Redux DevTools extension, time travel included; `connectRouter()` logs navigations; `<lit-material-devtools>` (from `@lit-material/devtools/panel.js`) is an in-page panel with the store's state tree, action log, jump-to-state, and each router outlet's current route.
- `@lit-material/store`: `replaceState(state)` sets the state without the reducer and notifies subscribers (for time travel and tests); `createStore`'s return type includes it.
