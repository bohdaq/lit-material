# @lit-material/code-block

## 0.1.0

### Minor Changes

- 0e435c0: `lit-material-code-field`: an editable plain-text code field for YAML/JSON — line numbers, Tab/Shift+Tab indent with an Escape release, auto-indent, `language="json"` validation with the error line, custom `validator`.

### Patch Changes

- 0102a65: Component custom properties for values themes reached through `::part`: button shape and pressed scale, code-block shape, container colour, fonts and line height, alert shape, stat value font.

## 0.0.2

### Patch Changes

- 3c76b75: New package `@lit-material/clipboard`: `copyText()` (falls back to `execCommand("copy")` where the Clipboard API is missing, e.g. plain http), `lit-material-copy-button` and `lit-material-clipboard-copy` (read-only value with copy, optionally masked). Code block copies through it, so it now works on plain-http pages and shows "Copy failed" instead of "Copied" when copying fails; `copy()` resolves whether it worked.
- Updated dependencies [3c76b75]
  - @lit-material/clipboard@0.1.0
