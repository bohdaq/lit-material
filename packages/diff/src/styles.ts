import { css } from "lit";

/** Colours and type shared by the diff elements. */
export const diffColors = css`
  :host {
    --diff-added-bg: var(--lit-material-diff-added-background, light-dark(#dcebd3, #23361a));
    --diff-added-fg: var(--lit-material-diff-added-color, light-dark(#2a4a1b, #b7e2a1));
    --diff-removed-bg: var(--lit-material-diff-removed-background, var(--md-sys-color-error-container, light-dark(#f9dedc, #8c1d18)));
    --diff-removed-fg: var(--lit-material-diff-removed-color, var(--md-sys-color-on-error-container, light-dark(#410e0b, #f9dedc)));
    --diff-muted: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    --diff-outline: var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    --diff-mono: var(--lit-material-diff-font, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
    display: block;
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
  }
  :host([hidden]) {
    display: none;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .empty {
    margin: 0;
    color: var(--diff-muted);
  }
  .stats {
    display: flex;
    gap: 8px;
    font-family: var(--diff-mono);
    font-size: 0.8125rem;
  }
  .stats .plus { color: var(--diff-added-fg); }
  .stats .minus { color: var(--diff-removed-fg); }
  .added { background: var(--diff-added-bg); color: var(--diff-added-fg); }
  .removed { background: var(--diff-removed-bg); color: var(--diff-removed-fg); }
  ins, del {
    text-decoration: none;
    border-radius: 2px;
    padding-inline: 2px;
    font-family: var(--diff-mono);
  }
  ins { background: var(--diff-added-bg); color: var(--diff-added-fg); }
  del { background: var(--diff-removed-bg); color: var(--diff-removed-fg); }
  .region:focus-visible {
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
  }
  @media (forced-colors: active) {
    .added, ins { border-inline-start: 3px solid Highlight; }
    .removed, del { border-inline-start: 3px dashed CanvasText; }
  }
`;
