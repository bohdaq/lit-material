import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    min-height: 0;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  :host([variant="bordered"]) {
    background-color: var(--md-sys-color-surface, #fffbfe);
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  :host([variant="raised"]) {
    box-shadow: var(--md-sys-elevation-level1, 0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .header,
  .footer {
    display: contents;
  }

  ::slotted([slot="header"]) {
    display: block;
    box-sizing: border-box;
    margin: 0;
    padding: 12px 16px;
    border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    font-family: var(--md-sys-typescale-title-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-title-medium-size, 1rem);
    font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  }

  ::slotted([slot="footer"]) {
    display: block;
    box-sizing: border-box;
    margin: 0;
    padding: 12px 16px;
    border-top: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  .body {
    box-sizing: border-box;
    padding: 16px;
    flex: 1 1 auto;
    min-height: 0;
  }

  :host([scrollable]) .body {
    overflow-y: auto;
  }
`;
