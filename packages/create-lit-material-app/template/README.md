# {{PROJECT_NAME}}

Scaffolded by [`create-lit-material-app`](https://github.com/bohdaq/lit-material/tree/main/packages/create-lit-material-app),
with [`@lit-material/router`](https://github.com/bohdaq/lit-material/tree/main/packages/router),
[`@lit-material/store`](https://github.com/bohdaq/lit-material/tree/main/packages/store), and
[`@lit-material/core`](https://github.com/bohdaq/lit-material/tree/main/packages/core)'s theme context
already wired together in `src/app-shell.ts`.

## Develop

```sh
npm install
npm run dev
```

## Structure

- `src/app-shell.ts` — the root element: provides the theme context, defines routes, hosts the router outlet.
- `src/store.ts` — one module-level state store, shared across the app.
- `src/home-page.ts` / `src/about-page.ts` — the two starter routes. Add more to `app-shell.ts`'s `routes`
  array.

## Next steps

- Add more `lit-material` components: `npm install @lit-material/<component>` — see the
  [full component list](https://github.com/bohdaq/lit-material#readme).
- Data fetching: [`@lit-material/task`](https://github.com/bohdaq/lit-material/tree/main/packages/task).
- Form validation: [`@lit-material/form`](https://github.com/bohdaq/lit-material/tree/main/packages/form).
- i18n: `@lit-material/core`'s `localeContext` + [`@lit/localize`](https://www.npmjs.com/package/@lit/localize)
  — see the `lit-material` repo's docs app ("Building apps" guide, `/guide/building-apps`).
