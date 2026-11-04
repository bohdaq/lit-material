# @lit-material/rich-text

Material Design 3 rich-text editor web component built with [Lit](https://lit.dev/). Part of
[lit-material](https://github.com/bohdaq/lit-material).

`lit-material-rich-text-editor` is a formatting toolbar (WAI-ARIA
[Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) pattern) over a `contenteditable` surface
(`role="textbox"`, `aria-multiline`) whose content is held to a small schema:

| Blocks | Inline |
| --- | --- |
| `p`, `h2`, `h3`, `blockquote` (of `p`), `pre`, `ul`/`ol` of `li` (nested) | `strong`, `em`, `u`, `s`, `code`, `a[href]`, `br` |

It doesn't use `document.execCommand`. The editor keeps its own document model (a flat list of
blocks of marked-up text), and every command — formatting, Enter, Backspace across blocks, paste,
undo/redo — is an operation on that model, re-rendered with DOM methods. What the browser changes
natively (typing, spellcheck, IME composition) is read back into the model and normalized. The `value`
is always schema HTML, and it's form-associated like a text field.

## Install

```sh
npm install @lit-material/rich-text @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/rich-text";
</script>

<form>
  <lit-material-rich-text-editor
    name="body"
    label="Release notes"
    supporting-text="Markdown shortcuts work: ## heading, - list, > quote"
    required
    value="<p>Fixes <strong>login</strong> on Safari.</p>"
  ></lit-material-rich-text-editor>
</form>
<script type="module">
  const editor = document.querySelector("lit-material-rich-text-editor");
  editor.addEventListener("input", () => console.log(editor.value, editor.getText()));
</script>
```

`new FormData(form).get("body")` is the HTML. `editor.getText()` gives plain text and
`editor.getMarkdown()` CommonMark (with `~~strikethrough~~`; underline has no Markdown and is written as
`<u>…</u>`).

## API

| Property | Attribute | Type | Default | |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string` | `""` | HTML. Sanitized on set; reads back normalized (`""` when empty). Setting it resets undo. |
| `label` | `label` | `string` | `""` | Shown above the box; names the textbox. |
| `placeholder` | `placeholder` | `string` | `""` | |
| `supportingText` | `supporting-text` | `string` | `""` | |
| `errorText` | `error-text` | `string` | `""` | Replaces supporting text (and the validation message) when invalid. |
| `error` | `error` | `boolean` | `false` | Forces the error state. |
| `required` | `required` | `boolean` | `false` | Empty is `valueMissing`. |
| `maxlength` | `maxlength` | `number` | — | Shows a counter; more text characters than this is `tooLong` (typing isn't blocked). |
| `disabled` | `disabled` | `boolean` | `false` | Also follows a disabled `<fieldset>`. |
| `readonly` | `readonly` | `boolean` | `false` | Focusable, not editable. |
| `name` | `name` | `string` | `""` | Form field name. |
| `variant` | `variant` | `"outlined" \| "filled"` | `"outlined"` | |

| Method / getter | |
| --- | --- |
| `command(name, value?)` | Runs a command on the selection (or the last one): `bold`, `italic`, `underline`, `strikethrough`, `code`, `paragraph`, `heading2`, `heading3`, `bulletList`, `numberedList`, `quote`, `codeBlock`, `link` (with a URL; without, opens the link panel), `unlink`, `clearFormatting`, `indent`, `outdent`, `undo`, `redo`. Returns whether anything changed. |
| `getText()` / `getMarkdown()` | The content as plain text / Markdown. |
| `canUndo` / `canRedo` | |
| `checkValidity()`, `reportValidity()`, `validity`, `validationMessage`, `form` | As on form controls. |

Events: `input` (bubbles, composed) after every change; `change` when focus leaves the editor after a
change. Parts: `container`, `toolbar`, `content`, `label`, `supporting`, `link-panel`. Custom
properties: `--lit-material-rich-text-min-height` (default `8rem`), `--lit-material-rich-text-max-height`
(default `none`; the surface scrolls past it).

The model is exported too — `htmlToDoc`, `docToHtml`, `docToText`, `docToMarkdown`, `safeHref` from
`@lit-material/rich-text` (all of `@lit-material/rich-text/model.js` for more) — so a server can
sanitize submitted HTML with exactly the editor's rules: `docToHtml(htmlToDoc(untrusted))`.

## Keyboard

In the content (`Ctrl` or `⌘`):

| Keys | |
| --- | --- |
| `Ctrl+B` / `I` / `U` | Bold / italic / underline (with a collapsed caret: for the next typed text) |
| `Ctrl+Shift+X`, `Ctrl+E` | Strikethrough, inline code |
| `Ctrl+K` | Insert or edit a link |
| `Ctrl+Alt+0` / `2` / `3` | Paragraph / heading 2 / heading 3 |
| `Ctrl+Shift+8` / `7` | Bulleted / numbered list |
| `Tab` / `Shift+Tab` in a list | Indent / outdent the item (`Shift+Tab` at the top level ends the list) |
| `Esc`, then `Tab` | Leave the editor from inside a list |
| `Ctrl+Z`, `Ctrl+Shift+Z` / `Ctrl+Y` | Undo, redo (the editor's own history, 100 steps; a typing burst is one step) |
| `Enter` | New block; in an empty list item or quote, leaves it; in a code block a new line, and on an empty last line leaves it |
| `Shift+Enter` | Line break |
| `Backspace` at a block's start | Lifts a list item / quote / code block, else joins with the block before |

Markdown-style shortcuts at the start of a paragraph, completed with a space: `##` and `###` headings,
`-`/`*`/`+` bulleted and `1.` numbered lists, `>` quote, ```` ``` ```` code block.

The toolbar is one tab stop: `←`/`→` move between controls (swapped right to left), `Home`/`End` go to
the first/last. Buttons are toggle buttons (`aria-pressed` follows the selection) with
`aria-keyshortcuts`; using one from the keyboard leaves focus on the toolbar and acts on the last
selection. Undo/redo are `aria-disabled` when there's nothing to do. Changes made with shortcuts are
announced in a polite live region ("Bold on", "List level 2", "Undone").

The link panel (`role="dialog"`, non-modal) takes a URL; `Enter` applies, `Esc` cancels. `example.com`
becomes `https://example.com` and `name@example.com` a `mailto:` link.

## Security

- **Allowed URLs**: `http:`, `https:`, `mailto:` and relative URLs. Anything else (`javascript:`,
  `data:`, `vbscript:`, `file:`…, also with control characters or entities hidden in the scheme) is
  dropped from pasted HTML and the `value`, and refused by the link panel and `command("link", …)`.
- **Sanitizing**: pasted HTML, dropped-in `value`s and natively edited content go through the same
  converter, which keeps only the schema: `script`, `style`, `iframe`, `object`, `svg`, `img`, form
  controls and the like are removed with their content; unknown elements (`span`, `div`, `font`…) are
  unwrapped (blocks become paragraphs); every attribute but `a`'s `href` is dropped (`style` is only read
  for bold/italic/underline/strikethrough, as Google Docs and Word paste them).
- **Trusted Types / CSP**: HTML strings are parsed by the package's own tokenizer, and the DOM is
  built with `createElement`/`createTextNode` — no `innerHTML`, `DOMParser` or `createContextualFragment`.
  So the editor needs no Trusted Types policy of its own (none is created) and works under
  `require-trusted-types-for 'script'; trusted-types lit-html` and a `style-src 'self'` CSP.
- Paste is always handled by the editor (`insertFromPaste` never runs natively); drag and drop of
  content is blocked.

## Server rendering

The sanitized value renders on the server inside the textbox, with `contenteditable="false"`; after
hydration the editor takes over the content and turns editing on.

## Scope

Not included in this version — deliberately, to keep the core solid:

- Images, tables, text color/highlight, alignment, font family/size, `h1`/`h4`–`h6` (pasted `h1` becomes
  `h2`, `h4`–`h6` become `h3`), horizontal rules.
- Drag and drop of content, collaborative editing, mentions, a bubble/floating toolbar.
- A Markdown *input* format (only output via `getMarkdown()`), and Markdown rules for inline marks
  (`**bold**` as you type).
- Indent/outdent toolbar buttons (keyboard and `command()` only).
- Quotes hold paragraphs only (a heading or list inside a pasted quote loses the quote), and a code block
  is plain text (no language, no highlighting).
- `maxlength` is a validity limit and a counter, not a hard stop.
- Browser coverage: the tests run in Chromium. Firefox (document selection inside shadow roots) and
  Safari 17+ (`Selection.getComposedRanges`) have code paths but haven't been through the suite yet
  (`WTR_BROWSERS=all`).

## License

MIT
