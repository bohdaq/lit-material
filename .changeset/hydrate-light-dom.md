---
"@lit-material/carousel": patch
"@lit-material/tree": patch
---

Hydrate without a mismatch: a carousel item's label overlay and a tree item's chevron no longer depend on reading light DOM children during render (the server can't see them, so the first browser render differed and Lit threw).
