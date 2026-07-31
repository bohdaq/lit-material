import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .row {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  ::slotted(*) {
    flex: none;
  }

  .more {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
  }

  .more[hidden] {
    display: none;
  }

  .more:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
  }

  .more:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 1px;
  }

  .menu {
    margin: 0;
    padding: 4px 0;
    border: none;
    box-sizing: border-box;
    min-width: 112px;
    max-width: 280px;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background-color: var(--md-sys-color-surface-container, #f3edf7);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    box-shadow: var(--md-sys-elevation-level2, 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15));
  }

  .menu:popover-open {
    display: flex;
    flex-direction: column;
  }

  ::slotted([slot="overflow"]) {
    flex: none;
  }
`;
