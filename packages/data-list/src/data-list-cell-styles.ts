import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    align-items: center;
    min-width: 0;
    flex: 0 0 auto;
  }

  :host([fill]) {
    flex: 1 1 0;
  }
`;
