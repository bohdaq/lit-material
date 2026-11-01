---
"@lit-material/color-scheme": patch
---

The toggle hydrates without a mismatch in dark mode: it reads the page's scheme after its first render instead of before, so that render matches the server's.
