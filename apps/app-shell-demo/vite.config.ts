import { defineConfig } from "vite";

// Embedded via <iframe> in the "Building apps" guide. The docs build serves it at
// `/lit-material/app-shell-demo/` (see apps/docs/vite.config.ts); lit.rws8.tech builds it
// again at `/app-shell-demo/` (apps/site/scripts/app-shell-demo.mjs passes its own base).
// Local dev keeps serving at `/` for a normal standalone run.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/lit-material/app-shell-demo/" : "/",
}));
