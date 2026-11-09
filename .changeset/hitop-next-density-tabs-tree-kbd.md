---
"@lit-material/tokens": minor
"@lit-material/button": minor
"@lit-material/icon-button": minor
"@lit-material/text-field": minor
"@lit-material/select": minor
"@lit-material/list": minor
"@lit-material/tabs": minor
"@lit-material/tree": minor
"@lit-material/kbd": minor
"@lit-material/translations": minor
---

Compact density: `density="compact"` on any ancestor shrinks buttons, icon buttons, tabs, list and tree rows, text fields and selects (tokens `--md-sys-density-*`, read by those components). Graphite: an opt-in dark palette, `@lit-material/tokens/css/presets/graphite.css` (on :root and under `theme="graphite"`). Tabs: `reorderable` (drag, or Alt+Shift+Arrow / Ctrl+Shift+PageUp/PageDown; cancelable `reorder` `{from, to}`), edge fades in a scrollable row. Tree items: `trailing` and `actions` slots (actions show on hover or focus and don't select); tree `reorderable` (drag among siblings, or Alt+Shift+ArrowUp/Down; cancelable `reorder` `{item, parent, from, to}`). New `@lit-material/kbd`: keyboard shortcuts as key caps, ⌘ on Apple platforms, Ctrl elsewhere, read out by name.
