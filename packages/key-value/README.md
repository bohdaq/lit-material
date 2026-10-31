# @lit-material/key-value

An editor for ordered key/value pairs: labels, annotations, environment variables, headers. Each
row is a key field, a value field and a remove button. It flags duplicate and missing keys, can
check keys against a pattern, and turns pasted `KEY=value` lines into rows. Built with
[Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/key-value @lit-material/tokens
```

## Usage

```html
<lit-material-key-value-editor
  id="labels"
  key-label="Label"
  add-label="Add label"
  key-pattern="([a-z0-9]([-a-z0-9.]*[a-z0-9])?/)?[A-Za-z0-9]([-A-Za-z0-9_.]*[A-Za-z0-9])?"
  key-pattern-message="Letters, digits, - _ . and an optional prefix/"
></lit-material-key-value-editor>

<script type="module">
  import "@lit-material/key-value";
  const labels = document.querySelector("#labels");
  labels.entries = [{ key: "app", value: "web" }];
  labels.addEventListener("change", (e) => console.log(e.detail.entries));
  // On save:
  if (labels.checkValidity()) save(labels.toObject());
</script>
```

## API

| Property            | Attribute             | Type              | Default         |
| ------------------- | --------------------- | ----------------- | --------------- |
| `entries`           | —                     | `KeyValueEntry[]` | `[]`            |
| `keyLabel`          | `key-label`           | `string`          | `"Key"`         |
| `valueLabel`        | `value-label`         | `string`          | `"Value"`       |
| `addLabel`          | `add-label`           | `string`          | `"Add"`         |
| `keyPattern`        | `key-pattern`         | `string` (regex, whole key) | `""`  |
| `keyPatternMessage` | `key-pattern-message` | `string`          | `"Invalid key"` |
| `maskValues`        | `mask-values`         | `boolean`         | `false`         |
| `disabled`          | `disabled` (reflected)| `boolean`         | `false`         |
| `readonly`          | `readonly`            | `boolean`         | `false`         |

`KeyValueEntry` is `{ key: string; value: string }`. `entries` leaves out rows whose key and value
are both empty, so an added, untouched row doesn't count.

Methods: `toObject()` (last duplicate wins), `checkValidity()` (focuses the first bad key),
`addRow()`. Getter: `valid`. Event: `change`, `detail: { entries }`, after every edit, add or
remove. Parts: `row`, `add`.

`parseKeyValues(text)` is exported too: it reads `.env` lines (comments, `export`, quotes),
`a=b,c=d` selectors and `key: value` lines, and returns `[]` for anything else.

## Behavior

- Duplicate keys show "Duplicate key" on each; a value without a key shows "Key required".
- Add focuses the new key field; removing a row moves focus to the next remove button (or Add).
- `readonly` and `disabled` hide Add and the remove buttons.
- Below 480px a row stacks the value under the key.

## License

MIT
