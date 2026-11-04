import { css } from "lit";

/** Shared by every page: title row with the page's one primary action, and section spacing. */
export const pageStyles = css`
  :host {
    display: block;
  }
  .title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  h1 {
    margin: 0;
    font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
    font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  }
  section + section {
    margin-top: 32px;
  }
  h2 {
    margin: 0 0 12px;
    font-size: var(--md-sys-typescale-title-medium-size, 1rem);
    font-weight: 500;
  }
  .hint {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
  }
`;
