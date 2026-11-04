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
  // Packages that define elements (they have a manifest); the others (Node tooling like @lit-material/vite,
  // or plain modules) have nothing to hydrate.
  return (
    existsSync(f) &&
    !JSON.parse(readFileSync(f, "utf8")).private &&
    existsSync(join(pkgDir(p), "dist", "index.js")) &&
    existsSync(join(pkgDir(p), "custom-elements.json"))
  );
});
const tags = [];
const elementModules = new Set();
for (const p of packages) {
  const manifest = join(pkgDir(p), "custom-elements.json");
  if (!existsSync(manifest)) continue;
  for (const mod of JSON.parse(readFileSync(manifest, "utf8")).modules ?? [])
    for (const d of mod.declarations ?? []) {
      if (!d.customElement || !d.tagName) continue;
      tags.push(d.tagName);
      // An element may live in its own entry point rather than the package index (devtools' panel).
      elementModules.add(join(pkgDir(p), "dist", mod.path.replace(/^src\//, "").replace(/\.ts$/, ".js")));
    }
}
for (const p of packages) await import(join(pkgDir(p), "dist", "index.js"));
for (const file of elementModules) await import(file);

const j = JSON.stringify;
const cases = tags.map((t) => [t, html`<${unsafeStatic(t)} label="Sample" headline="Sample">Sample text</${unsafeStatic(t)}>`]);
// Overlapping timed events and a multi-day all-day one, for lit-material-calendar.
const calendarEvents = [{ id: 1, title: "Standup", start: "2026-06-15T09:00", end: "2026-06-15T09:30" }, { id: 2, title: "Review", start: "2026-06-15T09:15", end: "2026-06-15T10:00", color: "#386a20" }, { id: 3, title: "Offsite", start: "2026-06-16", end: "2026-06-18" }];
cases.push(
  ["bar-chart data", html`<lit-material-bar-chart label="Requests" data=${j([{ name: "api", value: 30 }, { name: "web", value: 12 }])}></lit-material-bar-chart>`],
  ["line-chart series", html`<lit-material-line-chart label="Load" series=${j([{ name: "cpu", points: [{ x: 0, y: 1 }, { x: 1, y: 3 }] }])}></lit-material-line-chart>`],
  ["sparkline values", html`<lit-material-sparkline label="Trend" values=${j([1, 4, 2])}></lit-material-sparkline>`],
  ["chip-input values", html`<lit-material-chip-input label="Tags" values=${j(["alpha", "beta"])}></lit-material-chip-input>`],
  ["pagination page-size-options", html`<lit-material-data-table-pagination page-size-options=${j([5, 20])}></lit-material-data-table-pagination>`],
  ["dual-list items", html`<lit-material-dual-list-selector items=${j([{ value: "a", label: "Apples" }])} selected=${j(["a"])}></lit-material-dual-list-selector>`],
  ["data-grid rows", html`<lit-material-data-grid row-key="id" sort-key="name" selectable columns=${j([{ key: "name", header: "Name", sortable: true }, { key: "n", header: "N", numeric: true, width: 80 }])} rows=${j([{ id: 1, name: "Ada", n: 1200 }, { id: 2, name: "Alan", n: 3 }])}></lit-material-data-grid>`],
  ["data-grid groups", html`<lit-material-data-grid row-key="id" group-by="team" expanded-groups=${j(["a"])} page-size="10" columns=${j([{ key: "name", header: "Name" }, { key: "n", header: "N", numeric: true, aggregate: "sum" }])} rows=${j([{ id: 1, team: "a", name: "Ada", n: 1 }, { id: 2, team: "b", name: "Alan", n: 2 }])}></lit-material-data-grid>`],
  ["table rows", html`<lit-material-table caption="People" columns=${j([{ key: "name", label: "Name" }])} rows=${j([{ name: "Ada" }])}></lit-material-table>`],
  ["diff texts", html`<lit-material-diff original="a\nb\nc" modified="a\nx\nc" mode="split"></lit-material-diff>`],
  ["change-list changes", html`<lit-material-change-list changes=${j([{ path: "$.a", kind: "changed", before: 1, after: 2 }])}></lit-material-change-list>`],
  ["merge-view sides", html`<lit-material-merge-view base="1" sides=${j([{ label: "Mine", text: "a\nB" }, { label: "Base", text: "a\nb" }])}></lit-material-merge-view>`],
  ["calendar month events", html`<lit-material-calendar date="2026-06-15" first-day-of-week="1" events=${j(calendarEvents)}></lit-material-calendar>`],
  ["calendar week events", html`<lit-material-calendar view="week" date="2026-06-15" first-day-of-week="1" events=${j(calendarEvents)}></lit-material-calendar>`],
  ["calendar agenda events", html`<lit-material-calendar view="agenda" date="2026-06-15" events=${j(calendarEvents)}></lit-material-calendar>`],
  ["plan-picker plans", html`<lit-material-plan-picker plans=${j([{ id: "free", name: "Free", price: { amount: "$0" }, current: true }, { id: "team", name: "Team", price: { monthly: { amount: "$8" }, yearly: { amount: "$80" } }, features: ["Roles"], recommended: true }])}></lit-material-plan-picker>`],
  ["plan-card features", html`<lit-material-plan-card name="Team" price="$8" period="per month" features=${j(["Roles", "Audit"])} recommended></lit-material-plan-card>`],
  ["sign-in code step", html`<lit-material-sign-in methods="password code forgot" method="code" awaiting-code email="a@example.com"></lit-material-sign-in>`],
  ["jump-links links", html`<lit-material-jump-links links=${j([{ id: "a", text: "Install" }])}></lit-material-jump-links>`],
  ["rich-text value", html`<lit-material-rich-text-editor label="Notes" value=${'<h2>Plan</h2><p>Ship <strong>it</strong> <a href="/x">now</a><br>later</p><ul><li>one<ol><li>two</li></ol></li></ul><blockquote><p>q</p></blockquote><pre>a\n  b</pre>'}></lit-material-rich-text-editor>`],
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
    contents: ['import "@lit-labs/ssr-client/lit-element-hydrate-support.js";', ...packages.map((p) => `import ${j(join(pkgDir(p), "dist", "index.js"))};`), ...[...elementModules].map((f) => `import ${j(f)};`), "window.__hydrated = true;"].join("\n"),
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
