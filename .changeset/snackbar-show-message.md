---
"@lit-material/snackbar": patch
---

`show(message)` replaces the snackbar's text before opening it, for reusing one instance as a queue. Slotted elements such as an action button are kept; `show()` without an argument is unchanged.
