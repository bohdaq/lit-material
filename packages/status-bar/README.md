# @lit-material/status-bar

A thin bar along the bottom of an app window, like an editor's: the open file, the save state, the
connection, a shortcut hint. Built with [Lit](https://lit.dev/). Part of
[lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/status-bar @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/status-bar";
</script>

<lit-material-status-bar>
  <lit-material-status-bar-item>shop-api/orders/create-order.yaml</lit-material-status-bar-item>
  <lit-material-status-bar-item tone="warning">Unsaved · ⌘S writes the file</lit-material-status-bar-item>
  <lit-material-status-bar-item slot="end">TLS 1.3 · h2</lit-material-status-bar-item>
  <lit-material-status-bar-item slot="end" button description="Show keyboard shortcuts">? Shortcuts</lit-material-status-bar-item>
</lit-material-status-bar>
```

Items in the default slot sit at the start, items in `end` at the end. On a narrow window the bar
wraps onto more lines rather than clipping. Numbers use tabular figures.

## API

### `lit-material-status-bar`

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `label` | `label` | `string` | `""` (the region's name; unset, "Status", translated) |

Slots: default (start), `end`. Part: `bar`. CSS properties: `--lit-material-status-bar-height` (28px),
`--lit-material-status-bar-background`, `--lit-material-status-bar-color`.

### `lit-material-status-bar-item`

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `button` | `button` | `boolean` | `false` — render a `<button>` (listen for `click`) |
| `href` | `href` | `string` | `""` — render a link |
| `tone` | `tone` | `"neutral" \| "success" \| "warning" \| "error"` | `"neutral"` |
| `description` | `description` | `string` | `""` — the item's `title` |

Slots: default (text), `icon`. Part: `item`. `tone` sets the colour only: say the state in words
too ("Unsaved", "2 conflicts").

## Accessibility

The bar is a `role="region"` named by `label`. Button and link items are real `<button>` and `<a>`
elements in the tab order; plain items are text. Touch screens get 32px tall targets.
