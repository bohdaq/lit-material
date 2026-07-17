import { defineConfig } from "vite";

// Embedded via <iframe> in the docs site's "Building apps" wizard, served nested at
// `/lit-material/app-shell-demo/` in production (see apps/docs/vite.config.ts for the
// matching docs-site base). Local dev keeps serving at `/` for a normal standalone run.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/lit-material/app-shell-demo/" : "/",
}));
