---
"@lit-material/date-picker": patch
---

The grid starts on the language's first day of the week in Firefox too: where `Intl.Locale` has no week info, the first day comes from CLDR's table for the language's likely region (Monday for `de`, Saturday for `ar`), instead of always Sunday.
