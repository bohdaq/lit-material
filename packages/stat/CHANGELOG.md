# @lit-material/stat

## 0.0.4

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [4d0b41a]
  - @lit-material/tokens@0.1.0

## 0.0.3

### Patch Changes

- Updated dependencies [998f020]
  - @lit-material/tokens@0.0.2

## 0.0.2

### Patch Changes

- 0102a65: Component custom properties for values themes reached through `::part`: button shape and pressed scale, code-block shape, container colour, fonts and line height, alert shape, stat value font.
