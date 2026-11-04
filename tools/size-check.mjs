#!/usr/bin/env node
// Size budget per package: each package's built entry bundled and minified on
// its own (Lit left out — every app already has it), then gzipped, compared
// with tools/size-limits.json. Run after `pnpm build`.
//   node tools/size-check.mjs           fail when a package is over its limit
//   node tools/size-check.mjs --update  set every limit to today's size + 10%
import { build } from "esbuild";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const limitsFile = join(root, "tools", "size-limits.json");
const update = process.argv.includes("--update");
const limits = existsSync(limitsFile) ? JSON.parse(readFileSync(limitsFile, "utf8")) : {};

// Packages that run in Node, not the browser (build tooling): no browser bundle to budget.
const NODE_ONLY = new Set(["@lit-material/vite", "@lit-material/codemod"]);

const sizes = {};
for (const dir of readdirSync(join(root, "packages")).sort()) {
  const pkgDir = join(root, "packages", dir);
  const pkgFile = join(pkgDir, "package.json");
  if (!existsSync(pkgFile)) continue;
  const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
  const entry = join(pkgDir, "dist", "index.js");
  if (pkg.private || NODE_ONLY.has(pkg.name) || !existsSync(entry)) continue;
  const result = await build({
    stdin: { contents: `export * from ${JSON.stringify(entry)};`, resolveDir: pkgDir },
    bundle: true,
    minify: true,
    format: "esm",
    external: ["lit", "lit/*", "@lit/*", "@lit-labs/*"],
    write: false,
    logLevel: "error",
  });
  sizes[pkg.name] = gzipSync(result.outputFiles[0].contents, { level: 9 }).length;
}

if (update) {
  const next = Object.fromEntries(Object.entries(sizes).map(([name, size]) => [name, Math.ceil((size * 1.1) / 100) * 100]));
  writeFileSync(limitsFile, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Wrote limits for ${Object.keys(next).length} packages to tools/size-limits.json.`);
} else {
  const over = [];
  for (const [name, size] of Object.entries(sizes)) {
    const limit = limits[name];
    if (limit === undefined) over.push(`${name}: ${size} B gzipped, no limit — run node tools/size-check.mjs --update`);
    else if (size > limit) over.push(`${name}: ${size} B gzipped, over its ${limit} B limit`);
  }
  const total = Object.values(sizes).reduce((a, b) => a + b, 0);
  console.log(`${Object.keys(sizes).length} packages, ${(total / 1024).toFixed(1)} KiB gzipped in all (each bundled alone, without Lit).`);
  if (over.length) {
    console.error(over.join("\n"));
    console.error("Trim it, or raise the limit on purpose with --update and say why in the commit.");
    process.exit(1);
  }
}
