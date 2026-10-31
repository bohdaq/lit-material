import { css, html, LitElement, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@lit-material/icon-button";
import {
  COLOR_SCHEME_EVENT,
  type ColorScheme,
  DEFAULT_STORAGE_KEY,
  getColorScheme,
  resolvedColorScheme,
  setColorScheme,
  storedColorScheme,
} from "./color-scheme.js";

// Material icons light_mode, dark_mode and brightness_6 (Apache 2.0).
const icon = (d: string) => html`<svg viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${d}></path>`}</svg>`;
const SUN =
  "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 13h2a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm18 0h2a1 1 0 0 0 0-2h-2a1 1 0 0 0 0 2zM11 2v2a1 1 0 0 0 2 0V2a1 1 0 0 0-2 0zm0 18v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-2 0zM5.99 4.58a1 1 0 0 0-1.41 1.41l1.06 1.06a1 1 0 0 0 1.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 0 0-1.41 1.41l1.06 1.06a1 1 0 0 0 1.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 0 0-1.41-1.41l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 0 0-1.41-1.41l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06z";
const MOON =
  "M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z";
const AUTO =
  "M20 15.31 23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6a6 6 0 0 1 0 12z";

const NEXT: Record<ColorScheme, ColorScheme> = { light: "dark", dark: "auto", auto: "light" };
const NAME: Record<ColorScheme, string> = { light: "light", dark: "dark", auto: "system" };

/**
 * A button that switches the page between light and dark, built on
 * `lit-material-icon-button`. It sets the `color-scheme` attribute on
 * `<html>` (which `@lit-material/tokens` reads), remembers the choice in
 * `localStorage`, and keeps every toggle on the page in sync.
 *
 * By default it's a two-state toggle (pressed = dark) starting from what
 * the page shows, OS preference included. With `cycle` it steps light →
 * dark → system, so the visitor can go back to following the OS.
 *
 * Pair it with `colorSchemeBootScript()` in an inline `<head>` script so a
 * saved choice applies before first paint; without it the toggle applies the
 * saved choice when it connects.
 *
 * @element lit-material-color-scheme-toggle
 *
 * @slot light-icon - Icon shown while light (default: a sun).
 * @slot dark-icon - Icon shown while dark (default: a moon).
 * @slot auto-icon - Icon shown while following the system, with `cycle` (default: a half-filled circle).
 *
 * @fires change - After the visitor picks a scheme; `detail.scheme` is `light`, `dark` or `auto`.
 */
@customElement("lit-material-color-scheme-toggle")
export class LitMaterialColorSchemeToggle extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  `;

  /** Step light → dark → system instead of toggling light ↔ dark. */
  @property({ type: Boolean }) cycle = false;

  /** `localStorage` key for the choice. */
  @property({ attribute: "storage-key" }) storageKey = DEFAULT_STORAGE_KEY;

  /** The forced scheme, `auto` when following the OS. */
  @state() private scheme: ColorScheme = "auto";

  /** What the page shows. */
  @state() private shown: "light" | "dark" = "light";

  private media?: MediaQueryList;

  override connectedCallback(): void {
    super.connectedCallback();
    // No boot script ran: apply the saved choice now (without re-saving or
    // overriding an attribute the page set itself).
    if (getColorScheme() === "auto") {
      const saved = storedColorScheme(this.storageKey);
      if (saved !== "auto") setColorScheme(saved, { storageKey: this.storageKey, persist: false });
    }
    document.addEventListener(COLOR_SCHEME_EVENT, this.sync);
    this.media = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : undefined;
    this.media?.addEventListener("change", this.sync);
    this.sync();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener(COLOR_SCHEME_EVENT, this.sync);
    this.media?.removeEventListener("change", this.sync);
  }

  private readonly sync = (): void => {
    this.scheme = getColorScheme();
    this.shown = resolvedColorScheme();
  };

  private readonly onClick = (event: Event): void => {
    // The inner icon button's own toggle `change` isn't ours to re-emit.
    event.stopPropagation();
    const next = this.cycle ? NEXT[this.scheme] : this.shown === "dark" ? "light" : "dark";
    setColorScheme(next, { storageKey: this.storageKey });
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { scheme: next } }));
  };

  override render() {
    if (this.cycle) {
      const label = `Colour scheme: ${NAME[this.scheme]}. Switch to ${NAME[NEXT[this.scheme]]}`;
      const slot =
        this.scheme === "light"
          ? html`<slot name="light-icon">${icon(SUN)}</slot>`
          : this.scheme === "dark"
            ? html`<slot name="dark-icon">${icon(MOON)}</slot>`
            : html`<slot name="auto-icon">${icon(AUTO)}</slot>`;
      return html`<lit-material-icon-button aria-label=${label} @click=${this.onClick} @change=${(e: Event) => e.stopPropagation()}
        ><span slot="icon">${slot}</span></lit-material-icon-button
      >`;
    }
    const dark = this.shown === "dark";
    return html`<lit-material-icon-button
      toggle
      .selected=${dark}
      aria-label=${dark ? "Switch to light theme" : "Switch to dark theme"}
      @click=${this.onClick}
      @change=${(e: Event) => e.stopPropagation()}
    >
      <span slot="icon"><slot name="light-icon">${icon(SUN)}</slot></span>
      <span slot="selected-icon"><slot name="dark-icon">${icon(MOON)}</slot></span>
    </lit-material-icon-button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-color-scheme-toggle": LitMaterialColorSchemeToggle;
  }
}
