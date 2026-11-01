// The pages module for scripts/prerender.mjs, built with `vite build --ssr` so
// the docs demo pages (TypeScript, Vite imports) load under Node.
import "../components.js";
import { navEntries } from "../../../docs/src/route-manifest.ts";
import { allComponents, allGuides } from "../catalog.js";
import { setLabels, setSizes } from "../packages.js";
import { componentPage } from "../pages/component.js";
import { guidePage } from "../pages/guides.js";
import * as home from "../pages/home.js";
import { changelog, componentsIndex, notFound, privacy, showcase } from "../pages/other.js";

export { setSizes };
export { documentHtml, ORIGIN } from "../shell.js";
export { favicon, mark } from "../brand/mark.js";

export function pages() {
  const bySlug = new Map(navEntries.filter((e) => e.path.startsWith("/components/")).map((e) => [e.path.slice("/components/".length), e]));
  const byPath = new Map(navEntries.map((e) => [e.path, e]));
  setLabels(new Map([...bySlug].map(([slug, e]) => [slug, e.label])));
  home.meta.jsonLd = home.structuredData();
  const missing = allComponents().filter((s) => !bySlug.has(s));
  if (missing.length) throw new Error(`No docs page for: ${missing.join(", ")}`);
  return [
    home,
    componentsIndex,
    ...allComponents().map((slug) => componentPage(slug, bySlug.get(slug))),
    ...allGuides().map((g) => guidePage(g.slug, g.from ? byPath.get(g.from) : null)),
    showcase,
    changelog,
    privacy,
    notFound,
  ];
}
