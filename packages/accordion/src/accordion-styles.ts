import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .accordion {
    display: flex;
    flex-direction: column;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background-color: var(--md-sys-color-surface, #fffbfe);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    overflow: hidden;
  }

  ::slotted(lit-material-accordion-panel:not(:last-of-type)) {
    border-block-end: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }
`;
