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
npm create lit-material-app my-app                    # the spa template
npm create lit-material-app my-blog -- --template ssr  # the ssr template
cd my-app
npm install
npm run dev
```

(Omit `my-app` to scaffold into `./my-lit-material-app`; `--help` lists the templates.)

## Templates

### `spa` (default)

A client-rendered app: router, store and theme context wired together.

```
my-app/
├─ index.html
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ main.ts          # imports tokens CSS + the app shell
   ├─ app-shell.ts     # provides the theme context, defines routes, hosts the router outlet
   ├─ store.ts         # one module-level store instance (a counter, to start)
   ├─ home-page.ts     # a route reading both the store and the theme context
   └─ about-page.ts    # a second route, to show the router actually routing
```

### `ssr`

A server-rendered app on [`@lit-material/vite`](../vite): every page comes from the server with its content,
title, status code and loader data, then hydrates. `npm run build` also prerenders a few pages to static HTML;
`npm start` runs the production Node server.

```
my-blog/
├─ index.html          # <!--app-head--> and <!--app-html--> placeholders
├─ vite.config.ts      # litMaterial({ prerender: [...] })
├─ server.js           # the production server (createRequestHandler + toNodeListener)
└─ src/
   ├─ main.ts          # hydration support first, then the app shell
   ├─ entry-server.ts  # what the server renders for each page
   ├─ routes.ts        # routes with loaders, a redirect and a 404 — shared by server and browser
   ├─ posts.ts         # stands in for your API
   ├─ app-shell.ts
   └─ pages/
```

Both are real, buildable Vite projects depending on the published `@lit-material/*` packages, at the
versions released with this CLI. Add components with `npm install @lit-material/<component>` as you grow them.
See the [Building apps guide](https://lit.rws8.tech/guides/building-apps/) and
[Data and forms](https://lit.rws8.tech/guides/data/) for what to wire in next.

## Why hand-rolled instead of a scaffolding framework?

The same reasoning `@lit-material/router` gives for hand-rolling its own path matching instead of depending
on `@lit-labs/router`: the actual need here — copy a template directory, substitute a few placeholders, print
next steps — doesn't need `commander`/`inquirer`/a templating engine. `src/cli.ts` is Node built-ins only
(`fs`/`path`/`url`).

## License

MIT
