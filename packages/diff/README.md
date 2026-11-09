# @lit-material/diff

Diff views: how a text changed, line by line (in one column or side by side), a list of changes by path for structured data, and a merge view for versions that both changed a common base. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/diff @lit-material/tokens
```

## Usage

```html
<lit-material-diff label="Changes to rws.yaml" mode="split"></lit-material-diff>
<script type="module">
  import "@lit-material/diff";
  const diff = document.querySelector("lit-material-diff");
  diff.original = "port: 8080\nlog: info";
  diff.modified = "port: 8443\nlog: info";
</script>

<lit-material-change-list
  changes='[{"path":"$.status","kind":"changed","before":"pending","after":"ready"}]'
></lit-material-change-list>

<lit-material-merge-view base="2" sides='[{"label":"Mine","text":"a\nB"},{"label":"Theirs","text":"a\nb2"},{"label":"Base","text":"a\nb"}]'>
  <button slot="side-0">Keep mine</button>
</lit-material-merge-view>
```

Without a DOM (Node, workers):

```js
import { diffLines, sideBySide, hunks, stats } from "@lit-material/diff/lines.js";
```

## API

`lit-material-diff`

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `original` | `original` | `string` | `""` |
| `modified` | `modified` | `string` | `""` |
| `mode` | `mode` (reflected) | `"unified" \| "split"` | `"unified"` |
| `context` | `context` | `number` (unchanged lines kept around each change; `-1` keeps all) | `3` |
| `label` | `label` | `string` (accessible name) | `"Changes"`, translated |
| `originalLabel` | `original-label` | `string` | `"Before"`, translated |
| `modifiedLabel` | `modified-label` | `string` | `"After"`, translated |
| `hideStats` | `hide-stats` | `boolean` | `false` |
| `diff` | — | `DiffLine[]` (read only) | |

Parts `table`, `stats`. Custom properties `--lit-material-diff-added-background`, `--lit-material-diff-added-color`, `--lit-material-diff-removed-background`, `--lit-material-diff-removed-color`, `--lit-material-diff-font`, `--lit-material-diff-max-height`.

`lit-material-change-list`: `changes` (`{ path, kind: "added" | "removed" | "changed", before?, after? }[]`, property or JSON attribute), `label` (default `"Changes"`, translated). Values that aren't strings are shown as JSON. Parts `list`, `item`, `path`.

`lit-material-merge-view`: `sides` (`{ label, text }[]`, property or JSON attribute), `base` (index of the side the others are compared with, default `0`). Slots `side-0`, `side-1`, … for each side's actions. Parts `side`, `heading`, `lines`.

### `lit-material-conflict-resolver`

One conflict between two versions of a text (a sync conflict, a merge conflict in YAML or JSON):
yours and theirs side by side, each marking the lines only it has, a radio group to keep yours,
theirs or both, and an editable result.

```html
<lit-material-conflict-resolver yours-note="Priya · 10:12" theirs-note="Jonas · 10:31"></lit-material-conflict-resolver>
<script type="module">
  const r = document.querySelector("lit-material-conflict-resolver");
  r.yours = mine;
  r.theirs = server;
  r.addEventListener("resolve", (e) => save(e.detail.text)); // { text, choice, edited }
</script>
```

| Property | Attribute | Default |
| --- | --- | --- |
| `yours`, `theirs` | `yours`, `theirs` | `""` |
| `yoursLabel`, `theirsLabel` | `yours-label`, `theirs-label` | "Yours", "Theirs" (translated) |
| `yoursNote`, `theirsNote` | `yours-note`, `theirs-note` | `""` — who and when |
| `choice` | `choice` | `"both"` (`yours`, `theirs`, `both`) |
| `value` | `value` | the result text, from the choice unless set or edited |

Events: `change` (`{ choice }`), `resolve` (`{ text, choice, edited }`). `keepBoth(yours, theirs)` and
`resolveText(choice, yours, theirs)` are exported for use without the element.

## Behavior

- `diffLines` trims the common head and tail, then runs an LCS on the rest. Above 4 million cells (`limit`) it reports the middle as removed then added rather than stall the page.
- Each line is a table row with both line numbers; added and removed lines carry visually hidden "Added:" and "Removed:" text, so they don't rest on colour. Forced colours draw a solid or dashed bar.
- The lines sit in a focusable, labelled scroll region. All three elements render on the server from attributes.

## License

MIT
