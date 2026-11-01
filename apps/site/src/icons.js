// Phosphor icons (skill B6), inlined at build time. Prerender only: reads the
// SVG files from @phosphor-icons/core, so never import this in the browser.
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The package exports no subpath for its assets; the build runs from apps/site.
const root = join(process.cwd(), "node_modules", "@phosphor-icons", "core", "assets");
const cache = new Map();

export function icon(name, weight = "regular") {
  const key = `${weight}/${name}`;
  if (!cache.has(key)) {
    const file = weight === "regular" ? `${name}.svg` : `${name}-${weight}.svg`;
    cache.set(key, readFileSync(join(root, weight, file), "utf8").replace("<svg ", '<svg aria-hidden="true" focusable="false" '));
  }
  return cache.get(key);
}
