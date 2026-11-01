# @lit-material/key-value

## 0.1.5

### Patch Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.
- Updated dependencies [13debbc]
  - @lit-material/text-field@0.4.0
  - @lit-material/button@0.3.0

## 0.1.4

### Patch Changes

- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
- Updated dependencies [4d0b41a]
  - @lit-material/icon-button@0.0.5
  - @lit-material/button@0.2.1
  - @lit-material/text-field@0.3.1
  - @lit-material/tokens@0.1.0

## 0.1.3

### Patch Changes

- Updated dependencies [7fd75e0]
  - @lit-material/button@0.2.0

## 0.1.2

### Patch Changes

- Updated dependencies [70757bb]
  - @lit-material/text-field@0.3.0
  - @lit-material/button@0.1.3

## 0.1.1

### Patch Changes

- Updated dependencies [998f020]
  - @lit-material/icon-button@0.0.4
  - @lit-material/tokens@0.0.2
  - @lit-material/button@0.1.2
  - @lit-material/text-field@0.2.1

## 0.1.0

### Minor Changes

- fd15402: New package: `lit-material-key-value-editor` for labels, annotations and environment variables — duplicate, missing and pattern key checks, `KEY=value` paste, masked values.

### Patch Changes

- Updated dependencies [0102a65]
- Updated dependencies [d7e23d1]
- Updated dependencies [dc110c6]
  - @lit-material/button@0.1.1
  - @lit-material/text-field@0.2.0
