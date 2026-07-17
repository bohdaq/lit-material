// Deliberately not @lit/localize (the guide's own code sample shows that — see the "Internationalization"
// step): a real message-extraction/XLIFF pipeline is disproportionate tooling for an illustrative demo. This
// is just enough to show localeContext's `locale`/`direction` actually driving a re-render and a `dir` flip.

export type Locale = "en" | "ar";

const dictionary: Record<Locale, Record<string, string>> = {
  en: { greeting: "Hello", tagline: "A small demo app." },
  ar: { greeting: "مرحبا", tagline: "تطبيق تجريبي صغير." },
};

export function t(locale: Locale, key: string): string {
  return dictionary[locale]?.[key] ?? dictionary.en[key] ?? key;
}
