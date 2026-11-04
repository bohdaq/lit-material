# @lit-material/rich-text

## 1.2.0

### Patch Changes

- @lit-material/core@1.2.0
- @lit-material/tokens@1.2.0

## 1.1.0

### Patch Changes

- @lit-material/core@1.1.0
- @lit-material/tokens@1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

### Patch Changes

- Updated dependencies [8646c7b]
- Updated dependencies [65ac716]
  - @lit-material/tokens@1.0.0
  - @lit-material/core@1.0.0

## 0.1.0

### Minor Changes

- 16e62c3: New package `@lit-material/rich-text`: `lit-material-rich-text-editor`, a Material toolbar (WAI-ARIA toolbar, roving focus, `aria-pressed` following the selection) over a `contenteditable` textbox held to a small schema (p, h2, h3, strong, em, u, s, code, pre, blockquote, ul, ol, li, a[href], br). Commands, Enter/Backspace across blocks, Tab/Shift+Tab list indenting, paste and undo/redo are operations on the editor's own document model rather than `document.execCommand`; native typing is read back and normalized. Pasted HTML and the `value` are sanitized by a built-in tokenizer (scripts, event handlers, styles, unknown elements and `javascript:`-style URLs removed; links limited to http(s), mailto and relative), and the DOM is built with `createElement` only, so no Trusted Types policy is needed. Form-associated (`name`, `required`, `maxlength`, `disabled`, `readonly`), label/supporting/error text like the text field, link panel, Ctrl/Cmd shortcuts, Markdown-style block shortcuts, `getText()` and `getMarkdown()`, server rendering with hydration. Translations: the editor's 34 messages in all catalogs.
