import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  :host([hidden]) {
    display: none;
  }

  .viewer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .facts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
  }

  .icon {
    display: inline-flex;
    flex: none;
    width: 20px;
    height: 20px;
  }

  .icon svg,
  .button-icon svg {
    width: 100%;
    height: 100%;
  }

  .button-icon {
    display: inline-flex;
    width: 18px;
    height: 18px;
  }

  .what {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 6px;
    min-width: 0;
    flex: 1;
  }

  .kind {
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-weight: 500;
  }

  .mono,
  pre {
    font-family: var(--lit-material-code-font, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  }

  .mono {
    overflow-wrap: anywhere;
  }

  .image-frame {
    display: flex;
    justify-content: center;
    padding: 12px;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    /* A checkerboard, so transparent pixels show as transparent. */
    background-color: var(--md-sys-color-surface-container, light-dark(#f3edf7, #211f26));
    background-image:
      linear-gradient(45deg, var(--md-sys-color-surface-container-high, light-dark(#ece6f0, #2b2930)) 25%, transparent 25%),
      linear-gradient(-45deg, var(--md-sys-color-surface-container-high, light-dark(#ece6f0, #2b2930)) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--md-sys-color-surface-container-high, light-dark(#ece6f0, #2b2930)) 75%),
      linear-gradient(-45deg, transparent 75%, var(--md-sys-color-surface-container-high, light-dark(#ece6f0, #2b2930)) 75%);
    background-size: 16px 16px;
    background-position:
      0 0,
      0 8px,
      8px -8px,
      -8px 0;
  }

  img {
    display: block;
    max-width: 100%;
    max-height: var(--lit-material-binary-viewer-max-height, 480px);
    object-fit: contain;
  }

  .pdf {
    display: block;
    width: 100%;
    height: var(--lit-material-binary-viewer-max-height, 480px);
    box-sizing: border-box;
    border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background: var(--md-sys-color-surface-container, light-dark(#f3edf7, #211f26));
  }

  .open {
    align-self: flex-start;
    color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
  }

  .note,
  .empty {
    margin: 0;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
  }

  .dump {
    max-height: var(--lit-material-binary-viewer-max-height, 480px);
    overflow: auto;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background: var(--md-sys-color-surface-container, light-dark(#f3edf7, #211f26));
  }

  .dump:focus-visible,
  .open:focus-visible {
    outline: var(--lit-material-focus-ring-width, 3px) solid var(--lit-material-focus-ring-color, var(--md-sys-color-secondary, #625b71));
    outline-offset: 2px;
  }

  pre {
    margin: 0;
    padding: 8px 12px;
    font-size: 0.8125rem;
    line-height: 1.25rem;
    white-space: pre;
    unicode-bidi: isolate;
  }

  .offset {
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
  }

  .ascii {
    color: var(--md-sys-color-tertiary, light-dark(#7d5260, #efb8c8));
  }
`;
