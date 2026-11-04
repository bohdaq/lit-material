#!/usr/bin/env node
// Content-Security-Policy and Trusted Types check. Two parts:
//  1. Source scan: no `style="...${}"`/`style=${}` attribute bindings in component templates (a strict
//     `style-src` blocks style attributes; set styles through `styleMap`, which uses the CSSOM), and no
//     `innerHTML`-style sinks outside Lit.
//  2. Browser: every element (from the custom-elements manifests, plus states that add inline styles) is
//     rendered client-side in Chromium on a page served with
//       default-src 'self'; script-src 'self'; style-src 'self'; require-trusted-types-for 'script';
//       trusted-types lit-html
//     and any `securitypolicyviolation` fails the check.
// Run after `pnpm build` and `pnpm analyze`.
import { build } from "esbuild";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgDir = (name) => join(root, "packages", name);
export const POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "require-trusted-types-for 'script'",
  "trusted-types lit-html",
].join("; ");

// Packages that aren't components rendered into an app's page (site-kit builds static sites; see its README).
const SKIP_SCAN = new Set(["site-kit", "create-lit-material-app"]);
const failures = [];

// 1. Source scan.
const STYLE_BINDING = /\sstyle=(?:"[^"]*\$\{|\$\{(?!cssProps\())/;
const SINKS = /\.(?:innerHTML|outerHTML)\s*=|insertAdjacentHTML\(|document\.write\(|new Function\(|\beval\(/;
const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.ts$/.test(name) && !/\.(test|ssr\.test)\.ts$|test-host|\.d\.ts$/.test(name) ? [path] : [];
  });
const packages = readdirSync(join(root, "packages")).filter((p) => {
  const f = join(pkgDir(p), "package.json");
  return existsSync(f) && !JSON.parse(readFileSync(f, "utf8")).private;
});
let scanned = 0;
for (const p of packages) {
  if (SKIP_SCAN.has(p) || !existsSync(join(pkgDir(p), "src"))) continue;
  for (const file of files(join(pkgDir(p), "src"))) {
    scanned++;
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        const where = `${relative(root, file)}:${i + 1}`;
        if (STYLE_BINDING.test(line)) failures.push(`${where}: style attribute binding (use cssProps from @lit-material/core): ${line.trim().slice(0, 120)}`);
        if (SINKS.test(line)) failures.push(`${where}: HTML/script sink: ${line.trim().slice(0, 120)}`);
        if (/lit\/directives\/style-map/.test(line)) failures.push(`${where}: styleMap writes a style attribute on first render; use cssProps from @lit-material/core`);
      });
  }
}

// 2. Browser.
const tags = [];
const elementModules = new Set();
for (const p of packages) {
  const manifest = join(pkgDir(p), "custom-elements.json");
  if (!existsSync(manifest)) continue;
  for (const mod of JSON.parse(readFileSync(manifest, "utf8")).modules ?? [])
    for (const d of mod.declarations ?? []) {
      if (!d.customElement || !d.tagName) continue;
      tags.push(d.tagName);
      elementModules.add(join(pkgDir(p), "dist", mod.path.replace(/^src\//, "").replace(/\.ts$/, ".js")));
    }
}
const componentPackages = packages.filter((p) => existsSync(join(pkgDir(p), "custom-elements.json")) && existsSync(join(pkgDir(p), "dist", "index.js")));

// States whose templates set inline styles, beyond each element's defaults.
const j = JSON.stringify;
// Overlapping timed events and a multi-day all-day one, for lit-material-calendar.
const calendarEvents = [{ id: 1, title: "Standup", start: "2026-06-15T09:00", end: "2026-06-15T09:30" }, { id: 2, title: "Review", start: "2026-06-15T09:15", end: "2026-06-15T10:00", color: "#386a20" }, { id: 3, title: "Offsite", start: "2026-06-16", end: "2026-06-18" }];
const extra = [
  `<lit-material-bar-chart label="Requests" data='${j([{ name: "api", value: 30 }, { name: "web", value: 12 }])}'></lit-material-bar-chart>`,
  `<lit-material-line-chart label="Load" series='${j([{ name: "cpu", points: [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }] }])}'></lit-material-line-chart>`,
  `<lit-material-sparkline label="Trend" values='${j([1, 4, 2])}'></lit-material-sparkline>`,
  `<lit-material-linear-progress value="0.4"></lit-material-linear-progress>`,
  `<lit-material-usage-meter label="CPU" value="3" max="4" unit="cores"></lit-material-usage-meter>`,
  `<lit-material-rating value="2.5"></lit-material-rating>`,
  `<lit-material-skeleton width="120px" height="16px"></lit-material-skeleton>`,
  `<lit-material-slider value="30"></lit-material-slider>`,
  `<lit-material-split-panel position="40"><div slot="start">A</div><div slot="end">B</div></lit-material-split-panel>`,
  `<lit-material-textarea label="Notes" resize="vertical"></lit-material-textarea>`,
  `<lit-material-jump-links links='${j([{ id: "a", text: "Install" }, { id: "b", text: "Use", depth: 3 }])}'></lit-material-jump-links>`,
  `<lit-material-tree><lit-material-tree-item expanded><span slot="label">src</span><lit-material-tree-item><span slot="label">main.ts</span></lit-material-tree-item></lit-material-tree-item></lit-material-tree>`,
  `<lit-material-color-picker label="Accent" value="#6750a4"></lit-material-color-picker>`,
  `<lit-material-time-picker variant="docked" value="09:30"></lit-material-time-picker>`,
  `<lit-material-icon name="check"></lit-material-icon>`,
  `<lit-material-calendar date="2026-06-15" events='${j(calendarEvents)}'></lit-material-calendar>`,
  `<lit-material-calendar view="week" date="2026-06-15" events='${j(calendarEvents)}'></lit-material-calendar>`,
  `<lit-material-calendar view="agenda" date="2026-06-15" events='${j(calendarEvents)}'></lit-material-calendar>`,
  `<lit-material-data-grid row-key="id" group-by="team" expanded-groups='${j(["a"])}' columns='${j([{ key: "name", header: "Name", width: 120 }, { key: "n", header: "N", numeric: true, aggregate: "sum" }])}' rows='${j([{ id: 1, team: "a", name: "Ada", n: 1 }, { id: 2, team: "b", name: "Alan", n: 2 }])}'></lit-material-data-grid>`,
];

const dir = mkdtempSync(join(tmpdir(), "lit-material-csp-"));
const cases = [...tags.map((t) => `<${t} label="Sample" headline="Sample">Sample text</${t}>`), ...extra];
writeFileSync(
  join(dir, "index.html"),
  `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="cases"></div><script type="module" src="./client.js"></script></body></html>`,
);
await build({
  stdin: {
    contents: [
      ...componentPackages.map((p) => `import ${j(join(pkgDir(p), "dist", "index.js"))};`),
      ...[...elementModules].map((f) => `import ${j(f)};`),
      `import { registerIcons } from ${j(join(pkgDir("icon"), "dist", "index.js"))};`,
      `registerIcons({ check: '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>' });`,
      `const cases = ${j(cases)};`,
      // The harness parses each case's markup through its own policy (allowed only on this test page);
      // everything the components do runs under 'lit-html' alone.
      "const policy = trustedTypes.createPolicy('csp-check', { createHTML: (s) => s });",
      "const container = document.getElementById('cases');",
      "for (const markup of cases) {",
      "  const div = document.createElement('div');",
      "  div.className = 'case';",
      "  div.dataset.markup = markup;",
      "  div.innerHTML = policy.createHTML(markup);",
      "  container.append(div);",
      "}",
      "window.__rendered = true;",
    ].join("\n"),
    resolveDir: pkgDir("button"),
  },
  bundle: true,
  format: "esm",
  outfile: join(dir, "client.js"),
  logLevel: "error",
});

const server = createServer((request, response) => {
  const file = join(dir, request.url === "/" ? "index.html" : request.url.slice(1));
  if (!existsSync(file)) return response.writeHead(404).end();
  response
    .writeHead(200, {
      "content-type": file.endsWith(".js") ? "text/javascript" : "text/html",
      "content-security-policy": `${POLICY} csp-check`,
    })
    .end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    window.__violations = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      const host = e.target?.getRootNode?.()?.host;
      const caseEl = (host ?? e.target)?.closest?.(".case");
      window.__violations.push({
        directive: e.violatedDirective,
        sample: e.sample,
        where: caseEl?.dataset.markup?.slice(0, 80) ?? host?.localName ?? String(e.blockedURI || e.sourceFile),
      });
    }, true);
  });
  page.on("pageerror", (e) => failures.push(`page error: ${e.message.split("\n")[0]}`));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => window.__rendered === true, null, { timeout: 60000 });
  await page.waitForTimeout(500);
  // Interactions that add inline styles: chart tooltips on hover.
  for (const tag of ["lit-material-line-chart", "lit-material-bar-chart"]) {
    const box = await page.locator(tag).first().boundingBox();
    if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(100);
  }
  const violations = await page.evaluate(() => window.__violations);
  const seen = new Set();
  for (const v of violations) {
    const line = `${v.directive} in ${v.where}${v.sample ? `: ${v.sample}` : ""}`;
    if (!seen.has(line)) failures.push(`CSP violation: ${line}`), seen.add(line);
  }
  console.log(`${scanned} source files scanned; ${cases.length} cases rendered under: ${POLICY}`);
} finally {
  await browser.close();
  server.close();
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
