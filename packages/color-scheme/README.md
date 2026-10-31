# @lit-material/color-scheme

A light/dark switch for pages using [`@lit-material/tokens`](../tokens): a toggle button, a persisted
setter, and a script that applies the saved choice before first paint. Built with
[Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/color-scheme @lit-material/tokens
```

## Usage

```html
<head>
  <!-- Before any stylesheet: a saved choice applies before first paint, so no light flash. -->
  <script>try{var s=localStorage.getItem("lit-material-color-scheme");if(s==="light"||s==="dark")document.documentElement.setAttribute("color-scheme",s)}catch(e){}</script>
  <link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
  <script type="module">
    import "@lit-material/color-scheme";
  </script>
</head>

<lit-material-color-scheme-toggle></lit-material-color-scheme-toggle>
```

That inline script is what `colorSchemeBootScript()` returns; when you render pages on the server,
emit `<script>${colorSchemeBootScript()}</script>` instead of copying it (pass your own storage key
if you set `storage-key`).

The tokens already follow the OS preference (`color-scheme: light dark`). Forcing a scheme sets
`color-scheme="light"` or `"dark"` on `<html>`; `auto` removes it again.

## API

### `lit-material-color-scheme-toggle`

| Property | Attribute | Type | Default |
| -------- | --------- | ---- | ------- |
| `cycle` | `cycle` | `boolean` | `false` |
| `storageKey` | `storage-key` | `string` | `"lit-material-color-scheme"` |

A `lit-material-icon-button`. By default a two-state toggle (pressed = dark) starting from what the
page shows, OS preference included. With `cycle` it steps light → dark → system, so a visitor can
go back to following the OS. Fires `change` with `detail.scheme` (`light`, `dark` or `auto`) after a
click. Every toggle on the page stays in sync, and follows OS changes while in `auto`.

If no boot script ran, the toggle applies the saved choice when it connects.

Slots `light-icon`, `dark-icon` and `auto-icon` replace the default sun, moon and half-circle icons:

```html
<lit-material-color-scheme-toggle>
  <svg slot="light-icon">…</svg>
  <svg slot="dark-icon">…</svg>
</lit-material-color-scheme-toggle>
```

### Functions

| Function | |
| -------- | - |
| `setColorScheme(scheme, { storageKey?, persist? })` | Force `light`/`dark` on `<html>` or clear it (`auto`); saves the choice unless `persist: false`; fires `lit-material-color-scheme-change` on `document`. |
| `getColorScheme()` | The forced scheme, or `auto`. |
| `resolvedColorScheme()` | What the page shows: `light` or `dark`. |
| `storedColorScheme(storageKey?)` | The saved choice, or `auto`. |
| `colorSchemeBootScript(storageKey?)` | The no-flash `<head>` script as a string. |

Storage can be unavailable (private windows, blocked site data); every read and write is guarded and
the choice then lasts for the page only.

## License

MIT
