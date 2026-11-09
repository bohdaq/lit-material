# @lit-material/kbd

A keyboard shortcut drawn as key caps. `Mod+K` is ⌘K on Apple platforms and Ctrl+K elsewhere;
screen readers hear the keys' names ("Command K"), not the symbols. Built with
[Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/kbd @lit-material/tokens
```

## Usage

```html
<script type="module">
  import "@lit-material/kbd";
</script>

Press <lit-material-kbd keys="Mod+K"></lit-material-kbd> to search,
<lit-material-kbd keys="Mod+Shift+P"></lit-material-kbd> for commands,
<lit-material-kbd keys="G I"></lit-material-kbd> to go to the inbox.
```

Keys joined by `+` are pressed together; groups separated by spaces are pressed one after another
("G, then I"). Named keys: `Mod`, `Cmd`/`Meta`, `Ctrl`, `Alt`/`Option`, `Shift`, `Enter`, `Escape`,
`Tab`, `Backspace`, `Delete`, `Space`, `ArrowUp`/`Down`/`Left`/`Right`, `PageUp`, `PageDown`,
`Home`, `End`; anything else is drawn as written (single letters in capitals). `Ctrl++` is the plus key.

The server renders the non-Apple form and the platform is detected once the element runs in the
browser, so hydration never mismatches. `platform="apple"` or `"other"` pins it.

## API

| Property   | Attribute  | Type                          | Default   |
| ---------- | ---------- | ----------------------------- | --------- |
| `keys`     | `keys`     | `string`                      | `""`      |
| `platform` | `platform` | `"auto" \| "apple" \| "other"` | `"auto"`  |
| `size`     | `size`     | `"small" \| "medium"`         | `"small"` |

`spokenText` (read only) is what assistive technology reads. `parseShortcut(text, apple)` and
`isApplePlatform()` are exported for apps that draw shortcuts themselves.

CSS custom properties: `--lit-material-kbd-font`, `--lit-material-kbd-background`,
`--lit-material-kbd-color`, `--lit-material-kbd-border`. Parts: `keys`, `key`, `label`.

The spoken key names are translated by `@lit-material/translations` (`kbd.*`).

## License

MIT
