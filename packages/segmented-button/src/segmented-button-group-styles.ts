import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    align-items: stretch;
    box-sizing: border-box;
    height: 40px;
    border: 1px solid var(--md-sys-color-outline, #79747e);
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    overflow: hidden;
    outline: none;
  }

  ::slotted(lit-material-segmented-button) {
    flex: 1;
  }

  ::slotted(lit-material-segmented-button + lit-material-segmented-button) {
    border-inline-start: 1px solid var(--md-sys-color-outline, #79747e);
  }
`;
