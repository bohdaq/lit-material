import { css } from "lit";

/**
 * Shared typography/layout base for every docs page — the "docs chrome"
 * design language (Inter, tight tracking, hairline-bordered section cards,
 * terminal-style code blocks). Deliberately separate from the MD3 type scale
 * the demoed components themselves use internally (Roboto, per
 * `@lit-material/tokens`) — the docs shell has its own voice, the components
 * being documented keep looking authentically MD3.
 */
export const pageStyles = css`
  :host {
    display: block;
    font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  }

  h1 {
    font-size: clamp(2.25rem, 4vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    margin: 0 0 0.75rem;
    color: var(--md-sys-color-on-background);
  }

  h2 {
    width: 100%;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--md-sys-color-on-surface-variant);
    margin: 0 0 0.25rem;
  }

  p {
    font-size: 0.95rem;
    line-height: 1.65;
    color: var(--md-sys-color-on-surface-variant);
    max-width: 62ch;
  }

  a {
    color: var(--md-sys-color-primary);
    text-decoration: none;
    border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent);
    transition: border-color 120ms ease;
  }
  a:hover {
    border-bottom-color: var(--md-sys-color-primary);
  }

  code {
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.85em;
    font-weight: 500;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    padding: 0.15em 0.4em;
    border-radius: 5px;
  }

  pre {
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.82rem;
    line-height: 1.6;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 10px;
    padding: 1rem 1.1rem;
    overflow-x: auto;
    margin: 0 0 1rem;
  }
  pre code {
    background: none;
    padding: 0;
    font-weight: 400;
  }

  section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    padding: 1.75rem;
    margin-bottom: 1.25rem;
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 14px;
    background: color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 60%, transparent);
  }
`;
