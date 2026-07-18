import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  .bar {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    box-sizing: border-box;
    width: 100%;
    height: 80px;
    background-color: var(--md-sys-color-surface-container, #f3edf7);
    color: var(--md-sys-color-on-surface, #1c1b1f);
  }

  ::slotted(lit-material-navigation-bar-item) {
    flex: 1;
  }
`;
