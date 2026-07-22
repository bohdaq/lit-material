import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
  }

  :host(:not(:last-of-type))::after {
    content: var(--lit-material-breadcrumb-separator, "/");
    margin-inline: 8px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
  }

  .crumb {
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  a.crumb {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    text-decoration: none;
  }

  a.crumb:hover {
    text-decoration: underline;
    color: var(--md-sys-color-primary, #6750a4);
  }

  a.crumb:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
  }

  span.crumb {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-weight: var(--md-sys-typescale-body-medium-weight-prominent, 500);
  }
`;
