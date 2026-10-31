# @lit-material/clipboard

## 0.1.0

### Minor Changes

- 3c76b75: New package `@lit-material/clipboard`: `copyText()` (falls back to `execCommand("copy")` where the Clipboard API is missing, e.g. plain http), `lit-material-copy-button` and `lit-material-clipboard-copy` (read-only value with copy, optionally masked). Code block copies through it, so it now works on plain-http pages and shows "Copy failed" instead of "Copied" when copying fails; `copy()` resolves whether it worked.
