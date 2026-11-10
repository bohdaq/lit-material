# @lit-material/command-palette

A modal command palette: one search field over commands and items, fuzzy matched, grouped by section, fully
usable from the keyboard. Built with [Lit](https://lit.dev/). Part of
[lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/command-palette @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/command-palette";

  const palette = document.querySelector("lit-material-command-palette");
  palette.items = [
    { id: "run", label: "Run collection", section: "Commands", shortcut: ["⌘", "R"] },
    { id: "new", label: "New request", section: "Commands", keywords: ["create"] },
    { id: "co", label: "Create order", section: "Requests", hint: "orders" },
    { id: "stg", label: "Staging", section: "Environments" },
  ];
  palette.prefixes = { ">": "Commands", "@": "Environments" };
  palette.addEventListener("select", (e) => console.log(e.detail.item.id, e.detail.query));

  // The palette binds no global keys: open it from your own shortcut.
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      palette.show();
    }
  });
</script>

<lit-material-command-palette></lit-material-command-palette>
```

Typing filters as a subsequence match (letters in order, not necessarily together); runs of letters and word
starts rank higher, and the matched letters are highlighted. A prefix from `prefixes` limits the list to one
section. Arrow keys, Home and End move (disabled rows are skipped), Enter or a click chooses, Escape or a
click outside closes. Tab fires a cancelable `tab` event with the query, for handing it to something else
such as an assistant; focus stays in the palette while it is open and returns where it was when it closes.

It is built on the native `<dialog>` (top layer, the page behind is inert) with the ARIA combobox pattern.

## API

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` |
| `items` | `items` | `{id, label, section?, hint?, keywords?, shortcut?, disabled?, method?}[]` | `[]` |
| `prefixes` | `prefixes` | `Record<string, string>` | `{}` |
| `placeholder` | `placeholder` | `string` | translated "Search or run a command…" |
| `label` | `label` | `string` | translated "Command palette" |
| `preview` | — | `(item) => unknown` | unset (no pane) |
| `hints` | `hints` | `{keys, label}[]` | `[]` |

An item's `method` (e.g. `POST`, `WS`) shows as a coloured `lit-material-method-tag` before its label.
`preview` renders the active item in a pane beside the list (a Lit template, a string or a node; return
`null` or `nothing` for none) and widens the panel; the pane hides below 720px. `hints` adds key hints to
the footer, e.g. `[{ keys: ["⇥"], label: "ask agent" }]`.

Methods: `show()`, `hide()` (no `close` event). Events: `select` (`{item, query}`, then closes), `close`
(closed by Escape, a click outside or a choice), `tab` (`{query}`, cancelable). `fuzzyMatch(query, text)`
is exported.

CSS custom properties: `--lit-material-command-palette-width`, `-max-height`, `-top`, `-preview-width`. Parts: `dialog`,
`input`, `listbox`, `option`, `method`, `preview`, `footer`.
