import { css } from "lit";

export const styles = css`
  :host {
    display: table-row;
    border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    transition: background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host(:last-of-type) {
    border-bottom: none;
  }

  :host(:not([header]):hover) {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 4%, transparent);
  }

  :host([selected]) {
    background-color: var(--md-sys-color-secondary-container, #e8def8);
  }

  @media (prefers-reduced-motion: reduce) {
    :host {
      transition: none;
    }
  }
`;
