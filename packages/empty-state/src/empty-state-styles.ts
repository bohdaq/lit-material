import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }
  .standard {
    align-items: center;
    text-align: center;
    padding: 48px 24px;
    max-width: 480px;
    margin-inline: auto;
  }
  .compact {
    align-items: flex-start;
    padding: 24px;
    border: 1px dashed var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    border-radius: var(--md-sys-shape-corner-large, 12px);
  }

  .headline {
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-title-medium-font, inherit);
    font-size: var(--md-sys-typescale-title-medium-size, 1rem);
    line-height: var(--md-sys-typescale-title-medium-line-height, 1.5rem);
    font-weight: var(--md-sys-typescale-title-medium-weight, 600);
    text-wrap: balance;
  }
  .body { text-wrap: pretty; }

  .icon, .actions { display: flex; }
  .icon { color: var(--md-sys-color-outline, light-dark(#79747e, #938f99)); margin-bottom: 8px; }
  .actions { flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .standard .actions { justify-content: center; }
  .icon.empty, .actions.empty { display: none; }
  ::slotted([slot="icon"]) { width: 48px; height: 48px; }
  .compact ::slotted([slot="icon"]) { width: 32px; height: 32px; }
`;
