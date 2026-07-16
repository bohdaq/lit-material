import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
  }

  /* The dialog element itself is transparent and fills the viewport (rather
     than shrink-wrapping the visible card) so a click landing outside
     .container still has its event target equal to the dialog element —
     that's what lets the backdrop-click handler use a simple equality check
     instead of manual hit-testing against the card's bounding box. */
  .dialog {
    margin: 0;
    padding: 0;
    border: none;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    background: transparent;
    color: inherit;
  }

  .dialog[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.32);
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    box-sizing: border-box;
    /* Not part of the tab order (see the component for why it's the default
       focus target) — no visible focus indicator of its own. */
    outline: none;
    width: min(560px, calc(100vw - 48px));
    max-height: calc(100vh - 48px);
    padding: 24px;
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    background-color: var(--md-sys-color-surface-container-high, #ece6f0);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    box-shadow: var(
      --md-sys-elevation-level3,
      0 1px 3px 0 rgba(0, 0, 0, 0.3),
      0 4px 8px 3px rgba(0, 0, 0, 0.15)
    );
  }

  slot.icon::slotted(*) {
    width: 24px;
    height: 24px;
    display: block;
    color: var(--md-sys-color-secondary, #625b71);
  }

  .icon:has(::slotted(*)) {
    align-self: center;
  }

  .headline {
    display: block;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-headline-small-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
    line-height: var(--md-sys-typescale-headline-small-line-height, 2rem);
  }

  .icon:has(::slotted(*)) ~ .headline {
    text-align: center;
  }

  .content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .actions:empty {
    display: none;
  }
`;
