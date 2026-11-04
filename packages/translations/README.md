# @lit-material/translations

Message catalogs for the text [lit-material](https://github.com/bohdaq/lit-material) components render
themselves: button names, aria-labels, screen-reader announcements, validation messages and counts. English
is built into every component; this package adds:

| Code | Language | Direction |
| --- | --- | --- |
| `ar` | العربية | rtl |
| `de` | Deutsch | ltr |
| `es` | Español | ltr |
| `fr` | Français | ltr |
| `ja` | 日本語 | ltr |
| `pl` | Polski | ltr |
| `uk` | Українська | ltr |

## Install

```sh
npm install @lit-material/translations
```

## Usage

Register the languages your app offers, once, at startup. Each one is its own module, so you only ship the
ones you import:

```ts
import { registerTranslation } from "@lit-material/core/localize.js";
import de from "@lit-material/translations/de.js";
import ar from "@lit-material/translations/ar.js";

registerTranslation(de, ar);
```

Components use the language of the nearest `lang` attribute (through shadow roots), else `<html lang>`, and
re-render when `<html lang>` or `<html dir>` changes:

```html
<html lang="de">          <!-- every component in German -->
<section lang="ar" dir="rtl">…</section>  <!-- this part in Arabic, right to left -->
```

A language you haven't registered, or a message a catalog lacks, falls back to the base language (`de` for
`de-AT`) and then to English. Dates and numbers inside components follow the same language through `Intl`,
whether or not a catalog is registered.

### Changing a few messages

Registering the same `$code` again merges into what's there, so an app can override single messages:

```ts
registerTranslation({ $code: "en", "alert.dismiss": "Close" });
```

### Your own language

Start from `en` and keep every key. The `Catalog` type makes TypeScript fail when a component adds a
message your catalog doesn't have yet:

```ts
import type { Catalog } from "@lit-material/translations";

const nl = {
  $code: "nl",
  $name: "Nederlands",
  $dir: "ltr",
  "alert.dismiss": "Sluiten",
  // ...
} satisfies Catalog;
```

Messages are plain text with `{name}` placeholders. A count is a plural object chosen through
`Intl.PluralRules` for the language: `{ one: "{count} bestand", other: "{count} bestanden" }`; give every
category the language has (`new Intl.PluralRules("pl").resolvedOptions().pluralCategories`).

Contributions of new languages, and corrections from native speakers, are welcome: the catalogs here were
written carefully but haven't all been reviewed by native speakers yet.

### Your app's own text

These catalogs cover the components' text only. For your app's strings, use
[`@lit/localize`](https://lit.dev/docs/localization/overview/), or register your own keys with
`registerTranslation` and read them with a `LocalizeController` (`this.localize.term("app.greeting", "Hello")`).

## How the catalogs stay complete

`en.ts` is generated from the components' source (`node tools/messages.mjs`): every
`localize.term("key", "English")` call. CI fails when it's stale, and a test checks every other catalog has
exactly its keys, the same placeholders, and every plural form its language needs.

## License

MIT
