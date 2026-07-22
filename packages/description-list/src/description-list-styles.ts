import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .list {
    margin: 0;
  }

  :host([horizontal]) .list {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 24px;
  }
`;
