/** `auto` follows the OS/browser preference. */
export type ColorScheme = "light" | "dark" | "auto";

/** The `localStorage` key the choice is kept under unless you pass another. */
export const DEFAULT_STORAGE_KEY = "lit-material-color-scheme";

/** Fired on `document` whenever `setColorScheme` runs, so every toggle stays in sync. */
export const COLOR_SCHEME_EVENT = "lit-material-color-scheme-change";

export interface SetColorSchemeOptions {
  /** `localStorage` key (default `DEFAULT_STORAGE_KEY`). */
  storageKey?: string;
  /** Remember the choice for the next visit (default true). */
  persist?: boolean;
}

const isScheme = (value: unknown): value is "light" | "dark" => value === "light" || value === "dark";

/**
 * The scheme forced on `<html>` through its `color-scheme` attribute, which
 * `@lit-material/tokens` reads; `auto` when none is set (and on the server).
 */
export function getColorScheme(): ColorScheme {
  // The SSR DOM shim has a `document` without a `documentElement`.
  const value = typeof document === "undefined" ? null : document.documentElement?.getAttribute("color-scheme");
  return isScheme(value) ? value : "auto";
}

/** What the page actually shows: `auto` resolved against `prefers-color-scheme`. */
export function resolvedColorScheme(): "light" | "dark" {
  const scheme = getColorScheme();
  if (scheme !== "auto") return scheme;
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** The saved choice, or `auto` when there's none or storage is unavailable. */
export function storedColorScheme(storageKey = DEFAULT_STORAGE_KEY): ColorScheme {
  try {
    const value = localStorage.getItem(storageKey);
    return isScheme(value) ? value : "auto";
  } catch {
    return "auto";
  }
}

/**
 * Forces `light` or `dark` on `<html>` (or clears it for `auto`), remembers
 * the choice, and announces it with a `lit-material-color-scheme-change`
 * event on `document` (`detail.scheme`).
 */
export function setColorScheme(scheme: ColorScheme, options: SetColorSchemeOptions = {}): void {
  if (typeof document === "undefined" || !document.documentElement) return;
  const { storageKey = DEFAULT_STORAGE_KEY, persist = true } = options;
  const root = document.documentElement;
  if (isScheme(scheme)) root.setAttribute("color-scheme", scheme);
  else root.removeAttribute("color-scheme");
  if (persist) {
    try {
      if (isScheme(scheme)) localStorage.setItem(storageKey, scheme);
      else localStorage.removeItem(storageKey);
    } catch {
      // Storage unavailable (private window, blocked site data): the choice
      // lasts for this page only.
    }
  }
  document.dispatchEvent(new CustomEvent(COLOR_SCHEME_EVENT, { detail: { scheme } }));
}

/**
 * A one-line script for an inline `<script>` in `<head>`, before any
 * stylesheet: it applies the saved choice before first paint, so a visitor
 * who picked dark never sees a light flash.
 */
export function colorSchemeBootScript(storageKey = DEFAULT_STORAGE_KEY): string {
  // `<` escaped so a key can't close the surrounding <script>.
  const key = JSON.stringify(storageKey).replace(/</g, "\\u003c");
  return `try{var s=localStorage.getItem(${key});if(s==="light"||s==="dark")document.documentElement.setAttribute("color-scheme",s)}catch(e){}`;
}
