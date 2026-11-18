# @lit-material/error-card

A failure explained: a short headline, what to try next, optional actions, and the raw error text
under a collapsible Details block with a copy button. Built with [Lit](https://lit.dev/). Part of
[lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/error-card @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/error-card";
</script>

<lit-material-error-card
  headline="Connection refused"
  details="tcp connect error: Connection refused (os error 111)"
>
  Nothing answered on that port: is the server running, and is the port right?
  <lit-material-button slot="actions" variant="tonal">Try again</lit-material-button>
</lit-material-error-card>

<!-- Something worked partly; announced because it answers what the person just did. -->
<lit-material-error-card variant="warning" alert headline="Saved, but 2 tests were skipped"></lit-material-error-card>
```

Turning an engine's message into a headline and a next step is your app's job (the card has no
error mapping of its own); keep the original text in `details` so people can copy and report it.

## API

| Property | Attribute | Type | Default |
| -------- | --------- | ---- | ------- |
| `headline` | `headline` | `string` | `""` |
| `details` | `details` | `string` | `""` — no Details block when empty |
| `variant` | `variant` (reflected) | `"error" \| "warning"` | `"error"` |
| `alert` | `alert` (reflected) | `boolean` | `false` |
| `open` | `open` (reflected) | `boolean` | `false` |

Method: `copyDetails()` copies `details` and resolves whether it worked. Event: `toggle`
(`detail: { open }`) when the Details block opens or closes. Slots: default (what to try next),
`actions`. Parts: `card`, `icon`, `headline`, `toggle`, `copy`, `details`. Custom properties:
`--lit-material-error-card-warning-color`, `--lit-material-error-card-warning-container`,
`--lit-material-error-card-details-max-height` (16rem; the block scrolls past it). The error
variant uses the `--md-sys-color-error*` tokens.

## Accessibility

- The headline starts with a visually hidden "Error:" or "Warning:", so the kind of message isn't
  conveyed by colour and icon alone.
- `alert` makes the card an assertive live region (`role="alert"`). Leave it off for a card that is
  there when the page loads; add it when the card appears in answer to an action.
- Details is a button with `aria-expanded` and `aria-controls`; Copy details announces "Copied"
  (or "Couldn't copy") through a status region.
- Right to left, the accent border and the chevron mirror.

## Scope

No error mapping (engine text to headline), no stack trace formatting, no retry timer.

## License

MIT
