---
"@lit-material/menu": minor
---

`showForEvent(event)` opens a menu for a `contextmenu` event: at the pointer for a right click, under the element for the context menu key. Where the event fires with the right button still down (Linux, macOS), it opens after the release, which light dismiss would otherwise treat as a click outside and close the menu at once.
