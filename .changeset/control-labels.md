---
"@lit-material/core": minor
"@lit-material/switch": minor
"@lit-material/checkbox": minor
"@lit-material/radio": minor
---

Switch, checkbox and radio take a visible `label` (clicking it toggles the control) and `supporting-text` (its description), so they no longer need a wrapping `<label>` and a repeated `aria-label`. Both render on the server. Core exports the shared `controlLabel` template and `controlLabelStyles`.
