# @lit-material/codemod

## 1.2.0

## 1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

## 0.1.0

### Minor Changes

- 31f4218: New package: `npx @lit-material/codemod md-web <paths> [--dry-run]` moves an app from `@material/web` to lit-material. It rewrites `md-*` tags (`md-filled-button` → `lit-material-button variant="filled"`), renamed attributes, properties, events and child slots in any binding syntax, labels that become text content, and `@material/web/<component>.js` imports (one per package), in HTML (parse5), Lit templates, JSX/TSX and CSS. Everything without a confident mapping (unknown elements, unsupported attributes, icon ligatures, component tokens, class imports, `all.js`) is reported with file and line and left as it is. `transform(source, file)` is the same rewrite as a function; `@lit-material/codemod/mappings` is the mapping table the guide renders.
