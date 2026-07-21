import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    outline: none;
  }

  .stepper {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  :host([orientation="vertical"]) .stepper {
    flex-direction: column;
    align-items: stretch;
  }
`;
