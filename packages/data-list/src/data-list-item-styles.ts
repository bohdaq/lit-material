import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  :host(:not(:last-of-type)) .row {
    border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  .row {
    box-sizing: border-box;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  .row:not(.expandable) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
  }

  :host([selected]) .row {
    background-color: var(--md-sys-color-secondary-container, #e8def8);
  }

  .summary {
    display: flex;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    padding: 12px 16px;
    cursor: pointer;
    list-style: none;
  }

  .summary::-webkit-details-marker {
    display: none;
  }

  .summary::after {
    content: "";
    flex: none;
    width: 8px;
    height: 8px;
    margin-inline-start: auto;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
    transition: transform 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  details[open] > .summary::after {
    transform: rotate(-135deg);
  }

  .expanded {
    box-sizing: border-box;
    padding: 0 16px 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    .summary::after {
      transition: none;
    }
  }
`;
