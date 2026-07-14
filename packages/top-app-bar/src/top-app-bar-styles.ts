import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  .bar {
    display: flex;
    box-sizing: border-box;
    align-items: center;
    gap: 4px;
    padding-inline: 4px;
    background-color: var(--md-sys-color-surface, #fffbfe);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    transition: box-shadow 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host([elevated]) .bar {
    background-color: var(--md-sys-color-surface-container, #f3edf7);
    box-shadow: var(--md-sys-elevation-level2, 0 1px 3px rgba(0, 0, 0, 0.3));
  }

  .leading,
  .trailing {
    display: flex;
    flex: none;
    align-items: center;
  }

  .trailing {
    margin-inline-start: auto;
  }

  .headline {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--md-sys-typescale-title-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
    font-weight: var(--md-sys-typescale-title-large-weight, 400);
    line-height: var(--md-sys-typescale-title-large-line-height, 1.75rem);
    letter-spacing: var(--md-sys-typescale-title-large-tracking, 0);
  }

  /* Small & center-aligned: a single 64dp row. */
  .bar.small,
  .bar.center-aligned {
    height: 64px;
    padding-inline-end: 12px;
  }

  .bar.small .headline {
    padding-inline-start: 4px;
  }

  .bar.center-aligned {
    justify-content: space-between;
  }

  .bar.center-aligned .headline {
    flex: 1;
    text-align: center;
  }

  /* Medium & large: a 64dp icon row plus a second row for a bigger headline. */
  .bar.medium,
  .bar.large {
    flex-wrap: wrap;
    padding-block-start: 4px;
    padding-inline-end: 12px;
  }

  .bar.medium .leading,
  .bar.large .leading,
  .bar.medium .trailing,
  .bar.large .trailing {
    height: 56px;
  }

  /* Icons stay on the first 56dp row; the headline is forced onto its own
     row below via flex-basis + explicit order (DOM order alone would wrap
     the headline before .trailing, splitting icons across two rows). */
  .bar.medium .leading,
  .bar.large .leading {
    order: 1;
  }

  .bar.medium .trailing,
  .bar.large .trailing {
    order: 2;
  }

  .bar.medium .headline,
  .bar.large .headline {
    order: 3;
    flex-basis: 100%;
    white-space: normal;
    padding-inline: 16px;
    padding-block-end: 20px;
  }

  .bar.medium .headline {
    font-family: var(--md-sys-typescale-headline-small-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
    font-weight: var(--md-sys-typescale-headline-small-weight, 400);
    line-height: var(--md-sys-typescale-headline-small-line-height, 2rem);
    letter-spacing: var(--md-sys-typescale-headline-small-tracking, 0);
  }

  .bar.large .headline {
    font-family: var(--md-sys-typescale-headline-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-headline-medium-size, 1.75rem);
    font-weight: var(--md-sys-typescale-headline-medium-weight, 400);
    line-height: var(--md-sys-typescale-headline-medium-line-height, 2.25rem);
    letter-spacing: var(--md-sys-typescale-headline-medium-tracking, 0);
    padding-block-end: 28px;
  }

  ::slotted(*) {
    flex: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .bar {
      transition: none;
    }
  }
`;
