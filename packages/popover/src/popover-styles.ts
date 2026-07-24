import { css } from "lit";

export const styles = css`
  :host {
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
    box-sizing: border-box;
    width: max-content;
    max-width: min(320px, calc(100vw - 32px));
    max-height: min(400px, calc(100vh - 32px));
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background-color: var(--md-sys-color-surface-container, #f3edf7);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    box-shadow: var(--md-sys-elevation-level2, 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15));
  }

  :host(:popover-open) {
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    box-sizing: border-box;
    padding: 12px 12px 0;
    flex: none;
  }

  .header-slot {
    display: contents;
  }

  ::slotted([slot="header"]) {
    font-family: var(--md-sys-typescale-title-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-title-medium-size, 1rem);
    font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  }

  .close {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: inherit;
    cursor: pointer;
  }

  .close:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
  }

  .close:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 1px;
  }

  .close svg {
    width: 16px;
    height: 16px;
  }

  .content {
    box-sizing: border-box;
    padding: 12px;
    overflow-y: auto;
    min-height: 0;
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  .footer {
    display: contents;
  }

  ::slotted([slot="footer"]) {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 0 12px 12px;
  }
`;
