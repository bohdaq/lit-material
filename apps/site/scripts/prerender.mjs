// Writes dist/<route>/index.html for every page with Lit SSR, plus the favicon,
// brand files, llms.txt, sitemap.xml and robots.txt. Runs after `vite build`
// (needs dist/.vite/manifest.json) and `vite build --ssr` (.ssr/entry.js).
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { NODE_ONLY } from "../../../tools/node-only.mjs";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(site, "..", "..");
const dist = join(site, "dist");
const require = createRequire(join(repo, "packages", "button", "package.json"));
await import(require.resolve("@lit-labs/ssr/lib/install-global-dom-shim.js"));
const { render } = await import(require.resolve("@lit-labs/ssr"));
const { collectResult } = await import(require.resolve("@lit-labs/ssr/lib/render-result.js"));

const { pages, setSizes, documentHtml, ORIGIN, favicon, mark } = await import(pathToFileURL(join(site, ".ssr", "entry.js")).href);

// Gzipped size per package, measured as tools/size-check.mjs does.
const sizes = new Map();
for (const dir of readdirSync(join(repo, "packages"))) {
  const pkgDir = join(repo, "packages", dir);
  const pkgFile = join(pkgDir, "package.json");
  const entry = join(pkgDir, "dist", "index.js");
  if (!existsSync(pkgFile) || !existsSync(entry)) continue;
  const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
  if (pkg.private || NODE_ONLY.has(pkg.name)) continue;
  const result = await build({
    stdin: { contents: `export * from ${JSON.stringify(entry)};`, resolveDir: pkgDir },
    bundle: true,
    minify: true,
    format: "esm",
    external: ["lit", "lit/*", "@lit/*", "@lit-labs/*"],
    write: false,
    logLevel: "error",
  });
  sizes.set(pkg.name, gzipSync(result.outputFiles[0].contents, { level: 9 }).length);
}
setSizes(sizes);

const manifest = JSON.parse(readFileSync(join(dist, ".vite", "manifest.json"), "utf8"));
const entry = manifest["src/client/main.js"];
const assets = { js: `/${entry.file}`, css: (entry.css ?? []).map((f) => `/${f}`) };

function write(path, content) {
  const file = join(dist, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const all = pages();
for (const page of all) {
  const body = await collectResult(render(await page.render()));
  const out = page.meta.path.endsWith("/") ? `${page.meta.path}index.html` : page.meta.path;
  write(out, documentHtml({ ...page.meta, body, assets }));
}
console.log(`${all.length} pages`);

write("favicon.svg", favicon());
write("brand/mark.svg", mark({ tile: "#16120F", accent: "#3B5BDB" }));
write("brand/mark-dark.svg", mark({ tile: "#F2EBE3", accent: "#8DA2FB" }));
for (const f of readdirSync(join(site, "src", "brand")).filter((f) => f.endsWith(".png"))) {
  mkdirSync(join(dist, "brand"), { recursive: true });
  copyFileSync(join(site, "src", "brand", f), join(dist, "brand", f));
}
copyFileSync(join(repo, "llms.txt"), join(dist, "llms.txt"));

const indexed = all.filter((p) => !p.meta.noindex).map((p) => p.meta.path);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed.map((p) => `  <url><loc>${ORIGIN}${p}</loc></url>`).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
console.log("brand files, llms.txt, sitemap.xml and robots.txt written");
