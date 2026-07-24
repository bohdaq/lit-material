import { css } from "lit";

export const styles = css`
  :host {
    display: inline;
  }

  time {
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }
`;
