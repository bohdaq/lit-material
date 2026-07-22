import { css } from "lit";

export const styles = css`
  :host {
    position: fixed;
    inset-block: 0;
    /* The [popover] UA stylesheet defaults inset to 0 on all four sides.
       Clearing both inline sides here first means only the one the
       position variant below sets is ever constrained — leaving both at 0
       simultaneously alongside an explicit width is over-constrained, and
       the browser resolves that by pinning to the start edge regardless of
       position, silently ignoring "end". */
    inset-inline: auto;
    width: 320px;
    max-width: 100%;
    margin: 0;
    padding: 0;
    border: none;
    box-sizing: border-box;
    background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    box-shadow: var(--md-sys-elevation-level1, 0 1px 2px rgba(0, 0, 0, 0.3));
  }

  /* Not on the base :host rule: an author-origin "display" declaration beats
     the [popover] UA stylesheet's own display:none-when-closed rule
     regardless of specificity (author origin always outranks user-agent
     origin in the cascade), so declaring it unconditionally here would keep
     the drawer visible — still position: fixed, just no longer top-layered —
     even after hidePopover() runs. Scoping it to :popover-open leaves the
     UA rule in sole control of hiding, the same way lit-material-tooltip
     never sets its own "display" at all. */
  :host(:popover-open) {
    display: flex;
    flex-direction: column;
  }

  :host([position="end"]) {
    inset-inline-end: 0;
    border-start-start-radius: var(--md-sys-shape-corner-large, 16px);
    border-end-start-radius: var(--md-sys-shape-corner-large, 16px);
  }

  :host([position="start"]) {
    inset-inline-start: 0;
    border-start-end-radius: var(--md-sys-shape-corner-large, 16px);
    border-end-end-radius: var(--md-sys-shape-corner-large, 16px);
  }

  .header {
    display: contents;
  }

  ::slotted([slot="header"]) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    box-sizing: border-box;
    margin: 0;
    padding: 16px 16px 8px;
    font-family: var(--md-sys-typescale-title-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-title-medium-size, 1rem);
    font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  }

  .body {
    box-sizing: border-box;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding-inline: 16px;
    padding-block-end: 16px;
  }
`;
