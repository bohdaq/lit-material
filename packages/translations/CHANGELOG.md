# @lit-material/translations

## 0.1.0

### Minor Changes

- db33e54: Languages and right to left. Components take their language from the nearest `lang` attribute (through shadow roots, else `<html lang>`) and re-render when `<html lang>`/`<html dir>` changes.

  - `@lit-material/core/localize.js`: `LocalizeController` (`term(key, english, args)` with `{name}` placeholders and plural forms through `Intl.PluralRules`, `number`, `date`, `lang`), `registerTranslation`, `setFallbackLocale`, `isRtl`.
  - The 201 pieces of English the components render or announce themselves (button names, aria-labels, live-region announcements, validation messages, counts) go through it. New `@lit-material/translations` has catalogs for Arabic, German, Spanish, French, Japanese, Polish and Ukrainian; English stays built in.
  - Label properties that defaulted to English (`label = "Copy"` and the like) are now unset by default and fall back to the translated text; an explicit value, including `""`, still wins.
  - Dates and numbers inside components (date and time pickers, timestamp, pagination, usage meter, charts, file sizes) are formatted in the element's language. The date pickers' first day of the week now follows the language where the browser exposes week info (Monday for `lang="de"`); set `first-day-of-week` to keep a fixed one. Chart `format`/`formatX`/`formatY` default to `undefined` (a language-aware formatter) instead of `formatNumber`.
  - Right to left everywhere: logical CSS, horizontal arrow keys flip in tabs, radio groups, segmented buttons, steppers, date grids, trees, carousels and the color picker; menus, popovers, selects, the overflow menu, autocomplete and the color picker open from the start edge; directional icons mirror; the slider thumb, tabs indicator, skeleton wave, log marks and bar chart follow reading direction. Code, clock dials and a line chart's time axis stay left to right.
  - Fixes found on the way: `prefers-reduced-motion` now stops the skeleton animation.

### Patch Changes

- Updated dependencies [db33e54]
  - @lit-material/core@0.3.0
