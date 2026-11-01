import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none;
  }

  .list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`;
