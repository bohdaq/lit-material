# @lit-material/clipboard

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

- 3c76b75: New package `@lit-material/clipboard`: `copyText()` (falls back to `execCommand("copy")` where the Clipboard API is missing, e.g. plain http), `lit-material-copy-button` and `lit-material-clipboard-copy` (read-only value with copy, optionally masked). Code block copies through it, so it now works on plain-http pages and shows "Copy failed" instead of "Copied" when copying fails; `copy()` resolves whether it worked.
