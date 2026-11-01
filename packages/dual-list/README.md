# @lit-material/dual-list

Picks a subset of a list by moving items between "Available" and "Chosen": project members, permissions, scopes, regions. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/dual-list @lit-material/tokens
```

## Usage

```html
<lit-material-dual-list-selector id="scopes" filterable chosen-label="Granted"></lit-material-dual-list-selector>
<script type="module">
  import "@lit-material/dual-list";
  const scopes = document.querySelector("#scopes");
  scopes.items = [
    { value: "vm:read", label: "Read VMs" },
    { value: "vm:write", label: "Manage VMs" },
    { value: "billing", label: "Billing", disabled: true },
  ];
  scopes.selected = ["vm:read"];
  scopes.addEventListener("change", (e) => console.log(e.detail.selected));
</script>
```

## API

| Property         | Attribute         | Type                                     | Default       |
| ---------------- | ----------------- | ---------------------------------------- | ------------- |
| `items`          | `items` (JSON)                 | `{ value, label, disabled? }[]`          | `[]`          |
| `selected`       | `selected` (JSON)                 | `string[]` (chosen values)               | `[]`          |
| `availableLabel` | `available-label` | `string`                                 | `"Available"` |
| `chosenLabel`    | `chosen-label`    | `string`                                 | `"Chosen"`    |
| `filterable`     | `filterable`      | `boolean`                                | `false`       |
| `disabled`       | `disabled` (reflected) | `boolean`                           | `false`       |

Method: `move(side, values)`. Event: `change` (`detail: { selected }`, in `items` order). Parts:
`pane`, `list`, `option`. `--lit-material-dual-list-height` sets each list's height (default `16rem`).

The array properties above also take a JSON attribute, so markup rendered on the server carries the data and hydrates to the same output.

## Behavior

- Click marks an item, Ctrl/⌘-click adds to the marks, Shift-click marks a range; the arrow buttons
  move the marked items (or everything the filter shows), a double-click moves one item.
- Each list is a multi-select `listbox`: ↑/↓ move, Space marks, Shift+↑/↓ extends the marks,
  Ctrl+A marks everything shown, Enter moves the marked (or the current) item, Home/End jump. The
  header counts the marked items for screen readers.
- Disabled items show but never move. Below 600px the lists stack and the buttons sit between them.

## License

MIT
