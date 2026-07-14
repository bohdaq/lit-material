import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    vertical-align: top;
  }

  /* Small (default): a plain dot, no content. */
  .badge {
    display: inline-flex;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
    min-width: 6px;
    height: 6px;
    padding: 0;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: var(--md-sys-color-error, #b3261e);
    color: var(--md-sys-color-on-error, #ffffff);
    font-family: var(--md-sys-typescale-label-small-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-small-size, 0.6875rem);
    font-weight: var(--md-sys-typescale-label-small-weight, 500);
    line-height: 1;
    white-space: nowrap;
  }

  /* Large: numeric/text content, either slotted or via the "value" property.
     Sizing is driven by the "large" class (set in JS from this.textContent
     — see the component for why CSS ":has(::slotted(*))" doesn't work here). */
  .badge.large {
    min-width: 16px;
    height: 16px;
    padding-inline: 4px;
  }
`;
