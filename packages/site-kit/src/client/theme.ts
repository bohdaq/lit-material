// Light / dark / system for a prerendered site. The choice is a per-visitor
// convenience in localStorage; without it (private window, blocked storage)
// the page follows the OS. `themeBootScript` goes inline in <head> so the
// choice applies before first paint.

export interface ThemeOptions {
  /** localStorage key for the visitor's choice. */
  key?: string;
}

const DEFAULT_KEY = "lit-material-theme";

/**
 * Script text for an inline `<script>` in `<head>`: adds `js` to `<html>`
 * (so CSS can hide what scripts reveal) and applies the stored theme.
 */
export function themeBootScript(key = DEFAULT_KEY): string {
  return `document.documentElement.classList.add("js");try{var t=localStorage.getItem(${JSON.stringify(key)});if(t)document.documentElement.dataset.theme=t}catch(e){}`;
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Storage unavailable: the choice lasts for this page only.
  }
}

function apply(value: string | null): void {
  if (value) document.documentElement.dataset.theme = value;
  else delete document.documentElement.dataset.theme;
}

/** Wires every `[data-theme-toggle]` button: `aria-pressed` is true in dark. */
export function initThemeToggle({ key = DEFAULT_KEY }: ThemeOptions = {}): void {
  apply(read(key));
  for (const button of document.querySelectorAll<HTMLElement>("[data-theme-toggle]")) {
    const sync = () => {
      const current = document.documentElement.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      button.setAttribute("aria-pressed", String(current === "dark"));
      button.setAttribute("aria-label", current === "dark" ? "Switch to light theme" : "Switch to dark theme");
    };
    button.addEventListener("click", () => {
      const next = button.getAttribute("aria-pressed") === "true" ? "light" : "dark";
      apply(next);
      write(key, next);
      for (const b of document.querySelectorAll("[data-theme-toggle]")) b.dispatchEvent(new Event("lit-material-theme-sync"));
    });
    button.addEventListener("lit-material-theme-sync", sync);
    sync();
  }
}
