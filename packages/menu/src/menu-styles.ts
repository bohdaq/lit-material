import { css } from "lit";

export const styles = css`
  :host {
    margin: 0;
    padding: 8px 0;
    border: none;
    /* Not in the tab order, but a valid focus() target on open — no visible
       ring of its own (see the component for why it's focused at all). */
    outline: none;
    min-width: 112px;
    max-width: 280px;
    max-height: min(560px, calc(100vh - 32px));
    overflow-y: auto;
    box-sizing: border-box;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background-color: var(--md-sys-color-surface-container, #f3edf7);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    box-shadow: var(
      --md-sys-elevation-level2,
      0 1px 2px 0 rgba(0, 0, 0, 0.3),
      0 2px 6px 2px rgba(0, 0, 0, 0.15)
    );
  }

  :host(:popover-open) {
    display: flex;
    flex-direction: column;
  }

  ::slotted(lit-material-list-item) {
    flex: none;
  }
`;
