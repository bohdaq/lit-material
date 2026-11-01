import { css } from "lit";

/**
 * Shared styling for guide/reference pages (prose + code, not a component
 * gallery) — the eyebrow label, lede paragraph, doc-section cards, and API
 * tables used by the install guide, "Building apps" guide, and every
 * app-shell-primitive reference page. Combine with `pageStyles`:
 * `static override styles = [pageStyles, guidePageStyles]`.
 */
export const guidePageStyles = css`
  :host {
    max-width: 760px;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: var(--text-xs, 0.75rem);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--md-sys-color-primary);
    margin-bottom: 1rem;
  }
  .eyebrow::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--md-sys-color-primary);
  }

  .lede {
    font-size: var(--text-lg, 1.125rem);
    line-height: var(--leading-lg, 1.75rem);
    max-width: 62ch;
  }

  .doc-section {
    display: block;
    padding: 1.75rem;
    margin: 0 0 1.25rem;
  }
  .doc-section h2 {
    text-transform: none;
    font-size: var(--text-xl, 1.25rem);
    line-height: var(--leading-xl, 1.75rem);
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--md-sys-color-on-background);
    margin-bottom: 0.75rem;
  }
  .doc-section h3 {
    font-size: var(--text-base, 1rem);
    font-weight: 600;
    letter-spacing: -0.005em;
    color: var(--md-sys-color-on-background);
    margin: 1.25rem 0 0.5rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm, 0.875rem);
    margin-bottom: var(--space-200, 16px);
  }
  th,
  td {
    text-align: left;
    vertical-align: top;
    padding: 0.5rem 0.75rem 0.5rem 0;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
  }
  th {
    font-size: var(--text-xs, 0.75rem);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--md-sys-color-on-surface-variant);
  }
  td code {
    white-space: nowrap;
  }
`;
