# @lit-material/timing-waterfall

Where a request's time went: DNS, connect, waiting for the first byte and download, as one stacked bar and a
legend. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/timing-waterfall @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/timing-waterfall";
</script>

<!-- The object HITOP's run reports carry; a JSON attribute works for server rendering. -->
<lit-material-timing-waterfall
  timings='{"dnsMs":4,"connectMs":30,"waitMs":96,"downloadMs":12,"totalMs":142,"reused":false}'
></lit-material-timing-waterfall>

<lit-material-timing-waterfall id="build"></lit-material-timing-waterfall>
<script type="module">
  document.querySelector("#build").phases = [
    { label: "Queued", ms: 40 },
    { label: "Build", ms: 820, color: "var(--md-sys-color-primary)" },
  ];
</script>
```

Each phase gets a segment in proportion to its time; a phase too short to see is drawn a little wider so it
stays visible, and a zero phase draws nothing. The bar is one image for screen readers, named with every
phase and the total ("DNS: 4 ms, Connect: 30 ms, …"); the legend is text, in tabular figures. A reused
connection is said in the legend. Labels are translated (`@lit-material/translations`).

## API

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `timings` | `timings` | `{dnsMs, connectMs, waitMs, downloadMs, totalMs?, reused?} \| null` | `null` |
| `phases` | `phases` | `{label, ms, color?}[]` (wins over `timings`) | `[]` |
| `hideLegend` | `hide-legend` | `boolean` | `false` |

CSS custom properties: `--lit-material-timing-waterfall-dns`, `-connect`, `-wait`, `-download`, `-track`,
`-height`. Parts: `bar`, `segment`, `legend`.
