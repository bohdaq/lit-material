---
"@lit-material/rich-text": minor
"@lit-material/translations": minor
---

New package `@lit-material/rich-text`: `lit-material-rich-text-editor`, a Material toolbar (WAI-ARIA toolbar, roving focus, `aria-pressed` following the selection) over a `contenteditable` textbox held to a small schema (p, h2, h3, strong, em, u, s, code, pre, blockquote, ul, ol, li, a[href], br). Commands, Enter/Backspace across blocks, Tab/Shift+Tab list indenting, paste and undo/redo are operations on the editor's own document model rather than `document.execCommand`; native typing is read back and normalized. Pasted HTML and the `value` are sanitized by a built-in tokenizer (scripts, event handlers, styles, unknown elements and `javascript:`-style URLs removed; links limited to http(s), mailto and relative), and the DOM is built with `createElement` only, so no Trusted Types policy is needed. Form-associated (`name`, `required`, `maxlength`, `disabled`, `readonly`), label/supporting/error text like the text field, link panel, Ctrl/Cmd shortcuts, Markdown-style block shortcuts, `getText()` and `getMarkdown()`, server rendering with hydration. Translations: the editor's 34 messages in all catalogs.
