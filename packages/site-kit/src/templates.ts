// Lit templates for prerendered pages: plain HTML (no custom elements, no
// shadow DOM) that reads and works before any script runs. Style them with
// `@lit-material/site-kit/css/site-kit.css`; the scripts in `client/` add
// behaviour to the toggle, menu, search and terminal markup.
import { html, nothing, type TemplateResult } from "lit";
import type { TerminalLine } from "./client/terminal.js";

export interface FaqItem {
  question: string;
  answer: TemplateResult | string;
  /** Opens this item on load. */
  open?: boolean;
}

/**
 * Questions on native `<details>`: they open without JS, find-in-page
 * reaches closed answers, and `exclusive` (the `name` attribute) keeps one
 * open at a time.
 */
export function faq(items: FaqItem[], { exclusive = "" }: { exclusive?: string } = {}): TemplateResult {
  return html`<div class="lm-faq">
    ${items.map(
      (item) => html`<details name=${exclusive || nothing} ?open=${item.open}>
        <summary>${item.question}</summary>
        <div class="lm-faq-answer">${item.answer}</div>
      </details>`,
    )}
  </div>`;
}

export interface Step {
  title: string;
  body?: TemplateResult | string;
}

/** Numbered steps: an `<ol>` numbered by CSS counters, so the numbers survive copy and screen readers count them. */
export function steps(items: Step[], { label }: { label?: string } = {}): TemplateResult {
  return html`<ol class="lm-steps" aria-label=${label || nothing}>
    ${items.map((s) => html`<li><strong class="lm-step-title">${s.title}</strong>${s.body ? html`<div class="lm-step-body">${s.body}</div>` : nothing}</li>`)}
  </ol>`;
}

export interface TerminalOptions {
  /** What the session shows, for people who can't see it (`role="img"`). */
  label: string;
  title?: string;
  prompt?: string;
  /** Adds `data-terminal` so `initTerminal` replays it. */
  animate?: boolean;
}

/** A terminal mockup that shows the finished session; `initTerminal` can replay it. */
export function terminal(lines: TerminalLine[], { label, title, prompt = "$ ", animate = true }: TerminalOptions): TemplateResult {
  return html`<div class="lm-terminal" role="img" aria-label=${label}>
    <div class="lm-terminal-bar" aria-hidden="true"><span></span><span></span><span></span>${title ? html`<b>${title}</b>` : nothing}</div>
    <pre aria-hidden="true" data-terminal=${animate ? JSON.stringify(lines) : nothing}>${lines.map((l) =>
      l.cmd !== undefined
        ? html`<span class="t-line"><span class="t-prompt">${prompt}</span>${l.cmd}</span>`
        : html`<span class=${l.accent ? "t-line t-accent" : "t-line t-out"}>${l.out}</span>`,
    )}</pre>
  </div>`;
}

/** Keys of a shortcut, such as `kbd("Ctrl", "K")`: each in its own `<kbd>`, inside an outer one as HTML specifies. */
export function kbd(...keys: string[]): TemplateResult {
  return keys.length === 1 ? html`<kbd class="lm-kbd">${keys[0]}</kbd>` : html`<kbd class="lm-keys">${keys.map((k, i) => html`${i ? html`<span aria-hidden="true">+</span>` : nothing}<kbd class="lm-kbd">${k}</kbd>`)}</kbd>`;
}

export interface Shortcut {
  /** Alternatives, each a list of keys: `[["Ctrl", "K"], ["/"]]`. */
  keys: string[][];
  action: string;
}

/** A list of keyboard shortcuts as a `<dl>`: action, then its keys. */
export function shortcuts(items: Shortcut[], { label }: { label?: string } = {}): TemplateResult {
  return html`<dl class="lm-shortcuts" aria-label=${label || nothing}>
    ${items.map((s) => html`<div><dt>${s.action}</dt><dd>${s.keys.map((k, i) => html`${i ? html`<span class="lm-or">or</span>` : nothing}${kbd(...k)}`)}</dd></div>`)}
  </dl>`;
}

/** The search dialog `initSearch` drives; `icon` is optional markup before the input. */
export function searchDialog({ label = "Search the site", placeholder = "Search", icon }: { label?: string; placeholder?: string; icon?: TemplateResult } = {}): TemplateResult {
  return html`<dialog class="search-dialog lm-search" aria-label=${label}>
    <form method="dialog" class="search-form" role="search">
      ${icon ?? nothing}
      <input type="search" name="q" placeholder=${placeholder} autocomplete="off" aria-label=${label} />
      <button type="submit" class="lm-search-close" aria-label="Close search">${kbd("Esc")}</button>
    </form>
    <div class="search-results" aria-live="polite"></div>
  </dialog>`;
}

/** A button that opens the search dialog, with its shortcut. */
export function searchButton({ label = "Search", className = "lm-search-button", icon }: { label?: string; className?: string; icon?: TemplateResult } = {}): TemplateResult {
  return html`<button class=${className} type="button" data-search-open>${icon ?? nothing}<span>${label}</span>${kbd("/")}</button>`;
}

/** The theme toggle `initThemeToggle` drives; give it the two icons. */
export function themeToggle({ light, dark, className = "lm-theme-toggle" }: { light: TemplateResult; dark: TemplateResult; className?: string }): TemplateResult {
  return html`<button class=${className} type="button" data-theme-toggle aria-pressed="false" aria-label="Switch theme">
    <span class="lm-sun" aria-hidden="true">${light}</span><span class="lm-moon" aria-hidden="true">${dark}</span>
  </button>`;
}

/** The menu button `initMenu` drives, for the panel with id `controls`. */
export function menuToggle({ controls = "mobile-menu", className = "lm-menu-toggle" }: { controls?: string; className?: string } = {}): TemplateResult {
  return html`<button class=${className} type="button" data-menu-toggle aria-expanded="false" aria-controls=${controls} aria-label="Open menu">
    <span class="lm-menu-icon" aria-hidden="true"><span></span><span></span></span>
  </button>`;
}
