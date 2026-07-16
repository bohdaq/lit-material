import { defineConfig } from "vite";

// GitHub Pages serves a project site (not a user/org root site) at
// `https://<user>.github.io/<repo>/`, not domain root — Vite needs `base` set
// accordingly so built asset URLs resolve, and the app itself reads
// `import.meta.env.BASE_URL` (see bootstrap-router.ts / with-base.ts) to stay
// consistent. Local dev keeps serving at `/` for a normal `localhost:5173`
// experience.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/lit-material/" : "/",
}));
