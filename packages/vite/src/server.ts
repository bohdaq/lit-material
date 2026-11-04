import { AsyncLocalStorage } from "node:async_hooks";
import { createReadStream, existsSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import {
  resolveRoute,
  routeDataScript,
  setServerRouteProvider,
  type ResolvedRoute,
  type RouteConfig,
  type ServerRoute,
} from "@lit-material/router/server";

/**
 * What the app's server entry (`src/entry-server.ts` by default) exports:
 *
 * ```ts
 * import { html } from "lit";
 * import "./app-shell.js"; // defines the elements; the shell contains <lit-material-router-outlet>
 * export { routes } from "./routes.js";
 * export const render = () => html`<app-shell></app-shell>`;
 * ```
 */
export interface ServerEntry {
  /** The same routes the app's outlet uses. */
  routes: RouteConfig<unknown>[];
  /**
   * The page body for a resolved route, rendered where the template has `<!--app-html-->`. Every
   * `<lit-material-router-outlet>` in it renders this route, however deep in shadow roots it is.
   */
  render: (route: ResolvedRoute<unknown>) => unknown;
  /** Extra markup for `<!--app-head-->`: meta tags, preloads. The route's `title` is handled already. */
  head?: (route: ResolvedRoute<unknown>) => string;
}

// One store per process, shared by every copy of this module: Vite loads the config (and this plugin) again
// for the server build, and the second copy must not point the router at a store nobody writes to.
const STORE_KEY = Symbol.for("lit-material.vite.routeStore");
const shared = globalThis as unknown as Record<symbol, AsyncLocalStorage<ServerRoute> | undefined>;
const routeStore = (shared[STORE_KEY] ??= new AsyncLocalStorage<ServerRoute>());
setServerRouteProvider(() => routeStore.getStore());

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * Renders the page for `url` into `template` (the built `index.html`, with `<!--app-head-->` and
 * `<!--app-html-->` placeholders): resolves the route (redirects, guards, lazy routes, loaders), server-renders
 * the entry with every outlet showing that route, sets the `<title>`, and embeds the loader data so the
 * browser hydrates without loading it again. Answers with the route's status, or a 302 for a redirect.
 */
export async function renderPage(entry: ServerEntry, url: URL | string, template: string): Promise<Response> {
  const target = new URL(url, "http://localhost");
  const route = await resolveRoute(entry.routes, target);
  if (route.redirect) {
    return new Response(null, { status: 302, headers: { location: route.redirect } });
  }
  const body = await routeStore.run({ path: route.path + route.search, data: route.data }, () =>
    collectResult(render(entry.render(route))),
  );
  let html = template;
  const title = route.title === undefined ? "" : `<title>${escapeHtml(route.title)}</title>`;
  if (title && /<title>[\s\S]*?<\/title>/.test(html)) html = html.replace(/<title>[\s\S]*?<\/title>/, title);
  const head = `${html.includes(title) ? "" : title}${entry.head?.(route) ?? ""}`;
  html = html.includes("<!--app-head-->") ? html.replace("<!--app-head-->", () => head) : html.replace("</head>", () => `${head}</head>`);
  const content = body + (route.data.length ? routeDataScript(route) : "");
  if (!html.includes("<!--app-html-->")) throw new Error("@lit-material/vite: index.html has no <!--app-html--> placeholder");
  html = html.replace("<!--app-html-->", () => content);
  return new Response(html, { status: route.status, headers: { "content-type": "text/html; charset=utf-8" } });
}

export interface RequestHandlerOptions {
  /** The built `index.html`. */
  template: string;
  /** The server entry module, or a function loading it (called per request in dev, once otherwise). */
  entry: ServerEntry | (() => ServerEntry | Promise<ServerEntry>);
}

/** A `(Request) => Promise<Response>` for any server that speaks Fetch: Node, Deno, Bun, edge runtimes. */
export function createRequestHandler(options: RequestHandlerOptions): (request: Request) => Promise<Response> {
  let loaded: Promise<ServerEntry> | undefined;
  const entry = () =>
    typeof options.entry === "function" ? (loaded ??= Promise.resolve(options.entry())) : Promise.resolve(options.entry);
  return async (request) => {
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    return renderPage(await entry(), request.url, options.template);
  };
}

/** A Fetch `Request` for a Node request. */
export function toRequest(req: IncomingMessage): Request {
  const host = req.headers.host ?? "localhost";
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(name, v));
    else if (value !== undefined) headers.set(name, value);
  }
  return new Request(new URL(req.url ?? "/", `http://${host}`), { method: req.method, headers });
}

/** Writes a Fetch `Response` to a Node response. */
export async function sendResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  if (!response.body) {
    res.end();
    return;
  }
  Readable.fromWeb(response.body as import("node:stream/web").ReadableStream).pipe(res);
}

const TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

/**
 * A Node `http` listener: files from `staticDir` (the client build, minus `index.html`), everything else
 * through the handler. Hashed files under `assets/` are cached for a year.
 *
 * ```js
 * createServer(toNodeListener(handler, { staticDir: "dist" })).listen(3000);
 * ```
 */
export function toNodeListener(
  handler: (request: Request) => Promise<Response>,
  options: { staticDir?: string } = {},
): (req: IncomingMessage, res: ServerResponse) => void {
  const root = options.staticDir ? resolve(options.staticDir) : undefined;
  return (req, res) => {
    void (async () => {
      try {
        if (root && (req.method === "GET" || req.method === "HEAD")) {
          const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
          const file = normalize(join(root, pathname));
          if (file.startsWith(root + sep) && extname(file) && extname(file) !== ".html" && existsSync(file) && statSync(file).isFile()) {
            res.setHeader("content-type", TYPES[extname(file)] ?? "application/octet-stream");
            if (pathname.startsWith("/assets/")) res.setHeader("cache-control", "public, max-age=31536000, immutable");
            if (req.method === "HEAD") res.end();
            else createReadStream(file).pipe(res);
            return;
          }
        }
        await sendResponse(res, await handler(toRequest(req)));
      } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    })();
  };
}

export type { ResolvedRoute, RouteConfig };
