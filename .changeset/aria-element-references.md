---
"@lit-material/core": minor
"@lit-material/checkbox": patch
"@lit-material/fab": patch
"@lit-material/icon-button": patch
"@lit-material/radio": patch
"@lit-material/slider": patch
"@lit-material/switch": patch
"@lit-material/tabs": patch
---

`aria-labelledby` on checkbox, FAB, icon button, radio, slider and switch, and a tab's `aria-controls`, now reach the elements they name. They used to be copied as ids onto the control inside the shadow root, where an id from the page resolves to nothing; they're now linked through ARIA element reflection (`setAriaElements`, new in `@lit-material/core`).
