# {{PROJECT_NAME}}

A console app scaffolded by [`create-lit-material-app`](https://github.com/bohdaq/lit-material/tree/main/packages/create-lit-material-app)
(`--template console`): the frame a SaaS dashboard needs, built from lit-material parts.

## Develop

```sh
npm install
npm run dev
```

Open `/sign-in` for the sign-in screen; any password but `wrong` signs in.

## What's here

- `src/app-shell.ts`: top bar with an organization switcher and account menu, navigation that is a drawer,
  a rail or a bottom bar depending on the window, and the routes (real paths, with page titles).
- `src/pages/home-page.ts`: a getting-started checklist, then stat tiles.
- `src/pages/members-page.ts`: a list people act on: skeleton while loading, empty state, role change in
  the row, an invite dialog, confirm before removing, a snackbar after each change.
- `src/pages/settings-page.ts`: settings as tabs, a section that saves on its own, plans, a danger zone
  that asks for the name.
- `src/api.ts`: a fake server; replace its functions with your API calls.
- `src/notify.ts`: one snackbar for the app, `notify("Saved")`.

## Deploying

Pages live at real paths (`/members`), so the server must answer every unknown path with `index.html`.
With [rws](https://rws8.tech): `spa_fallback = "index.html"` (and `spa_fallback_exclude_prefixes = ["/api"]`).
