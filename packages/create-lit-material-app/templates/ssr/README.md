# {{PROJECT_NAME}}

A server-rendered [lit-material](https://lit.rws8.tech/) app on [`@lit-material/vite`](https://lit.rws8.tech/guides/server-rendering/).

```sh
npm install
npm run dev        # every page rendered on the server, with hot reloading
npm run build      # client + server build, and the prerendered pages in dist/
npm start          # the production server (server.js) on http://localhost:3000
```

- `src/routes.ts` — the routes, used by the server and the browser alike. A route's `loader` fetches its
  data before it renders; on the server the data is embedded in the page so the browser doesn't fetch it again.
- `src/entry-server.ts` — what the server renders for each page.
- `src/main.ts` — the browser entry; hydration support loads first.
- `server.js` — a plain Node server; `createRequestHandler()` also runs on any server that speaks Fetch.
