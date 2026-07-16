# @lit-material/app-shell-demo

A small demo app showing `@lit-material/router`, `@lit-material/store`, and `@lit-material/core`'s
`themeContext` working together — the router/context/store trio from the
[Building apps guide](https://bohdaq.github.io/lit-material/guide/building-apps), as a running app instead of
just a code sample. **Not published to npm** — a `private` workspace app, same as `apps/docs`.

## Run

```sh
pnpm --filter @lit-material/app-shell-demo dev
```

Then open the printed local URL. Three routes (`/`, `/counter`, `/about`), all rendered by one
`<lit-material-router-outlet>`:

- Click the nav links — the page never does a full reload (check the Network tab).
- Go to **Counter**, click **+** a few times, then navigate to **Home** or **About** and back — the count is
  unchanged, because it lives in a `@lit-material/store` instance shared by the whole app, not in
  per-page component state.
- Click the light/dark toggle in the top bar — every page reads the new color scheme immediately via
  `@lit-material/core`'s `themeContext`, provided once in `app-shell.ts` and consumed with `@lit/context` on
  each page, with no props passed down manually.

## Source layout

- `src/store.ts` — the shared counter store.
- `src/app-shell.ts` — provides `themeContext`, owns the router outlet and the route table.
- `src/home-page.ts`, `src/counter-page.ts`, `src/about-page.ts` — the three routed pages.
