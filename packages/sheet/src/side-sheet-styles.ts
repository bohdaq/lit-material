import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
  }

  .sheet {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    gap: 4px;
    width: 400px;
    max-width: 100%;
    height: 100%;
    background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    /* Not part of the tab order for "modal" (see the component for why it's
       the default showModal() focus target) — no visible focus indicator
       of its own. */
    outline: none;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    padding-inline: 16px;
    padding-block-end: 16px;
    overflow-y: auto;
  }

  /* Modal variant: same .sheet content, wrapped in a native <dialog> so the
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
    justify-content: flex-end;
  }

  :host([position="start"]) .dialog[open] {
    justify-content: flex-start;
  }

  .dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.32);
  }

  .dialog .sheet {
    border-start-start-radius: var(--md-sys-shape-corner-large, 16px);
    border-end-start-radius: var(--md-sys-shape-corner-large, 16px);
    box-shadow: var(--md-sys-elevation-level1, 0 1px 2px rgba(0, 0, 0, 0.3));
  }

  :host([position="start"]) .dialog .sheet {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
    border-start-end-radius: var(--md-sys-shape-corner-large, 16px);
    border-end-end-radius: var(--md-sys-shape-corner-large, 16px);
  }
`;
