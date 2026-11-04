import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Plugin, ResolvedConfig } from "vite";
import { renderPage, sendResponse, type ServerEntry } from "./server.js";

export interface LitMaterialOptions {
  /** The server entry, relative to the Vite root. Default `"src/entry-server.ts"`. */
  entry?: string;
  /**
   * Paths to render to static HTML after `vite build`: `["/", "/about"]`, or a function returning them (from
   * a CMS, say). `/` becomes `index.html`, `/about` becomes `about/index.html`, a 404 page (`"/404"` with a
   * catch-all `status: 404` route) becomes `404.html`.
   */
  prerender?: string[] | (() => string[] | Promise<string[]>);
  /** Where the server build goes, relative to the Vite root. Default `<build.outDir>/server`. */
  serverOutDir?: string;
}

const ENTRY_FILE = "entry-server.js";
const TEMPLATE_FILE = "template.html";

const acceptsHtml = (accept: string | undefined) => !accept || accept.includes("text/html") || accept.includes("*/*");
const isPageUrl = (url: string) => !/\.[a-z0-9]+$/i.test(new URL(url, "http://x").pathname) && !url.startsWith("/@") && !url.startsWith("/__");

/**
 * Server rendering for a lit-material app.
 *
 * - `vite` (dev): every page request is rendered on the server through the entry — status codes, redirects,
 *   titles and loader data from the routes — and hydrates in the browser. The entry reloads on every change.
 * - `vite build`: the client build as usual, then the server build (`dist/server/entry-server.js` and the
 *   page template `dist/server/template.html`) for `@lit-material/vite/server`, then any `prerender` paths
 *   as static HTML.
 *
 * ```ts
 * // vite.config.ts
 * import { litMaterial } from "@lit-material/vite";
 * export default { plugins: [litMaterial({ prerender: ["/", "/about"] })] };
 * ```
 */
export function litMaterial(options: LitMaterialOptions = {}): Plugin {
  const entry = (options.entry ?? "src/entry-server.ts").replace(/^\/+/, "");
  let config: ResolvedConfig;

  return {
    name: "lit-material:ssr",

    config(_user, env) {
      // Pages come from the server entry, so Vite shouldn't serve index.html itself.
      if (env.command === "serve") return { appType: "custom" };
      return undefined;
    },

    configResolved(resolved) {
      config = resolved;
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.originalUrl ?? req.url ?? "/";
        if ((req.method !== "GET" && req.method !== "HEAD") || !acceptsHtml(req.headers.accept) || !isPageUrl(url)) {
          next();
          return;
        }
        try {
          const raw = readFileSync(resolve(config.root, "index.html"), "utf8");
          const template = await server.transformIndexHtml(url, raw, req.originalUrl);
          const mod = (await server.ssrLoadModule(`/${entry}`)) as ServerEntry;
          await sendResponse(res, await renderPage(mod, new URL(url, `http://${req.headers.host ?? "localhost"}`), template));
        } catch (error) {
          if (error instanceof Error) server.ssrFixStacktrace(error);
          next(error);
        }
      });
    },

    async closeBundle() {
      // Only after the client build; the server build below runs this plugin again with build.ssr set.
      if (config.command !== "build" || config.build.ssr) return;
      const { build } = await import("vite");
      const outDir = resolve(config.root, config.build.outDir);
      const serverOut = resolve(config.root, options.serverOutDir ?? join(config.build.outDir, "server"));
      await build({
        configFile: config.configFile,
        root: config.root,
        mode: config.mode,
        logLevel: "warn",
        build: {
          ssr: entry,
          outDir: serverOut,
          emptyOutDir: true,
          copyPublicDir: false,
          rollupOptions: { output: { entryFileNames: ENTRY_FILE } },
        },
      });
      const template = readFileSync(join(outDir, "index.html"), "utf8");
      writeFileSync(join(serverOut, TEMPLATE_FILE), template);

      const paths = typeof options.prerender === "function" ? await options.prerender() : (options.prerender ?? []);
      if (!paths.length) return;
      const mod = (await import(pathToFileURL(join(serverOut, ENTRY_FILE)).href)) as ServerEntry;
      for (const path of paths) {
        const response = await renderPage(mod, path, template);
        if (response.status >= 300 && response.status < 400) {
          config.logger.warn(`[lit-material] ${path} redirects to ${response.headers.get("location")}; not prerendered`);
          continue;
        }
        const pathname = new URL(path, "http://x").pathname;
        const file =
          response.status === 404 && pathname === "/404"
            ? join(outDir, "404.html")
            : join(outDir, pathname.replace(/\/+$/, ""), "index.html");
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, await response.text());
        config.logger.info(`[lit-material] prerendered ${path} → ${file.slice(outDir.length + 1)} (${response.status})`);
      }
    },
  };
}

export type { ServerEntry } from "./server.js";
