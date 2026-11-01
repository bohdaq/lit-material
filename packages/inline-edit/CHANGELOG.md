# @lit-material/inline-edit

## 0.1.2

### Patch Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.
- Updated dependencies [13debbc]
  - @lit-material/text-field@0.4.0

## 0.1.1

### Patch Changes

- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
- Updated dependencies [4d0b41a]
  - @lit-material/icon-button@0.0.5
  - @lit-material/text-field@0.3.1
  - @lit-material/tokens@0.1.0

## 0.1.0

### Minor Changes

- ee7db09: New package: `lit-material-inline-edit`: edit a value in place, with async save, validation and errors.
