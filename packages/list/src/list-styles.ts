import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .list {
    display: flex;
    flex-direction: column;
    padding-block: 8px;
    background-color: var(--md-sys-color-surface, #fffbfe);
    color: var(--md-sys-color-on-surface, #1c1b1f);
  }
`;
