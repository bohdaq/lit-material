// Build-time facts about the packages: name, description and version from each
// package.json, the elements' API from custom-elements.json (written by
// `pnpm analyze`), and gzipped sizes measured by the prerender. Node only.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PACKAGE_OF } from "./catalog.js";

// The build runs from apps/site.
export const REPO_ROOT = join(process.cwd(), "..", "..");

const state = { labels: new Map(), sizes: new Map() };

/** Page labels from the docs routes, e.g. "segmented-button" → "Segmented Button". */
export function setLabels(map) {
  state.labels = map;
}

/** Gzipped bytes per package name, measured by scripts/prerender.mjs. */
export function setSizes(map) {
  state.sizes = map;
}

export function labelOf(slug) {
  return state.labels.get(slug) ?? slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function packageDirOf(slug) {
  return PACKAGE_OF[slug] ?? slug;
}

function readJson(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

export function packageInfo(dir) {
  const pkg = readJson(join(REPO_ROOT, "packages", dir, "package.json"));
  if (!pkg) return null;
  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description ?? "",
    size: state.sizes.get(pkg.name) ?? null,
    manifest: readJson(join(REPO_ROOT, "packages", dir, "custom-elements.json")),
  };
}

/** The custom element declarations in a package's manifest. */
export function elementsOf(manifest) {
  return (manifest?.modules ?? []).flatMap((m) => (m.declarations ?? []).filter((d) => d.customElement && d.tagName));
}

/** Exported functions (for packages like format that ship no elements). */
export function functionsOf(manifest) {
  const names = new Set((manifest?.modules ?? []).flatMap((m) => (m.exports ?? []).map((e) => e.name)));
  return (manifest?.modules ?? []).flatMap((m) => (m.declarations ?? []).filter((d) => d.kind === "function" && names.has(d.name)));
}

/**
 * The elements a page documents: for a page named after its package, every
 * element there except those with a page of their own; for a page about one
 * element of another package, just that element.
 */
export function elementsForPage(slug, info) {
  const all = elementsOf(info?.manifest);
  if (PACKAGE_OF[slug]) return all.filter((d) => d.tagName === `lit-material-${slug}`);
  const ownedElsewhere = new Set(Object.keys(PACKAGE_OF).filter((s) => PACKAGE_OF[s] === slug).map((s) => `lit-material-${s}`));
  return all.filter((d) => !ownedElsewhere.has(d.tagName));
}

export function formatBytes(n) {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

/** Counts for the landing page: public packages, their elements, the median gzipped size. */
export function siteStats() {
  const dirs = readdirSync(join(REPO_ROOT, "packages")).filter((d) => {
    const pkg = readJson(join(REPO_ROOT, "packages", d, "package.json"));
    return pkg && !pkg.private;
  });
  const elements = dirs.reduce((n, d) => n + elementsOf(readJson(join(REPO_ROOT, "packages", d, "custom-elements.json"))).length, 0);
  const sizes = [...state.sizes.values()].sort((a, b) => a - b);
  const median = sizes.length ? sizes[Math.floor(sizes.length / 2)] : 0;
  return { packages: dirs.length, elements, medianKb: (median / 1024).toFixed(1) };
}
