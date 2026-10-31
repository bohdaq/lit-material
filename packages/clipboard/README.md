# @lit-material/clipboard

Copy to clipboard for URLs, ids, commands and tokens: `copyText()`, a copy button, and a read-only
value with a copy button (optionally masked). Built with [Lit](https://lit.dev/). Part of
[lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/clipboard @lit-material/tokens
```

## Usage

```html
<script type="module">
  import "@lit-material/clipboard";
</script>

<lit-material-clipboard-copy label="Endpoint" value="https://backend.example.com/mcp/acme"></lit-material-clipboard-copy>
<lit-material-clipboard-copy label="API token" value="…" masked></lit-material-clipboard-copy>

<code id="install">curl -fsSL https://rws8.tech/install.sh | sh</code>
<lit-material-copy-button for="install" label="Copy install command"></lit-material-copy-button>
```

```js
import { copyText } from "@lit-material/clipboard/copy-text.js"; // no elements registered
const ok = await copyText("hello");
```

For multi-line text (a kubeconfig, a script) use [`lit-material-code-block`](../code-block), which
copies with the same function.

## API

### `copyText(text): Promise<boolean>`

Uses the async Clipboard API, falling back to a selected off-screen `<textarea>` and
`document.execCommand("copy")` when the API is missing (it only exists in secure contexts, so not on
plain-http pages) or rejects. Resolves whether the copy worked; never throws.

### `lit-material-copy-button`

| Property | Attribute | Type | Default |
| -------- | --------- | ---- | ------- |
| `value` | `value` | `string` | `""` |
| `htmlFor` | `for` | `string` (an element id) | `""` |
| `label` | `label` | `string` | `"Copy"` |
| `disabled` | `disabled` | `boolean` | `false` |

Copies `value`, or else the `value` (inputs) or trimmed text of the element with id `for` in the same
document or shadow root. Shows a check mark for two seconds and announces "Copied" or "Couldn't copy"
through a status region. `copy()` copies from code and resolves whether it worked. Fires `copy` with
`detail: { text, ok }`.

### `lit-material-clipboard-copy`

| Property | Attribute | Type | Default |
| -------- | --------- | ---- | ------- |
| `value` | `value` | `string` | `""` |
| `label` | `label` | `string` | `""` (accessible name; the copy button becomes "Copy {label}") |
| `masked` | `masked` | `boolean` | `false` |

The value sits in a read-only input (selected on focus) in a monospace face
(`--lit-material-clipboard-copy-font`). `masked` shows dots with a show/hide toggle; copying still
copies the real value. Part: `field`. Fires `copy` like the button.

## License

MIT
