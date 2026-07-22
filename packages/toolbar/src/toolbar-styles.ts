import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--lit-material-toolbar-gap, 8px);
    box-sizing: border-box;
    padding: 8px 16px;
    color: var(--md-sys-color-on-surface, #1c1b1f);
  }

  :host([dense]) {
    gap: 4px;
    padding: 4px 8px;
  }
`;
