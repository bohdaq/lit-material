import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
    height: 1px;
    width: 100%;
    background-color: var(--md-sys-color-outline-variant, #cac4d0);
  }

  /* Inset: indented from the axis perpendicular to the line itself — the
     inline (left/right) axis for a horizontal divider. */
  :host([inset-start]) {
    margin-inline-start: 16px;
    width: auto;
  }

  :host([inset-end]) {
    margin-inline-end: 16px;
    width: auto;
  }

  :host([orientation="vertical"]) {
    display: inline-block;
    align-self: stretch;
    height: auto;
    width: 1px;
  }

  /* Vertical: "inset" indents the block (top/bottom) axis instead. */
  :host([orientation="vertical"][inset-start]) {
    margin-inline-start: 0;
    margin-block-start: 16px;
    width: 1px;
  }

  :host([orientation="vertical"][inset-end]) {
    margin-inline-end: 0;
    margin-block-end: 16px;
    width: 1px;
  }
`;
