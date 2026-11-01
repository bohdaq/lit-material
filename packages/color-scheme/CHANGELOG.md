# @lit-material/color-scheme

## 0.1.3

### Patch Changes

- eb88ae2: The toggle hydrates without a mismatch in dark mode: it reads the page's scheme after its first render instead of before, so that render matches the server's.

## 0.1.2

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
- Updated dependencies [4d0b41a]
  - @lit-material/icon-button@0.0.5
  - @lit-material/tokens@0.1.0

## 0.1.1

### Patch Changes

- Updated dependencies [998f020]
  - @lit-material/icon-button@0.0.4
  - @lit-material/tokens@0.0.2

## 0.1.0

### Minor Changes

- f892aad: New package: `lit-material-color-scheme-toggle` (light/dark, or light/dark/system with `cycle`), `setColorScheme()` with persistence and cross-toggle sync, and `colorSchemeBootScript()` for a no-flash `<head>` script.
