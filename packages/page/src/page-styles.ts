import { css } from "lit";

export const styles = css`
  :host {
    display: grid;
    grid-template-areas:
      "header header"
      "sidebar main";
    grid-template-rows: auto 1fr;
    grid-template-columns: auto 1fr;
    box-sizing: border-box;
    height: 100%;
    background-color: var(--md-sys-color-surface, #fffbfe);
    color: var(--md-sys-color-on-surface, #1c1b1f);
  }

  .header {
    grid-area: header;
  }

  .sidebar {
    grid-area: sidebar;
    overflow-y: auto;
  }

  .main {
    grid-area: main;
    box-sizing: border-box;
    min-width: 0;
    overflow-y: auto;
  }
`;
