# @lit-material/update-banner

A quiet bar that offers a new version of an app: "Version 1.3.0 is available · Restart to update ·
Later", with download progress, a ready state and errors. It never takes focus or blocks the page,
and doesn't care how the update arrives (Tauri, Electron, a service worker). Built with
[Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/update-banner @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/update-banner";
  const banner = document.querySelector("lit-material-update-banner");
  banner.addEventListener("update", async () => {
    banner.state = "downloading";
    await downloadAndInstall((received, total) => (banner.progress = received / total));
    banner.state = "ready"; // the button now restarts
  });
  banner.addEventListener("later", () => (banner.hidden = true));
</script>

<lit-material-update-banner floating app-name="Acme" version="1.3.0"></lit-material-update-banner>
```

| `state` | Shows |
| ------- | ----- |
| `available` | "Acme 1.3.0 is available", Restart to update, Later |
| `downloading` | "Downloading Acme 1.3.0…" and a progress bar (`progress` 0–1; none or negative: indeterminate) |
| `ready` | "Acme 1.3.0 is ready to install", Restart, Later |
| `error` | `error` (or "The update didn't install"), Try again, Later |

## API

| Property | Attribute | Type | Default |
| -------- | --------- | ---- | ------- |
| `version` | `version` | `string` | `""` |
| `appName` | `app-name` | `string` | `""` — "Version 1.3.0 is available" without one |
| `state` | `state` (reflected) | `"available" \| "downloading" \| "ready" \| "error"` | `"available"` |
| `progress` | `progress` | `number` | `-1` |
| `error` | `error` | `string` | `""` |
| `floating` | `floating` (reflected) | `boolean` | `false` |

Events: `update` (the main button: Restart to update, Restart or Try again) and `later`. The bar
never hides itself: set `hidden` or remove it on `later`, and ask again another time.

Slot: default, replacing the message (e.g. with a link to the release notes). Parts: `banner`,
`message`, `progress`, `actions`. Custom property: `--lit-material-update-banner-inset` (16px) for
`floating`, which pins the bar to the bottom end corner of the viewport (bottom left right to left).

## Accessibility

- `role="status"` (polite), never a dialog: nothing is focused or trapped.
- The live region hears each state change once; progress ticks aren't announced (the percentage is
  `aria-hidden`; the `<progress>` element, named "Update download", still exposes its value).

## License

MIT
