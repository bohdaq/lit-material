# @lit-material/confirm

A confirmation dialog for actions that need a second look: `await confirm({ ... })`, with a
destructive style and an optional type-the-name-to-confirm field. Built with
[Lit](https://lit.dev/) on [`@lit-material/dialog`](../dialog). Part of
[lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/confirm @lit-material/tokens
```

## Usage

```js
import { confirm } from "@lit-material/confirm";

if (await confirm({ headline: "Purge the cache?", message: "Entries are refetched on demand.", confirmLabel: "Purge" })) {
  await purge();
}

const ok = await confirm({
  headline: "Delete project web?",
  message: "Its VMs, disks and addresses are deleted too. This can't be undone.",
  confirmLabel: "Delete",
  destructive: true,
  requireText: "web",
});
```

`confirm()` creates a `lit-material-confirm-dialog`, attaches it to `document.body` (or
`container`), awaits it and removes it. To keep one in your markup instead:

```html
<lit-material-confirm-dialog id="purge" headline="Purge the cache?" confirm-label="Purge">
  Entries are refetched on demand.
</lit-material-confirm-dialog>

<script type="module">
  import "@lit-material/confirm";
  const confirmed = await document.querySelector("#purge").show();
</script>
```

## API

### `confirm(options): Promise<boolean>`

| Option | Type | Default |
| ------ | ---- | ------- |
| `headline` | `string` | required |
| `message` | `string` | `""` |
| `confirmLabel` | `string` | `"Confirm"` |
| `cancelLabel` | `string` | `"Cancel"` |
| `destructive` | `boolean` | `false` |
| `requireText` | `string` | `""` (no field) |
| `container` | `HTMLElement` | `document.body` |

### `lit-material-confirm-dialog`

| Property | Attribute | Type | Default |
| -------- | --------- | ---- | ------- |
| `headline` | `headline` | `string` | `""` |
| `message` | `message` | `string` | `""` |
| `confirmLabel` | `confirm-label` | `string` | `"Confirm"` |
| `cancelLabel` | `cancel-label` | `string` | `"Cancel"` |
| `destructive` | `destructive` | `boolean` | `false` |
| `requireText` | `require-text` | `string` | `""` |
| `open` | `open` | `boolean` | `false` |
| `returnValue` | — | `"confirm" \| "cancel" \| ""` | `""` |

| Method | |
| ------ | - |
| `show(): Promise<boolean>` | Opens it; resolves `true` on confirm, `false` on Cancel, Escape or a backdrop click. |
| `close(confirmed = false)` | Closes it as if the visitor picked that. |

The default slot replaces `message`. Fires `close` once after it closes.

## Behavior

Cancel gets focus when it opens, so a stray Enter doesn't confirm. With `require-text`, the field
gets focus instead, the confirm button stays disabled until the text matches exactly, and Enter
confirms once it does; the field is cleared every time it opens. `destructive` paints the confirm
button in `--md-sys-color-error`.

## License

MIT
