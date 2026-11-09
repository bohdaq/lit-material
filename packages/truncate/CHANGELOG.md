# @lit-material/truncate

## 1.4.0

### Patch Changes

- @lit-material/tokens@1.4.0

## 1.3.0

### Patch Changes

- @lit-material/tokens@1.3.0

## 1.2.1

### Patch Changes

- @lit-material/tokens@1.2.1

## 1.2.0

### Patch Changes

- @lit-material/tokens@1.2.0

## 1.1.0

### Patch Changes

- @lit-material/tokens@1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

### Patch Changes

- Updated dependencies [8646c7b]
- Updated dependencies [65ac716]
  - @lit-material/tokens@1.0.0

## 0.2.0

### Minor Changes

- 8507493: Framework bindings, generated from the custom elements manifest. `@lit-material/<pkg>/react` has a React wrapper per element, built on `@lit/react` (optional peer dependencies `@lit/react` and `react`): properties are set as properties and events map to `onChange`-style props. `@lit-material/<pkg>/jsx` types the elements in React 19 JSX and `@lit-material/<pkg>/vue` in Vue templates (load either with `import type {} from ...`). `dist/web-types.json` (JetBrains, found through the `web-types` field) and `dist/vscode.html-custom-data.json` give editor completion and docs in any template, Angular's included.

## 0.1.1

### Patch Changes

- Updated dependencies [4d0b41a]
  - @lit-material/tokens@0.1.0

## 0.1.0

### Minor Changes

- ee7db09: New package: `lit-material-truncate`: end or middle ellipsis that keeps the full text for copy, search and screen readers.
