# @lit-material/binary-viewer

Shows binary content, like a response body or an uploaded file, by its content type: an image with
its pixel size, a PDF in the browser's PDF viewer, and a hex dump with a Download button for anything else.
Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/binary-viewer @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/binary-viewer";
  const viewer = document.querySelector("lit-material-binary-viewer");
  const response = await fetch("/files/report.pdf");
  viewer.contentType = response.headers.get("content-type");
  viewer.data = await response.blob();
</script>

<lit-material-binary-viewer filename="report.pdf"></lit-material-binary-viewer>
```

| Content type | View |
| ------------ | ---- |
| `image/*` | `<img>` on a checkerboard; the facts line adds its pixel size once it loads |
| `application/pdf` | the browser's own PDF viewer in an `<object type="application/pdf">` on a blob URL typed `application/pdf` (so the bytes can only be shown as a PDF, never run as a page), plus a link that opens it on its own. Chromium refuses PDFs in a sandboxed `<iframe>`, so it isn't one. |
| anything else | a hex dump (offset, hex and ASCII columns) of the first `max-bytes` bytes, saying how much it shows |

Every view starts with a line saying what the content is (Image · 12.4 KiB · image/png · 640 ×
480) and a Download button. SVG is shown as an image, so its scripts never run.

## API

| Property | Attribute | Type | Default |
| -------- | --------- | ---- | ------- |
| `data` | — (property only) | `Uint8Array \| ArrayBuffer \| Blob \| null` | `null` |
| `contentType` | `content-type` | `string` | `""` — a Blob's own type, else `application/octet-stream` |
| `filename` | `filename` | `string` | `""` |
| `maxBytes` | `max-bytes` | `number` | `4096` |

Read-only: `type` (the content type in use), `view` (`"image" | "pdf" | "binary"`).

Event: `download` (cancelable, `detail: {blob, filename}`) when Download is pressed. Cancel it to
save the file your own way (a desktop app's save dialog); otherwise the browser downloads it.

Parts: `facts`, `image`, `frame`, `dump`. Custom property: `--lit-material-binary-viewer-max-height`
(480px) for the image, the frame and the dump.

Helpers, also from `@lit-material/binary-viewer/binary.js` (no element): `viewOf(contentType)`,
`hexRows(bytes, max)` (`{offset, hex: [first8, last8], ascii}` per 16 bytes) and
`hexDump(bytes, max)` (the classic `00000000  89 50 4e 47 …  |.PNG....|` text).

## Behaviour

- Object URLs are made in the browser only, after the first render (the server renders the facts
  line without content), replaced when `data` or the content type changes, and revoked when the
  element leaves the page; it makes a new one if it comes back.
- From a Blob, only the bytes the dump shows are read.
- Under a strict Content Security Policy, allow blob URLs for the views: `img-src blob:` for
  images and `object-src blob:` for PDFs (Download needs neither).
- The dump is capped at `max-bytes` (rounded up to rows of 16) rather than virtualised; raise it
  for more.

## Accessibility

The dump is a focusable, labelled region ("Hex dump of collection.zip") so keyboard users can
scroll it; it stays left to right on right-to-left pages, while the facts line follows the page.
The image's `alt` is its file name and type; the PDF viewer's title is the file name, and where a browser can't show PDFs inline the object says so (the open link and Download still work).

## Scope

No audio or video players, no text decoding of the bytes, no paging through the dump.

## License

MIT
