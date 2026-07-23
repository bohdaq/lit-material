import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    outline: none;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .upload {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-sizing: border-box;
    padding: 24px 16px;
    border: 2px dashed var(--md-sys-color-outline, #79747e);
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
    color: var(--md-sys-color-on-surface-variant, #49454f);
    text-align: center;
    cursor: pointer;
    transition: border-color 100ms linear, background-color 100ms linear;
  }

  .dropzone:hover {
    border-color: var(--md-sys-color-primary, #6750a4);
  }

  .upload.dragging .dropzone {
    border-color: var(--md-sys-color-primary, #6750a4);
    background-color: var(--md-sys-color-secondary-container, #e8def8);
  }

  :host([disabled]) .dropzone {
    cursor: default;
    opacity: 0.38;
  }

  /* Visually hidden, not display:none — stays in the tab order and
     keyboard-operable (Enter/Space opens the native picker) via the
     wrapping <label>, the same "real but invisible" technique used for
     native form controls across the web platform. */
  .input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .dropzone:has(.input:focus-visible) {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 2px;
  }

  .instructions {
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  .file-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    border-radius: var(--md-sys-shape-corner-small, 8px);
  }

  .file-row {
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    padding: 8px 12px;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
  }

  .file-row:not(:last-child) {
    border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  .file-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    flex: none;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
  }

  .remove {
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

  .remove:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
  }

  .remove:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 1px;
  }

  .remove svg {
    width: 16px;
    height: 16px;
  }
`;
