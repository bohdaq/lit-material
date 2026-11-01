import { css } from "lit";

/**
 * Shared typography/layout base for every docs page — the "docs chrome"
 * design language (Geist, tight tracking, hairline-bordered section cards,
 * terminal-style code blocks). Deliberately separate from the MD3 type scale
 * the demoed components themselves use internally (Roboto, per
 * `@lit-material/tokens`) — the docs shell has its own voice, the components
 * being documented keep looking authentically MD3.
 */
export const pageStyles = css`
  :host {
    display: block;
    font-family: var(--font-sans, "Geist Variable", system-ui, sans-serif);
    color: var(--md-sys-color-on-surface);
  }
  /* On lit.rws8.tech the page template supplies the heading. */
  :host([embedded]) > h1,
  :host([embedded]) .eyebrow {
    display: none;
  }

  h1 {
    font-size: var(--text-5xl, 3rem);
    line-height: 1;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 var(--space-200, 16px);
    color: var(--md-sys-color-on-background);
    text-wrap: balance;
  }

  h2 {
    width: 100%;
    font-size: var(--text-xs, 0.75rem);
    line-height: var(--leading-xs, 1rem);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--md-sys-color-on-surface-variant);
    margin: 0 0 var(--space-50, 4px);
  }

  p {
    font-size: var(--text-base, 1rem);
    line-height: var(--leading-base, 1.5rem);
    color: var(--md-sys-color-on-surface-variant);
    max-width: 62ch;
    margin: 0 0 var(--space-200, 16px);
    text-wrap: pretty;
  }

  a {
    color: var(--md-sys-color-primary);
    text-underline-offset: 0.2em;
  }

  code {
    font-family: var(--font-mono, "Geist Mono Variable", ui-monospace, monospace);
    font-size: 0.875em;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    padding: var(--space-25, 2px) var(--space-50, 4px);
    border-radius: 4px;
  }

  pre {
    font-family: var(--font-mono, "Geist Mono Variable", ui-monospace, monospace);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--leading-sm, 1.25rem);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 12px;
    padding: var(--space-200, 16px);
    overflow-x: auto;
    margin: 0 0 var(--space-200, 16px);
  }
  pre code {
    background: none;
    padding: 0;
  }

  section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-200, 16px);
    padding: var(--space-300, 24px);
    margin-bottom: var(--space-300, 24px);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 16px;
    background: var(--md-sys-color-surface-container-low);
  }
`;
