import { isServer, type ReactiveController, type ReactiveControllerHost } from "lit";

/**
 * A message with plural forms, chosen by the `count` argument through `Intl.PluralRules` for the locale:
 * `{ one: "{count} file", other: "{count} files" }`. `other` is required; `zero`, `one`, `two`, `few` and
 * `many` are used where the language has them.
 */
export type PluralMessage = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>;

/** A message: text with `{name}` placeholders, or plural forms of one. */
export type Message = string | PluralMessage;

/** Values for a message's `{name}` placeholders; numbers are formatted for the locale. */
export type MessageArgs = Record<string, string | number>;

/**
 * A set of messages for one locale, keyed `<package>.<message>` (e.g. `"alert.dismiss"`). Partial on
 * purpose: a missing key falls back to the base language (`pt` for `pt-BR`), then to the component's own
 * English text.
 */
export interface Translation {
  /** BCP 47 language tag: `"fr"`, `"pt-BR"`. */
  $code: string;
  /** The language's own name for itself, for a language picker: `"Français"`. */
  $name?: string;
  /** Text direction, for apps that set `dir` from the active translation. */
  $dir?: "ltr" | "rtl";
  [key: string]: Message | undefined;
}

const translations = new Map<string, Translation>();
const controllers = new Set<LocalizeController>();
let fallbackLocale = "en";
let observer: MutationObserver | undefined;

function updateAll(): void {
  for (const controller of controllers) controller.refresh();
}

/**
 * Adds messages for one or more locales. Registering the same `$code` again merges into what's there, so
 * an app can override a few component messages on top of a published catalog. Connected components
 * re-render.
 */
export function registerTranslation(...added: Translation[]): void {
  for (const translation of added) {
    const code = translation.$code.toLowerCase();
    translations.set(code, { ...translations.get(code), ...translation });
  }
  updateAll();
}

/**
 * The locale used where no `lang` attribute applies — on the server, or a page without `<html lang>`.
 * Default `"en"`.
 */
export function setFallbackLocale(locale: string): void {
  fallbackLocale = locale;
  updateAll();
}

const pluralRules = new Map<string, Intl.PluralRules>();
const numberFormats = new Map<string, Intl.NumberFormat>();

function cached<V>(cache: Map<string, V>, locale: string, make: (locale: string) => V): V {
  let value = cache.get(locale);
  if (!value) {
    try {
      value = make(locale);
    } catch {
      value = make(fallbackLocale); // an invalid lang attribute shouldn't break rendering
    }
    cache.set(locale, value);
  }
  return value;
}

function lookup(locale: string, key: string): Message | undefined {
  const code = locale.toLowerCase();
  const exact = translations.get(code)?.[key];
  if (exact !== undefined) return exact;
  const base = code.split("-")[0]!;
  return base === code ? undefined : translations.get(base)?.[key];
}

/**
 * The text for `key` in `locale`: a registered translation, else `fallback` (the component's English),
 * with plural forms chosen by `args.count` and `{name}` placeholders filled in.
 */
export function formatMessage(locale: string, key: string, fallback: Message, args: MessageArgs = {}): string {
  const message = lookup(locale, key) ?? fallback;
  let text: string;
  if (typeof message === "string") {
    text = message;
  } else {
    const count = Number(args.count ?? 0);
    const rule = cached(pluralRules, locale, (l) => new Intl.PluralRules(l)).select(count);
    text = message[rule] ?? message.other;
  }
  if (!text.includes("{")) return text;
  return text.replace(/\{(\w+)\}/g, (token, name: string) => {
    const value = args[name];
    if (value === undefined) return token;
    return typeof value === "number" ? cached(numberFormats, locale, (l) => new Intl.NumberFormat(l)).format(value) : value;
  });
}

/** The nearest `lang` attribute above `el`, crossing shadow roots, else `<html lang>`, else the fallback. */
export function langOf(el: Element): string {
  if (isServer) return el.getAttribute?.("lang") || fallbackLocale;
  let node: Element | null = el;
  while (node) {
    const found: Element | null = node.closest("[lang]");
    if (found) {
      const lang = found.getAttribute("lang");
      if (lang) return lang;
      node = found.parentElement; // lang="" means "unknown": keep looking
      continue;
    }
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return fallbackLocale;
}

/** Whether `el` is laid out right to left (`dir` attributes, crossing shadow roots, or `direction` CSS). */
export function isRtl(el: Element): boolean {
  if (isServer) return el.getAttribute?.("dir") === "rtl";
  try {
    return el.matches(":dir(rtl)");
  } catch {
    return getComputedStyle(el).direction === "rtl";
  }
}

/**
 * Gives a component its locale and messages. `term()` looks a message up in the registered translations
 * for the element's language — the nearest `lang` attribute, through shadow roots, else `<html lang>` — and
 * falls back to the English text the component passes in. Components re-render when `<html lang>` or
 * `<html dir>` changes, or translations are registered.
 *
 * ```ts
 * private readonly localize = new LocalizeController(this);
 * render() {
 *   return html`<button aria-label=${this.localize.term("alert.dismiss", "Dismiss")}>…</button>`;
 * }
 * ```
 */
export class LocalizeController implements ReactiveController {
  readonly host: ReactiveControllerHost & HTMLElement;
  private cachedLang: string | undefined;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.cachedLang = undefined;
    controllers.add(this);
    if (!observer && typeof MutationObserver !== "undefined" && !isServer) {
      observer = new MutationObserver(() => updateAll());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "dir"] });
    }
  }

  hostDisconnected(): void {
    controllers.delete(this);
  }

  hostUpdated(): void {
    // Read the language once per update cycle (willUpdate through render), fresh for the next one.
    this.cachedLang = undefined;
  }

  /** Re-reads the language and re-renders: call it after changing a `lang` attribute above the element. */
  refresh(): void {
    this.cachedLang = undefined;
    this.host.requestUpdate();
  }

  /** The element's language. */
  get lang(): string {
    return (this.cachedLang ??= langOf(this.host));
  }

  /** `"rtl"` when the element is laid out right to left. */
  get dir(): "ltr" | "rtl" {
    return isRtl(this.host) ? "rtl" : "ltr";
  }

  /** The message for `key` in the element's language, or `fallback` (English) when none is registered. */
  term(key: string, fallback: Message, args?: MessageArgs): string {
    return formatMessage(this.lang, key, fallback, args);
  }

  /** A number formatted for the element's language. */
  number(value: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.lang, options).format(value);
    } catch {
      return new Intl.NumberFormat(fallbackLocale, options).format(value);
    }
  }

  /** A date formatted for the element's language. */
  date(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
    try {
      return new Intl.DateTimeFormat(this.lang, options).format(value);
    } catch {
      return new Intl.DateTimeFormat(fallbackLocale, options).format(value);
    }
  }
}
