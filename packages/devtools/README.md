# @lit-material/devtools

Development-time tooling for apps built with [lit-material](https://github.com/bohdaq/lit-material): connect
a [`@lit-material/store`](https://github.com/bohdaq/lit-material/tree/main/packages/store) to the
[Redux DevTools](https://github.com/reduxjs/redux-devtools) browser extension (action log, state diff, time
travel), log [`@lit-material/router`](https://github.com/bohdaq/lit-material/tree/main/packages/router)
navigations, and inspect both in a small in-page panel, `<lit-material-devtools>`, when you don't have the
extension.

It's meant for development builds. Nothing here runs unless you import it, so an app that only imports it
behind a dev check (below) ships none of it to production. On the server every function is a no-op.

## Install

```sh
npm install --save-dev @lit-material/devtools
```

## Usage

```ts
import { createStore } from "@lit-material/store";

export const store = createStore(reducer, initialState);

if (import.meta.env.DEV) {
  // A dynamic import keeps the devtools out of the production bundle entirely.
  const { connectStore, connectRouter } = await import("@lit-material/devtools");
  connectStore(store, { name: "app" });
  connectRouter();
  await import("@lit-material/devtools/panel.js");
  document.body.append(document.createElement("lit-material-devtools"));
}
```

`import.meta.env.DEV` is Vite's flag; use your bundler's equivalent (`process.env.NODE_ENV !== "production"`
and so on). A static `import { connectStore } from "@lit-material/devtools"` works too: the API is a few
plain functions with no dependencies, and the panel element is only defined when you import
`@lit-material/devtools/panel.js`.

### Redux DevTools extension

`connectStore(store)` wraps `store.dispatch` to record every action and the state after it. If the
[Redux DevTools extension](https://github.com/reduxjs/redux-devtools/tree/main/extension) is installed, it
also shows up there as an instance named after `name`:

- each dispatch is sent with its resulting state;
- jumping to a state or action replaces the store's state (time travel), which re-renders every
  `StoreController` host. Dispatching from a past state carries on from it;
- **Reset** returns to the state the store had when it was connected; **Commit** makes the current state the
  new starting point; **Revert** (rollback) goes back to the last commit.

Time travel needs `store.replaceState()`, which `createStore()` stores have. Other stores of the same shape
(a Redux store, say) are recorded but can't jump. Skipping or reordering actions isn't supported: the store
would have to replay the reducer, which the devtools leave alone. Actions that aren't `{ type }` objects are
sent as `{ type: String(action) }`, or `{ type: "(untyped action)", payload }` for an object without a
`type`.

### The panel

`<lit-material-devtools>` is a "Devtools" button in the bottom-end corner. It opens a panel with two views:

- **Store** — a picker when several stores are connected, the current state as a collapsible tree, and the
  action log, newest first. Select an action to see it and the state after it; **Jump here** shows that
  state in the app, **Back to live** returns to the latest one.
- **Router** — the current route of each `<lit-material-router-outlet>` in the document (path, params,
  query, title, and whether it's pending on a guard or lazy load), and the navigation log from
  `connectRouter()`.

The panel is a non-modal region: the page stays usable while it's open, and Escape closes it. Everything is
a real button (tree nodes with `aria-expanded`, log entries with `aria-pressed`), and the views are a
keyboard-navigable tab list. It's styled with the `--md-sys-color-*` tokens from
[`@lit-material/tokens`](https://github.com/bohdaq/lit-material/tree/main/packages/tokens), with fallbacks
so it looks right without them, and needs no inline styles, so it works under a strict
Content-Security-Policy.

```html
<lit-material-devtools></lit-material-devtools>
<lit-material-devtools open view="router"></lit-material-devtools>
```

Outlets inside other components' shadow roots aren't found; the navigation log still covers them.

### Router log

`connectRouter()` listens on `window` for the router's `lit-material-route-change` event (fired by
`navigate()` and by the outlet's link interception) and for `popstate`, and logs each navigation as
`{ path, search, hash, time, kind }` with `kind` `"push"`, `"replace"` (including redirects) or `"pop"`
(back/forward). It doesn't import the router, so connecting it doesn't load the router either.

## API

### `@lit-material/devtools`

| Export | Description |
| --- | --- |
| `connectStore(store, { name = "store", maxAge = 50 })` | Records the store's actions and states (the initial state, then up to `maxAge` entries in all) and connects it to the Redux DevTools extension if present. Returns a function that restores the original `dispatch` and disconnects. A second store under the same name replaces the first, so hot reloading works. |
| `connectRouter({ maxAge = 50 })` | Logs navigations. Returns a function that stops logging; calling `connectRouter()` again shares the same listeners. |
| `getRegistry()` | The shared registry the panel reads (see below), or `undefined` on the server. |
| `toLoggedAction(action)` | The `{ type }` object an action is logged and sent as. |
| `ROUTE_CHANGE_EVENT`, `INIT_ACTION`, `REGISTRY_KEY` | `"lit-material-route-change"`, `{ type: "@@INIT" }`, `"__LIT_MATERIAL_DEVTOOLS__"`. |

The registry lives on `globalThis.__LIT_MATERIAL_DEVTOOLS__`, so every copy of the package on a page shares
it:

| Member | Description |
| --- | --- |
| `stores: Map<string, StoreRecord>` | By name. A `StoreRecord` has `name`, `store`, `maxAge`, `history` (`{ action, state, time }`, oldest first), `travelling`, `cursor`, `canTravel`, `jumpTo(index)`, `backToLive()` and `disconnect()`. |
| `router: RouteLogEntry[]` | `{ path, search, hash, time, kind }`, oldest first. |
| `subscribe(listener): () => void` | Called after every dispatch, state change, time-travel step and navigation. |

### `<lit-material-devtools>` (`@lit-material/devtools/panel.js`)

| Property/attribute | Default | Description |
| --- | --- | --- |
| `open` | `false` | Whether the panel is showing. Reflected. |
| `view` | `"store"` | `"store"` or `"router"`. |

| Method | Description |
| --- | --- |
| `show()` | Opens the panel. |
| `close()` | Closes it, returning focus to the button if focus was inside. |

| CSS custom property | Default |
| --- | --- |
| `--lit-material-devtools-offset` | `16px` from the bottom and inline-end edges. |
| `--lit-material-devtools-z-index` | `2147483000` |
| `--lit-material-devtools-mono` | `ui-monospace, …` for the trees and logs. |

## License

MIT
