---
"@lit-material/accordion": minor
"@lit-material/breadcrumbs": minor
"@lit-material/carousel": minor
"@lit-material/chart": minor
"@lit-material/chip": minor
"@lit-material/clipboard": minor
"@lit-material/code-block": minor
"@lit-material/data-list": minor
"@lit-material/data-table": minor
"@lit-material/date-picker": minor
"@lit-material/description-list": minor
"@lit-material/dialog": minor
"@lit-material/list": minor
"@lit-material/menu": minor
"@lit-material/navigation": minor
"@lit-material/progress": minor
"@lit-material/search": minor
"@lit-material/segmented-button": minor
"@lit-material/select": minor
"@lit-material/sheet": minor
"@lit-material/simple-list": minor
"@lit-material/speed-dial": minor
"@lit-material/stepper": minor
"@lit-material/tabs": minor
"@lit-material/toolbar": minor
"@lit-material/tree": minor
"@lit-material/text-field": minor
"@lit-material/button": minor
"@lit-material/confirm": patch
"@lit-material/dual-list": patch
"@lit-material/inline-edit": patch
"@lit-material/key-value": patch
---

One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.
