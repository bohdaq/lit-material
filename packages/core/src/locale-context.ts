import { createContext } from "@lit/context";

export interface LocaleState {
  /** A BCP 47 language tag, e.g. `"en"`, `"fr"`, `"ar"`. */
  locale: string;
  /** Explicit text-direction override. Omit to infer from `locale` (see `@lit-material/core`'s README). */
  direction?: "ltr" | "rtl";
}

/**
 * Shared context key for threading the current locale down a component tree
 * without prop drilling — the same pattern `themeContext` uses for
 * dark/light mode, applied to i18n instead.
 *
 * `@lit-material/core` only defines the shared key and value shape here, on
 * purpose: an actual translation runtime (message extraction, `.xlf` files,
 * per-locale bundle loading) is a real, sizable dependency
 * ([`@lit/localize`](https://www.npmjs.com/package/@lit/localize), the Lit
 * team's own tool) that most of `lit-material`'s own components don't need,
 * since none of them have any hardcoded, translatable strings baked into
 * their templates in the first place — every visible label is either
 * slotted content or a consumer-supplied property (`aria-label`, `label`,
 * etc.), so translating *those* is purely a property of your own app's
 * strings, not `lit-material`'s. `localeContext` is the connective tissue
 * for that app-level `@lit/localize` setup: provide it once with the
 * active locale, combine it with `configureLocalization()`/`msg()`
 * yourself. See the docs app's "Building apps" guide (`apps/docs`, `/guide/building-apps`) for a worked
 * example.
 */
export const localeContext = createContext<LocaleState>(Symbol("lit-material-locale"));
