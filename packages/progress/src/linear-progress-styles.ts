import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 4px;
    border-radius: var(--md-sys-shape-corner-full, 2px);
    overflow: hidden;
  }

  .track {
    position: absolute;
    inset: 0;
    background-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
  }

  .indicator {
    position: absolute;
    inset-block: 0;
    border-radius: inherit;
    background-color: var(--md-sys-color-primary, #6750a4);
  }

  /* Determinate: width is set inline from the current value. */
  .indicator.determinate {
    left: 0;
    transition: width 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  /* Indeterminate: two bars sliding at different speeds/offsets, the
     classic Material "indeterminate linear progress" motion — there's no
     real value to represent, so this is decorative rather than tied to any
     underlying number. */
  .indeterminate1 {
    animation: lit-material-linear-progress-bar1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
  }

  .indeterminate2 {
    animation: lit-material-linear-progress-bar2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
    animation-delay: 1.15s;
  }

  @keyframes lit-material-linear-progress-bar1 {
    0% {
      left: -35%;
      right: 100%;
    }
    60%,
    100% {
      left: 100%;
      right: -90%;
    }
  }

  @keyframes lit-material-linear-progress-bar2 {
    0% {
      left: -200%;
      right: 100%;
    }
    60%,
    100% {
      left: 107%;
      right: -8%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .indeterminate1,
    .indeterminate2 {
      animation: none;
    }

    .indeterminate1 {
      left: 0;
      right: 70%;
    }

    .indeterminate2 {
      display: none;
    }
  }
`;
