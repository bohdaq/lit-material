// Packages that run in Node, not the browser (build tooling). Nothing measures a browser bundle for them:
// tools/size-check.mjs and the site's package sizes (apps/site/scripts/prerender.mjs) skip them.
export const NODE_ONLY = new Set(["@lit-material/vite", "@lit-material/codemod"]);
