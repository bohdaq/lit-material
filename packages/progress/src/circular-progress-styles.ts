import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
    box-sizing: border-box;
    line-height: 0;
  }

  svg {
    display: block;
  }

  .track {
    stroke: var(--md-sys-color-surface-container-highest, #e6e0e9);
  }

  .indicator {
    stroke: var(--md-sys-color-primary, #6750a4);
    stroke-linecap: round;
  }

  .indicator.determinate {
    transition: stroke-dashoffset 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  /* Indeterminate: a fixed-length arc, continuously rotating — a simple
     spinner rather than the full Material-spec animation, which also grows
     and shrinks the arc's length as it rotates. A reasonable scope cut: it
     communicates the same "working, unknown duration" meaning with far less
     animation code. */
  svg.spin {
    animation: lit-material-circular-progress-spin 1.4s linear infinite;
    transform-origin: center;
  }

  @keyframes lit-material-circular-progress-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .indicator {
      transition: none;
    }

    svg.spin {
      animation: none;
    }
  }
`;
