import { createContext } from "@lit/context";

export interface LocaleState {
  /** A BCP 47 language tag, e.g. `"en"`, `"fr"`, `"ar"`. */
  locale: string;
  /** Explicit text-direction override. Omit to infer from `locale` (see `@lit-material/core`'s README). */
  direction?: "ltr" | "rtl";
}

/**
 * Shared context key for threading the active locale down an app's component tree, the same pattern
 * `themeContext` uses for the color scheme.
 *
 * lit-material's components don't read it: they take their language from the nearest `lang` attribute
 * (see `LocalizeController` in `./localize.ts`), which also works without JavaScript and on the server. An
 * app that provides this context should set `lang`/`dir` on its host or `<html>` to match.
 */
export const localeContext = createContext<LocaleState>(Symbol("lit-material-locale"));
