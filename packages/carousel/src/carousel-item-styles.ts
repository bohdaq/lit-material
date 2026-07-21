import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    flex: none;
    box-sizing: border-box;
    width: var(--lit-material-carousel-item-width, 280px);
    height: 100%;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  .item {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    background-color: var(--md-sys-color-surface-container-high, #ece6f0);
  }

  ::slotted(*) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .label {
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    box-sizing: border-box;
    padding: 24px 16px 12px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
    color: #fff;
    font-family: var(--md-sys-typescale-title-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-title-medium-size, 1rem);
    font-weight: var(--md-sys-typescale-title-medium-weight, 500);
    line-height: var(--md-sys-typescale-title-medium-line-height, 1.5rem);
  }
`;
