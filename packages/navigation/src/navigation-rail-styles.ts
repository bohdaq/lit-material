import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  .rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    width: 80px;
    height: 100%;
    padding-block: 12px;
    background-color: var(--md-sys-color-surface, #fffbfe);
    color: var(--md-sys-color-on-surface, #1c1b1f);
  }

  .fab {
    flex: none;
    margin-block-end: 12px;
  }

  .fab:empty {
    display: none;
  }

  .items {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    min-height: 0;
    overflow-y: auto;
  }

  .items.top {
    justify-content: flex-start;
  }

  .items.center {
    justify-content: center;
  }

  .items.bottom {
    justify-content: flex-end;
  }
`;
