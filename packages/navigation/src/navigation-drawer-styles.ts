import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
  }

  .drawer {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    gap: 4px;
    width: 360px;
    max-width: 100%;
    height: 100%;
    padding: 12px;
    background-color: var(--md-sys-color-surface, #fffbfe);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    /* Not part of the tab order for "modal" (see the component for why it's
       the default showModal() focus target) — no visible focus indicator
       of its own. */
    outline: none;
  }

  .header {
    padding: 16px 16px 8px;
  }

  .header:empty {
    display: none;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
    overflow-y: auto;
  }

  /* Modal variant: same .drawer content, wrapped in a native <dialog> so the
     scrim, Escape-to-close, and focus trap all come from the browser. */
  .dialog {
    margin: 0;
    padding: 0;
    border: none;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    background: transparent;
    color: inherit;
  }

  .dialog[open] {
    display: flex;
    justify-content: flex-start;
  }

  :host([position="end"]) .dialog[open] {
    justify-content: flex-end;
  }

  .dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.32);
  }

  .dialog .drawer {
    box-shadow: var(
      --md-sys-elevation-level1,
      0 1px 2px rgba(0, 0, 0, 0.3)
    );
  }
`;
