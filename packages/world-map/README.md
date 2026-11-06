# @lit-material/world-map

A world map shaded by a value per country (a choropleth): visitors, customers or requests by country. Built
with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/world-map @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/world-map";
</script>

<!-- Data as a JSON attribute (works server-rendered) or as the .data property. -->
<lit-material-world-map label="Visitors by country" unit="visitors" data='{"US": 1240, "DE": 310, "SG": 18}'></lit-material-world-map>

<!-- Selectable: a click, Enter or Space picks a country (again clears it). -->
<lit-material-world-map id="map" label="Visitors by country" selectable></lit-material-world-map>
<script type="module">
  const map = document.querySelector("#map");
  map.data = { US: 1240, DE: 310, FR: 120 };
  map.addEventListener("change", (e) => console.log(e.detail)); // { code: "DE", value: 310 }, or { code: "", value: null }
</script>
```

## API

| Property | Attribute | Type | Default |
| -------- | --------- | ---- | ------- |
| `data` | `data` (JSON) | `Record<string, number>` — values by ISO 3166-1 alpha-2 code, any case | `{}` |
| `label` | `label` | `string` — the accessible name | `""` ("World map", translated) |
| `unit` | `unit` | `string` — appended to values | `""` |
| `selectable` | `selectable` (reflected) | `boolean` | `false` |
| `selected` | `selected` | `string` — the selected code, or `""` | `""` |
| `format` | — | `(n: number) => string` | the element's language; compact from 10,000 |

Events: `change` (with `selectable`), `detail: { code, value }` — `code: ""` and `value: null` when the selection is
cleared. Parts: `map`, `tooltip`, `legend`, `elsewhere`. Custom properties: `--lit-material-world-map-fill`
(colour of the highest value; defaults to the first chart series colour), `--lit-material-world-map-empty`,
`--lit-material-world-map-border`.

Also exported: `COUNTRIES` (one SVG path per country code) and `VIEWBOX`, for drawing your own map, and
`level(value, max)`, the fill strength in percent.

How it reads:

- Shading is on a square-root scale from 18% to 90% of the fill colour, so a country with a few visitors stays
  visible next to one with thousands. The legend under the map shows the scale's two ends.
- Codes are summed case-insensitively; non-finite and negative values are left out.
- Countries too small for 1:110m shapes (Singapore, Malta, Bahrain, Hong Kong…) are listed under the map with
  their value — buttons when `selectable` — so none is dropped or unclickable.
- Country names come from `Intl.DisplayNames` in the element's language.

## Keyboard

The map is one tab stop. With it focused:

| Key | Does |
| --- | ---- |
| ↓ / → (← in RTL) | Next country with a value, highest first |
| ↑ / ← (→ in RTL) | Previous country |
| Home / End | Highest / lowest |
| Enter / Space | Select the country shown (with `selectable`); again clears |
| Escape | Hide the readout |

## Accessibility

The map is `role="img"`, named by its label and the five highest countries ("Visitors by country. Highest: United
States: 1,240 visitors; …"). A visually hidden table lists every country and value. Each country read with the
keyboard is announced through a live region, and selection with ", selected". In forced-colours mode countries
with a value are drawn in `GrayText` and the selected one in `Highlight`.

## Scope and limits

- One projection (Equal Earth) and one level of detail (Natural Earth 1:110m, cropped at 58°S, no Antarctica).
  No zoom, pan, regions or markers.
- One sequential colour; no diverging or categorical scales.
- The shapes are about 12 kB gzipped and ship only with this package. Regenerate them with
  `node scripts/generate.mjs` (pinned Natural Earth commit; `--from FILE` for an offline copy).

## Data

Country shapes: [Natural Earth](https://www.naturalearthdata.com) 1:110m Admin 0 – Countries, public domain.

## License

MIT
