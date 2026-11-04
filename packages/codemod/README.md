# @lit-material/codemod

Codemods for moving to [lit-material](https://github.com/bohdaq/lit-material). `md-web` rewrites
[`@material/web`](https://github.com/material-components/material-web) (Google's Material 3 `md-*`
elements, v2) to lit-material in HTML, Lit templates, JSX/TSX and CSS, and reports by file and line
everything it couldn't rewrite with confidence.

The guide, with the full element table: [Migrate from @material/web](https://lit.rws8.tech/guides/migrate-material-web/).

## Run it

Commit first: files are rewritten in place. `--dry-run` prints the same report and writes nothing.

```sh
npx @lit-material/codemod md-web src --dry-run
npx @lit-material/codemod md-web src index.html
```

Folders are searched for `.html .htm .ts .tsx .js .jsx .mjs .cjs .mts .cts .css .scss .sass .less`,
skipping `node_modules`, `dist`, `build`, `coverage` and hidden folders.

For example:

```text
  changed  src/app.ts:3: import "@material/web/button/filled-button.js" → import "@lit-material/button"
  changed  src/app.ts:12: <md-outlined-text-field> → <lit-material-text-field variant="outlined">
  changed  src/app.ts:12: <md-outlined-text-field> prefix-text → prefix
  warning  src/app.ts:31: <md-slider> range: lit-material-slider is single-value; a two-thumb range is not supported

4 files read; 3 rewritten (52 changes); 9 warnings to resolve by hand.
Install what the rewritten files use:  npm install @lit-material/tokens @lit-material/button @lit-material/text-field …
```

## What it rewrites

- **Tags**, start and end: `md-filled-button` → `lit-material-button variant="filled"`,
  `md-outlined-text-field` → `lit-material-text-field variant="outlined"` (or `lit-material-textarea`
  for `type="textarea"`), `md-menu-item` → `lit-material-list-item interactive`, and so on for buttons,
  icon buttons, FABs, checkbox, radio, switch, slider, text fields, selects and options, chips, dialog,
  menu, list, tabs, progress, divider and icon.
- **Attributes, properties and events** that are named differently (`prefix-text` → `prefix`,
  `selected` → `checked` on the switch, `active-tab-index` → `selected`, FAB `variant` → `color` and
  `size="medium"` → `"regular"`, `inset` → `inset-start inset-end`, the `closed` event → `close`), in any
  binding syntax: plain and Lit (`.prop`, `?attr`, `@event`), Angular (`[prop]`, `[attr.x]`, `(event)`),
  Vue (`:prop`, `@event`) and JSX (`prop={…}`, `onevent={…}`). Labels that were attributes (`label` on
  chips and FABs) become text content. Where @material/web's default differs it adds the attribute
  (`color="surface"` on FABs, `removable` on input chips).
- **Slots** of children that changed name: `headline` → default slot, `start` → `leading`, `end` →
  `trailing`, the dialog's `content` → default slot, an icon button's unslotted `<md-icon>` → `slot="icon"`.
- **Imports**: `import "@material/web/button/filled-button.js"` → `import "@lit-material/button"`, once
  per package per file (a package the file already imports isn't added again); quotes and semicolons
  are kept.
- **CSS**: `--md-sys-*` tokens are lit-material's own names and stay. Each `--md-<component>-*`
  token is reported with the lit-material element's `--lit-material-*` properties and `::part`s, and
  `--md-sys-*` tokens no lit-material component reads are listed.

## What it reports instead

Nothing below is changed; each is a warning with `file:line`.

- `md-*` elements with no lit-material equivalent (`md-chip-set`, `md-sub-menu`, `md-ripple`,
  `md-focus-ring`, `md-elevation`) and ones it doesn't know (labs, your own `md-` elements).
- Attributes, events and slots with no counterpart (`soft-disabled`, a two-thumb `range` slider, menu
  `positioning`, `opened` events, a select option's `supporting-text`), and bound values that would need
  mapping (`size=${s}` on a FAB).
- Material Symbols ligatures (`<md-icon>settings</md-icon>`): lit-material-icon loads no icon font.
- `<label for>` pointing at a checkbox, radio or switch, which doesn't toggle the lit-material control.
- `import "@material/web/all.js"` (with the imports to use instead), imports of md-web classes
  (`import { MdDialog }`, with lit-material's class name), dynamic imports and other references.
- `md-*` tag names left in selectors, strings and comments.

Running it twice changes nothing the second time.

## How it reads files

HTML is parsed with [parse5](https://github.com/inikulin/parse5), with source locations, so `<template>`
content and inline `<script type="module">` (scanned as JavaScript) are covered. Lit templates and JSX
sit inside JavaScript, which an HTML parser can't read, and a full TypeScript AST would still leave the
template text to parse; so for `.ts`/`.js`/`.tsx`/`.jsx` a scanner finds start and end tags of custom
elements (names with a hyphen) and reads their attributes, skipping `${…}` and `{…}` expressions with
awareness of strings, template literals and comments. Plain tags are only looked at when they carry a
`slot` attribute, so TypeScript generics (`Map<K, V>`) and comparisons aren't mistaken for markup. Every
edit is a splice into the original text.

Limits: markup built at runtime (string concatenation, `<${tag}>`) isn't seen; tags written in JavaScript
comments are rewritten like any others; a `slot` attribute is matched to the nearest enclosing custom
element. Vue and Svelte files aren't read.

## API

```js
import { transform } from "@lit-material/codemod";

const { code, changes, warnings, packages } = transform(source, "src/app.ts");
```

`transform(source, file)` picks the syntax from the file's extension and labels its reports with
`file`. `changes` and `warnings` are `file:line: …` strings; `packages` lists the lit-material packages
the result uses. The mapping table itself is `@lit-material/codemod/mappings` (`ELEMENTS`,
`TOKEN_PREFIXES`).

## License

MIT
