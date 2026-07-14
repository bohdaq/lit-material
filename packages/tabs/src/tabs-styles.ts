import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    outline: none;
  }

  .tablist {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    box-sizing: border-box;
    border-bottom: 1px solid var(--md-sys-color-surface-container-highest, #e6e0e9);
  }

  ::slotted(lit-material-tab) {
    flex: 1;
  }

  .indicator {
    position: absolute;
    bottom: -1px;
    left: 0;
    height: 2px;
    width: 0;
    border-radius: var(--md-sys-shape-corner-full, 9999px) var(--md-sys-shape-corner-full, 9999px) 0 0;
    background-color: var(--md-sys-color-primary, #6750a4);
    transition:
      left 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      width 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  @media (prefers-reduced-motion: reduce) {
    .indicator {
      transition: none;
    }
  }
`;
