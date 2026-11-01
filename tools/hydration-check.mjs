#!/usr/bin/env node
// Server-renders every element (and the array-data ones from JSON attributes),
// loads that HTML in Chromium, hydrates it with @lit-labs/ssr-client, and
// fails when hydration throws or changes what an element's shadow DOM shows —
// the sign that the browser's first render differs from the server's. Run after
// `pnpm build` and `pnpm analyze` (it reads each package's custom-elements.json).
import { build } from "esbuild";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgDir = (name) => join(root, "packages", name);
// @lit-labs/ssr isn't hoisted; take it (and Lit) from a package that has them.
const req = createRequire(join(pkgDir("button"), "package.json"));
await import(req.resolve("@lit-labs/ssr/lib/install-global-dom-shim.js"));
const { render } = await import(req.resolve("@lit-labs/ssr"));
const { collectResult } = await import(req.resolve("@lit-labs/ssr/lib/render-result.js"));
const { html, unsafeStatic } = await import(req.resolve("lit/static-html.js"));

const packages = readdirSync(join(root, "packages")).filter((p) => {
  const f = join(pkgDir(p), "package.json");
  return existsSync(f) && !JSON.parse(readFileSync(f, "utf8")).private && existsSync(join(pkgDir(p), "dist", "index.js"));
});
const tags = [];
for (const p of packages) {
  const manifest = join(pkgDir(p), "custom-elements.json");
  if (!existsSync(manifest)) continue;
  for (const mod of JSON.parse(readFileSync(manifest, "utf8")).modules ?? [])
    for (const d of mod.declarations ?? []) if (d.customElement && d.tagName) tags.push(d.tagName);
}
for (const p of packages) await import(join(pkgDir(p), "dist", "index.js"));

const j = JSON.stringify;
const cases = tags.map((t) => [t, html`<${unsafeStatic(t)} label="Sample" headline="Sample">Sample text</${unsafeStatic(t)}>`]);
cases.push(
  ["bar-chart data", html`<lit-material-bar-chart label="Requests" data=${j([{ name: "api", value: 30 }, { name: "web", value: 12 }])}></lit-material-bar-chart>`],
  ["line-chart series", html`<lit-material-line-chart label="Load" series=${j([{ name: "cpu", points: [{ x: 0, y: 1 }, { x: 1, y: 3 }] }])}></lit-material-line-chart>`],
  ["sparkline values", html`<lit-material-sparkline label="Trend" values=${j([1, 4, 2])}></lit-material-sparkline>`],
  ["chip-input values", html`<lit-material-chip-input label="Tags" values=${j(["alpha", "beta"])}></lit-material-chip-input>`],
  ["pagination page-size-options", html`<lit-material-data-table-pagination page-size-options=${j([5, 20])}></lit-material-data-table-pagination>`],
  ["dual-list items", html`<lit-material-dual-list-selector items=${j([{ value: "a", label: "Apples" }])} selected=${j(["a"])}></lit-material-dual-list-selector>`],
  ["table rows", html`<lit-material-table caption="People" columns=${j([{ key: "name", label: "Name" }])} rows=${j([{ name: "Ada" }])}></lit-material-table>`],
  ["jump-links links", html`<lit-material-jump-links links=${j([{ id: "a", text: "Install" }])}></lit-material-jump-links>`],
  // Elements whose template depends on their light DOM children.
  ["carousel-item label", html`<lit-material-carousel><lit-material-carousel-item>One<span slot="label">First</span></lit-material-carousel-item></lit-material-carousel>`],
  ["tree nested items", html`<lit-material-tree><lit-material-tree-item expanded><span slot="label">src</span><lit-material-tree-item><span slot="label">main.ts</span></lit-material-tree-item></lit-material-tree-item></lit-material-tree>`],
);

const failures = [];
const parts = [];
for (const [name, template] of cases) {
  try {
    parts.push(`<div class="case" data-name="${name}">${await collectResult(render(template))}</div>`);
  } catch (e) {
    failures.push(`${name}: server render threw: ${e.message.split("\n")[0]}`);
  }
}

const dir = mkdtempSync(join(tmpdir(), "lit-material-hydration-"));
writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="utf-8"></head><body>${parts.join("\n")}<script type="module" src="./client.js"></script></body></html>`);
const ssrClient = dirname(createRequire(join(root, "package.json")).resolve("@lit-labs/ssr-client/lit-element-hydrate-support.js"));
await build({
  stdin: {
    contents: ['import "@lit-labs/ssr-client/lit-element-hydrate-support.js";', ...packages.map((p) => `import ${j(join(pkgDir(p), "dist", "index.js"))};`), "window.__hydrated = true;"].join("\n"),
    resolveDir: pkgDir("button"),
  },
  bundle: true,
  format: "esm",
  alias: { "@lit-labs/ssr-client": ssrClient },
  outfile: join(dir, "client.js"),
  logLevel: "error",
});

const server = createServer((request, response) => {
  const file = join(dir, request.url === "/" ? "index.html" : request.url.slice(1));
  if (!existsSync(file)) return response.writeHead(404).end();
  response.writeHead(200, { "content-type": file.endsWith(".js") ? "text/javascript" : "text/html" }).end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => failures.push(`page error: ${e.message.split("\n")[0]}`));
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route("**/client.js", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "commit" });
  await page.waitForFunction(() => document.readyState !== "loading");
  const snapshot = () =>
    page.evaluate(() =>
      [...document.querySelectorAll(".case")].map((c) => {
        const el = c.firstElementChild;
        const shadow = el?.shadowRoot;
        const tags = [];
        const walk = (n) => n.childNodes.forEach((k) => k.nodeType === 1 && (tags.push(k.localName), walk(k)));
        if (shadow) walk(shadow);
        const text = shadow ? [...shadow.childNodes].filter((n) => n.nodeName !== "STYLE").map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim() : null;
        return { name: c.dataset.name, shadow: Boolean(shadow), tags: tags.join(" "), text };
      }),
    );
  const before = await snapshot();
  release();
  await page.waitForFunction(() => window.__hydrated === true, null, { timeout: 60000 });
  await page.waitForTimeout(1000);
  const after = await snapshot();
  before.forEach((b, i) => {
    const a = after[i];
    if (!b.shadow) failures.push(`${b.name}: no declarative shadow root in the server output`);
    else if (b.tags !== a.tags) failures.push(`${b.name}: hydration changed the structure\n    server:  ${b.tags.slice(0, 200)}\n    browser: ${a.tags.slice(0, 200)}`);
    else if (b.text !== a.text) failures.push(`${b.name}: hydration changed the text\n    server:  ${j(b.text).slice(0, 200)}\n    browser: ${j(a.text).slice(0, 200)}`);
  });
  console.log(`${before.length} cases server-rendered and hydrated.`);
} finally {
  await browser.close();
  server.close();
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
