// Builds the Pagefind search index into dist/pagefind. Pages mark what to
// index with data-pagefind-body. Embedded guides (data-search-embed) keep
// their text in a declarative shadow root, which Pagefind skips, so they're
// indexed from a copy with the shadow root's <template> unwrapped.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as pagefind from "pagefind";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "pagefind" ? [] : htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

const { index, errors } = await pagefind.createIndex({});
if (!index) throw new Error(`pagefind: ${errors.join(", ")}`);
const dir = await index.addDirectory({ path: dist });
let embedded = 0;
for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, "utf8");
  if (!html.includes("data-search-embed")) continue;
  const content = html
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<\/?template\b[^>]*>/g, "")
    .replace("data-search-embed", "data-pagefind-body");
  const result = await index.addHTMLFile({ sourcePath: relative(dist, file), content });
  if (result.errors?.length) throw new Error(`pagefind ${file}: ${result.errors.join(", ")}`);
  embedded++;
}
await index.writeFiles({ outputPath: join(dist, "pagefind") });
await pagefind.close();
console.log(`search index: ${dir.page_count} pages, plus ${embedded} embedded guides`);
