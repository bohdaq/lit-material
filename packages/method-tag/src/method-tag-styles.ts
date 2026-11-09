import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) {
    display: none;
  }

  .tag {
    font-family: var(--lit-material-method-tag-font, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace);
    font-size: 0.6875rem;
    line-height: 1rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  :host([size="medium"]) .tag {
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .get {
    color: var(--lit-material-method-tag-get, light-dark(#2f6b4a, #5ec79b));
  }
  .post {
    color: var(--lit-material-method-tag-post, light-dark(#8a5a12, #f2b45c));
  }
  .put {
    color: var(--lit-material-method-tag-put, light-dark(#2457a8, #6ca8ff));
  }
  .patch {
    color: var(--lit-material-method-tag-patch, light-dark(#6a3fb5, #c69cff));
  }
  .delete {
    color: var(--lit-material-method-tag-delete, light-dark(#a3221b, #ff8a8a));
  }
  .other {
    color: var(--lit-material-method-tag-other, var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff)));
  }
`;
