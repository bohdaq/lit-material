import { defineConfig } from "vite";

// `vite build` makes the browser bundle (one entry, hashed); `vite build --ssr
// src/server/entry.js` makes the pages module that scripts/prerender.mjs renders
// with Lit SSR into dist/<route>/index.html, using the manifest for asset names.
export default defineConfig({
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    manifest: true,
    assetsDir: "assets",
    rollupOptions: { input: "src/client/main.js" },
  },
  // Bundle workspace packages and material-color-utilities into the SSR build:
  // their extensionless deep imports don't resolve under plain Node.
  ssr: { noExternal: [/^@lit-material\//, /^@material\//] },
});
