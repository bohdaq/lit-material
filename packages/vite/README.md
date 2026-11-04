# @lit-material/vite

A Vite plugin that server-renders a [lit-material](https://github.com/bohdaq/lit-material) app: every page
comes from the server with its content, `<title>`, HTTP status and loader data, then hydrates in the browser.
The same routes drive the server and the client; there's no second routing table.

- **`vite` (dev):** every page request is rendered through your server entry, with hot module reloading as
  usual. Redirects answer 302, a catch-all route with `status: 404` answers 404.
- **`vite build`:** the client build, then the server build (`dist/server/entry-server.js` and
  `dist/server/template.html`), then any paths you list in `prerender` as static HTML.
- **Production:** `createRequestHandler()` turns the build into a `(Request) => Promise<Response>` for any
  server that speaks Fetch, and `toNodeListener()` plugs it into Node's `http`.

## Install

```sh
npm install @lit-material/vite @lit-material/router lit
npm install --save-dev vite
```

## Set up

**`vite.config.ts`**

```ts
import { litMaterial } from "@lit-material/vite";

export default {
  plugins: [litMaterial({ prerender: ["/", "/about"] })], // prerender is optional
};
```

**`index.html`**: two placeholders.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My app</title>
    <!--app-head-->
  </head>
  <body>
    <!--app-html-->
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**`src/entry-server.ts`**: the routes, and the page body to render.

```ts
import { html } from "lit";
import "./app-shell.js"; // defines your elements; the shell renders <lit-material-router-outlet .routes=${routes}>
export { routes } from "./routes.js";

export const render = () => html`<app-shell></app-shell>`;
export const head = () => `<meta name="description" content="…">`; // optional
```

**`src/main.ts`**: hydration support first, then the same elements.

```ts
import "@lit-material/vite/client"; // must come before any element is defined
import "./app-shell.js";
```

That's all: the outlet inside `<app-shell>`, however deep in shadow roots, renders the requested route on the
server. Routes with a `loader` get their data on the server, and the browser's first render reuses it (see
[Route data](../router#route-data)).

## Production server

```js
// server.js
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequestHandler, toNodeListener } from "@lit-material/vite/server";

const handler = createRequestHandler({
  template: readFileSync("dist/server/template.html", "utf8"),
  entry: () => import("./dist/server/entry-server.js"),
});

createServer(toNodeListener(handler, { staticDir: "dist" })).listen(3000);
```

`toNodeListener` serves files from `dist` (hashed `assets/` with a year's cache) and sends every other GET
through the handler. For another server, call `handler(request)` with a Fetch `Request`: it answers `405` to
anything but GET and HEAD.

## Static sites

`prerender` writes each path's page to `dist/<path>/index.html` (`/` to `dist/index.html`, and a 404 page
rendered for `"/404"` to `dist/404.html`). Paths that redirect are skipped with a warning. The pages hydrate
like server-rendered ones; navigation after that is client-side.

## How it works

`renderPage(entry, url, template)` runs `resolveRoute()` (redirects, guards, lazy routes, loaders), renders
`entry.render(route)` with Lit's server renderer while an `AsyncLocalStorage` tells every outlet which route
and data this request is for (concurrent requests don't mix), puts the route's `title` in the head, and
embeds the loader data with `routeDataScript()`.

On the server, elements render into declarative shadow roots with their styles inline. A strict
Content-Security-Policy then needs `style-src 'unsafe-inline'`; see the
[security guide](https://lit.rws8.tech/guides/security/).

## API

| Export | |
| --- | --- |
| `litMaterial({ entry?, prerender?, serverOutDir? })` | The plugin. `entry` defaults to `src/entry-server.ts`; `serverOutDir` to `<outDir>/server`. |
| `@lit-material/vite/server`: `renderPage(entry, url, template)` | One page as a `Response`. |
| `createRequestHandler({ template, entry })` | `(Request) => Promise<Response>`; `entry` may be a module or a function importing it. |
| `toNodeListener(handler, { staticDir? })`, `toRequest(req)`, `sendResponse(res, response)` | Node `http` glue. |
| `@lit-material/vite/client` | Side-effect import: Lit's hydration support. |
| `ServerEntry` | `{ routes, render(route), head?(route) }`. |

## License

MIT
