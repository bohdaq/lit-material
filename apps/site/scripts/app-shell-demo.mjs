// Builds apps/app-shell-demo into dist/app-shell-demo/, the live demo the
// "Building apps" guide embeds in an iframe. Its own build uses the old docs
// base (/lit-material/app-shell-demo/), so this passes the site's. Runs after
// the search index, so Pagefind never indexes the demo's pages.
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = fileURLToPath(new URL("../../app-shell-demo/", import.meta.url));
const outDir = fileURLToPath(new URL("../dist/app-shell-demo/", import.meta.url));

await build({ root, base: "/app-shell-demo/", logLevel: "warn", build: { outDir, emptyOutDir: true } });
console.log("app-shell demo built into dist/app-shell-demo/");
