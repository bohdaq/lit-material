import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    outline: none;
  }

  :host([hidden]) {
    display: none;
  }

  .tablist {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    box-sizing: border-box;
    border-bottom: 1px solid var(--md-sys-color-surface-container-highest, #e6e0e9);
  }

  .scroller {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
  }

  ::slotted(lit-material-tab) {
    flex: 1;
  }

  .end {
    display: flex;
    flex: none;
    align-items: center;
  }

  :host([scrollable]) .scroller {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    overscroll-behavior-x: contain;
  }
  /* Fade the edges where tabs are scrolled out of view. */
  :host([scrollable]) .scroller.fade-start {
    mask-image: linear-gradient(to right, transparent, #000 24px);
  }
  :host([scrollable]) .scroller.fade-end {
    mask-image: linear-gradient(to left, transparent, #000 24px);
  }
  :host([scrollable]) .scroller.fade-start.fade-end {
    mask-image: linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent);
  }
  :host(:dir(rtl)[scrollable]) .scroller.fade-start {
    mask-image: linear-gradient(to left, transparent, #000 24px);
  }
  :host(:dir(rtl)[scrollable]) .scroller.fade-end {
    mask-image: linear-gradient(to right, transparent, #000 24px);
  }

  :host([reorderable]) ::slotted(lit-material-tab) {
    touch-action: pan-y;
  }
  ::slotted(lit-material-tab[dragging]) {
    z-index: 1;
    opacity: 0.85;
    cursor: grabbing;
  }

  :host([scrollable]) ::slotted(lit-material-tab) {
    flex: none;
    max-width: var(--lit-material-tabs-tab-max-width, 16rem);
  }
  /* The scroll box clips anything below it. */
  :host([scrollable]) .indicator {
    bottom: 0;
  }

  .indicator {
    position: absolute;
    bottom: -1px;
    left: 0;
    height: 2px;
    width: 0;
    border-radius: var(--md-sys-shape-corner-full, 9999px) var(--md-sys-shape-corner-full, 9999px) 0 0;
    background-color: var(--md-sys-color-primary, #6750a4);
    transition:
      left 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      width 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  /* Before the first measurement, so the indicator grows from the start edge rather than sweeping in from the
     left. Positioned with physical left from measured rects afterwards (see updateIndicator). */
  :host(:dir(rtl)) .indicator {
    left: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .indicator {
      transition: none;
    }
  }
`;
