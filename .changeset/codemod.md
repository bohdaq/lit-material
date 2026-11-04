---
"@lit-material/codemod": minor
---

New package: `npx @lit-material/codemod md-web <paths> [--dry-run]` moves an app from `@material/web` to lit-material. It rewrites `md-*` tags (`md-filled-button` → `lit-material-button variant="filled"`), renamed attributes, properties, events and child slots in any binding syntax, labels that become text content, and `@material/web/<component>.js` imports (one per package), in HTML (parse5), Lit templates, JSX/TSX and CSS. Everything without a confident mapping (unknown elements, unsupported attributes, icon ligatures, component tokens, class imports, `all.js`) is reported with file and line and left as it is. `transform(source, file)` is the same rewrite as a function; `@lit-material/codemod/mappings` is the mapping table the guide renders.
