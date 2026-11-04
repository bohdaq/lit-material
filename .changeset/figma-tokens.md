---
"@lit-material/tokens": patch
---

Figma hand-off: `figma/tokens.light.json` and `figma/tokens.dark.json` (also exported as `@lit-material/tokens/figma/*`) hold every `--md-sys-*` token in W3C Design Tokens (DTCG) format, one file per color mode, for Figma's Variables import and Tokens Studio. Colors are split from `light-dark()`, rem lengths converted to px, and each type scale role also gets a `typography` style token. See the README's Figma section.
