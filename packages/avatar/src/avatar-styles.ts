import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    flex: none;
    vertical-align: top;
    --lit-material-avatar-size: 40px;
  }

  :host([size="small"]) {
    --lit-material-avatar-size: 24px;
  }

  :host([size="large"]) {
    --lit-material-avatar-size: 56px;
  }

  .avatar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: var(--lit-material-avatar-size);
    height: var(--lit-material-avatar-size);
    overflow: hidden;
    border-radius: 50%;
    background-color: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }

  :host([shape="square"]) .avatar {
    border-radius: var(--md-sys-shape-corner-medium, 12px);
  }

  .image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .initials {
    font-family: var(--md-sys-typescale-title-medium-font, Roboto, system-ui, sans-serif);
    font-size: calc(var(--lit-material-avatar-size) * 0.4);
    line-height: 1;
    user-select: none;
  }

  ::slotted(*),
  .icon {
    width: 60%;
    height: 60%;
  }

  .icon path {
    fill: currentColor;
  }
`;
