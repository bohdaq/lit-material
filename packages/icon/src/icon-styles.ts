import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 24px;
    height: 24px;
    font-size: 24px;
    line-height: 1;
    color: currentColor;
    vertical-align: middle;
    /* MD3 doesn't define standard color roles for "success"/"warning"/"info"
       the way it does for "error" — matching lit-material-alert's own
       (already dark-mode-corrected) values for visual consistency between
       the two, not a runtime dependency between the packages. */
    --lit-material-icon-info-color: light-dark(#0b57d0, #a8c7fa);
    --lit-material-icon-success-color: light-dark(#146c2e, #83da9e);
    --lit-material-icon-warning-color: light-dark(#7a4d00, #ffb945);
  }

  :host([size="small"]) {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }

  :host([size="large"]) {
    width: 36px;
    height: 36px;
    font-size: 36px;
  }

  ::slotted(svg),
  ::slotted(img) {
    width: 100%;
    height: 100%;
    display: block;
  }

  :host([color="info"]) {
    color: var(--lit-material-icon-info-color);
  }

  :host([color="success"]) {
    color: var(--lit-material-icon-success-color);
  }

  :host([color="warning"]) {
    color: var(--lit-material-icon-warning-color);
  }

  :host([color="error"]) {
    color: var(--md-sys-color-error, #b3261e);
  }
`;
