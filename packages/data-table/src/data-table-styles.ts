import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
    overflow-x: auto;
    border-radius: var(--md-sys-shape-corner-large, 12px);
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    background-color: var(--md-sys-color-surface, #fffbfe);
  }

  .table {
    display: table;
    width: 100%;
    border-collapse: collapse;
  }
`;
