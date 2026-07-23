import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    /* MD3 doesn't define standard color roles for "success"/"warning"/"info"
       the way it does for "error" — these are this component's own tokens,
       overridable like any other CSS custom property. error uses the real
       --md-sys-color-error/-container/-on-error-container tokens since a
       spec answer exists. Each container/on-container pair uses
       light-dark(), matching every real --md-sys-color-* token in
       @lit-material/tokens — a *-container color alone isn't enough to stay
       readable across themes: the container backgrounds here are fixed light
       pastels with no theme awareness of their own, so pairing them with a
       theme-aware "on-surface"-style text color (rather than a matching
       "on-container" of their own) reads fine in light mode and goes
       light-text-on-light-background in dark mode. */
    --lit-material-alert-info-color: light-dark(#0b57d0, #a8c7fa);
    --lit-material-alert-info-container: light-dark(#d3e3fd, #0a3577);
    --lit-material-alert-on-info-container: light-dark(#001b3d, #d3e3fd);

    --lit-material-alert-success-color: light-dark(#146c2e, #83da9e);
    --lit-material-alert-success-container: light-dark(#d0f0d8, #0f5223);
    --lit-material-alert-on-success-container: light-dark(#04210d, #d0f0d8);

    --lit-material-alert-warning-color: light-dark(#7a4d00, #ffb945);
    --lit-material-alert-warning-container: light-dark(#ffe4b3, #5c3f00);
    --lit-material-alert-on-warning-container: light-dark(#271900, #ffe4b3);
  }

  :host([hidden]) {
    display: none;
  }

  .alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    box-sizing: border-box;
    padding: 16px;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  .icon {
    flex: none;
    display: flex;
  }

  .icon ::slotted(*),
  .icon svg {
    width: 24px;
    height: 24px;
    display: block;
  }

  .body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* .title/.actions are display:contents slots, not wrapping divs — a
     wrapping div's own :empty/:has(::slotted()) can't reliably detect
     absent content (see lit-material-panel and
     lit-material-description-list for the fuller explanation), so an
     unused slot here just has nothing to promote into the flex column
     rather than a stray empty box. Slot exactly one element into "title";
     for multiple "action" buttons, wrap them in a single element yourself
     so they end up in one row instead of stacked in this column. */
  .title,
  .actions {
    display: contents;
  }

  ::slotted([slot="title"]) {
    font-family: var(--md-sys-typescale-title-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-title-medium-size, 1rem);
    font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  }

  ::slotted([slot="action"]) {
    margin-top: 4px;
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
    outline: 2px solid currentColor;
    outline-offset: 1px;
  }

  .close svg {
    width: 18px;
    height: 18px;
  }

  :host([variant="info"]) .alert,
  :host(:not([variant])) .alert {
    background-color: var(--lit-material-alert-info-container);
    color: var(--lit-material-alert-on-info-container);
  }

  :host([variant="info"]) .icon,
  :host(:not([variant])) .icon {
    color: var(--lit-material-alert-info-color);
  }

  :host([variant="success"]) .alert {
    background-color: var(--lit-material-alert-success-container);
    color: var(--lit-material-alert-on-success-container);
  }

  :host([variant="success"]) .icon {
    color: var(--lit-material-alert-success-color);
  }

  :host([variant="warning"]) .alert {
    background-color: var(--lit-material-alert-warning-container);
    color: var(--lit-material-alert-on-warning-container);
  }

  :host([variant="warning"]) .icon {
    color: var(--lit-material-alert-warning-color);
  }

  :host([variant="error"]) .alert {
    background-color: var(--md-sys-color-error-container, #f9dedc);
    color: var(--md-sys-color-on-error-container, #410e0b);
  }

  :host([variant="error"]) .icon {
    color: var(--md-sys-color-error, #b3261e);
  }
`;
