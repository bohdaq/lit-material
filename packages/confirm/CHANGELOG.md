# @lit-material/confirm

## 0.1.5

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [4d0b41a]
- Updated dependencies [4d0b41a]
  - @lit-material/button@0.2.1
  - @lit-material/dialog@0.1.1
  - @lit-material/text-field@0.3.1
  - @lit-material/tokens@0.1.0

## 0.1.4

### Patch Changes

- Updated dependencies [7fd75e0]
- Updated dependencies [7fd75e0]
  - @lit-material/dialog@0.1.0
  - @lit-material/button@0.2.0

## 0.1.3

### Patch Changes

- Updated dependencies [70757bb]
  - @lit-material/text-field@0.3.0
  - @lit-material/button@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [998f020]
  - @lit-material/tokens@0.0.2
  - @lit-material/button@0.1.2
  - @lit-material/text-field@0.2.1
  - @lit-material/dialog@0.0.4

## 0.1.1

### Patch Changes

- Updated dependencies [0102a65]
- Updated dependencies [d7e23d1]
- Updated dependencies [dc110c6]
  - @lit-material/button@0.1.1
  - @lit-material/text-field@0.2.0

## 0.1.0

### Minor Changes

- 3ec7f58: New package: `confirm({ ... })` and `lit-material-confirm-dialog` — Cancel focused by default, destructive style, optional type-the-name-to-confirm field.

### Patch Changes

- Updated dependencies [a95654f]
  - @lit-material/text-field@0.1.2
  - @lit-material/dialog@0.0.3
