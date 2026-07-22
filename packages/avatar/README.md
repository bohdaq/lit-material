# @lit-material/avatar

Material Design 3-styled avatar web component built with [Lit](https://lit.dev/). Part of
[lit-material](https://github.com/bohdaq/lit-material).

An image, falling back to initials text, falling back to an icon — only one of the three ever
renders at a time.

![lit-material avatar: an image, two-letter initials on a tinted circle, and a default person icon, small/medium/large](./screenshot.png)

## Install

```sh
npm install @lit-material/avatar @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/avatar";
</script>

<lit-material-avatar src="/jane.jpg" alt="Jane Doe"></lit-material-avatar>
<lit-material-avatar initials="JD" alt="Jane Doe"></lit-material-avatar>
<lit-material-avatar alt="Jane Doe"></lit-material-avatar>
```

## API

| Property   | Attribute | Type                          | Default    |
| ---------- | --------- | ------------------------------ | ---------- |
| `src`      | `src`     | `string`                       | `""`       |
| `alt`      | `alt`     | `string`                       | `""`       |
| `initials` | `initials`| `string`                       | `""`       |
| `size`     | `size`    | `"small" \| "medium" \| "large"` | `"medium"` |
| `shape`    | `shape`   | `"circle" \| "square"`          | `"circle"` |

Slot: default — a custom icon, used only when there's no `src` (or it failed to load) and no
`initials`; falls back to a built-in person icon if left empty.

`alt` is both the image's `alt` text and, together with `initials`, what's exposed as the avatar's
accessible name (`role="img"` + `aria-label` on the container) regardless of which of the three
states is actually showing — set it to who/what the avatar represents even when you're passing
`initials` or nothing at all, not only when passing `src`.

For a size the three presets don't cover, override the `--lit-material-avatar-size` CSS custom
property directly (e.g. `style="--lit-material-avatar-size: 96px"`) rather than reaching for a
fourth attribute value.

## Behavior

If `src` fails to load (a broken URL, a network error), the avatar automatically falls back to
`initials`/the icon instead of showing a broken-image glyph — tracked per `src` value, so setting a
new `src` after a previous failure gets a fresh attempt.

## License

MIT
