# @lit-material/code-block

## 0.2.1

### Patch Changes

- @lit-material/clipboard@0.2.1

## 0.2.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.

### Patch Changes

- Updated dependencies [13debbc]
  - @lit-material/clipboard@0.2.0

## 0.1.3

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [4d0b41a]
- Updated dependencies [4d0b41a]
  - @lit-material/clipboard@0.1.2
  - @lit-material/tokens@0.1.0

## 0.1.2

### Patch Changes

- d65e91e: `validateJson` (and `lit-material-code-field language="json"`) names the right line in Safari, whose JSON errors give neither a line nor a position.

## 0.1.1

### Patch Changes

- Updated dependencies [998f020]
  - @lit-material/tokens@0.0.2
  - @lit-material/clipboard@0.1.1

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
