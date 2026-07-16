# create-lit-material-app

Scaffolds a new app with [`lit-material`](https://github.com/bohdaq/lit-material),
[`@lit-material/router`](https://github.com/bohdaq/lit-material/tree/main/packages/router),
[`@lit-material/store`](https://github.com/bohdaq/lit-material/tree/main/packages/store), and
[`@lit-material/core`](https://github.com/bohdaq/lit-material/tree/main/packages/core)'s theme context already
wired together — a runnable starting point, not just a components library.

There's no `screenshot.png` in this README — like `@lit-material/store`/`@lit-material/task`/
`@lit-material/form`/`@lit-material/core`, this package has no visual output of its own to capture (though
the *project it scaffolds* certainly does — run it and see).

## Usage

```sh
npm create lit-material-app my-app
cd my-app
npm install
npm run dev
```

(Omit `my-app` to scaffold into `./my-lit-material-app`.)

## What you get

```
my-app/
├─ index.html
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ main.ts          # imports tokens CSS + the app shell
   ├─ app-shell.ts      # provides the theme context, defines routes, hosts the router outlet
   ├─ store.ts           # one module-level store instance (a counter, to start)
   ├─ home-page.ts       # a route reading both the store and the theme context
   └─ about-page.ts      # a second route, to show the router actually routing
```

A real, buildable Vite project depending on the actual published `@lit-material/*` packages (not
`workspace:*` — this isn't part of the `lit-material` monorepo, it's a standalone app). Add more routes to
`app-shell.ts`'s `routes` array, more reducer cases to `store.ts`, and more components with
`npm install @lit-material/<component>` as you grow it. See the
[Building apps guide](https://bohdaq.github.io/lit-material/guide/building-apps) for `@lit-material/task`
(data fetching) and `@lit-material/form` (validation) wired into the same shape once you need them.

## Why hand-rolled instead of a scaffolding framework?

The same reasoning `@lit-material/router` gives for hand-rolling its own path matching instead of depending
on `@lit-labs/router`: the actual need here — copy a template directory, substitute one placeholder, print
next steps — doesn't need `commander`/`inquirer`/a templating engine. `src/cli.ts` is Node built-ins only
(`fs`/`path`/`url`).

## License

MIT
