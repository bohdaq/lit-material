import { css } from "lit";

export const styles = css`
  :host {
    position: fixed;
    inset-block-end: var(--lit-material-devtools-offset, 16px);
    inset-inline-end: var(--lit-material-devtools-offset, 16px);
    z-index: var(--lit-material-devtools-z-index, 2147483000);
    display: block;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  :host([hidden]) {
    display: none;
  }

  button,
  select {
    font: inherit;
    color: inherit;
  }

  button {
    cursor: pointer;
  }

  button:focus-visible,
  select:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 2px;
  }

  button:disabled {
    cursor: default;
    opacity: 0.38;
  }

  .launcher {
    display: block;
    margin-inline-start: auto;
    padding-block: 8px;
    padding-inline: 16px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background: var(--md-sys-color-inverse-surface, #313033);
    color: var(--md-sys-color-inverse-on-surface, #f4eff4);
    font-weight: 500;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.3), 0 4px 8px 3px rgb(0 0 0 / 0.15);
  }

  .panel {
    position: absolute;
    inset-block-end: calc(100% + 8px);
    inset-inline-end: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    inline-size: min(44rem, calc(100vw - 2 * var(--lit-material-devtools-offset, 16px)));
    block-size: min(36rem, calc(100vh - 6rem));
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background: var(--md-sys-color-surface-container, #f3edf7);
    box-shadow: 0 2px 6px 2px rgb(0 0 0 / 0.15), 0 1px 2px rgb(0 0 0 / 0.3);
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-block: 8px;
    padding-inline: 16px 8px;
    border-block-end: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  h2 {
    flex: 1;
    margin: 0;
    font-size: var(--md-sys-typescale-title-small-size, 0.875rem);
    font-weight: 500;
  }

  h3 {
    margin-block: 12px 4px;
    margin-inline: 0;
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  h3:first-child {
    margin-block-start: 0;
  }

  .tabs {
    display: flex;
    gap: 4px;
  }

  .tab,
  .text-button {
    padding-block: 4px;
    padding-inline: 12px;
    border: 1px solid transparent;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background: transparent;
  }

  .tab[aria-selected="true"] {
    background: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }

  .text-button {
    border-color: var(--md-sys-color-outline, #79747e);
  }

  .filled-button {
    padding-block: 4px;
    padding-inline: 12px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background: var(--md-sys-color-primary, #6750a4);
    color: var(--md-sys-color-on-primary, #fff);
  }

  .close {
    inline-size: 32px;
    block-size: 32px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    font-size: 1.125rem;
    line-height: 1;
  }

  .body {
    flex: 1;
    min-block-size: 0;
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding-block: 8px;
    padding-inline: 16px;
  }

  .toolbar label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .travelling {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-block: 0 8px;
    margin-inline: 16px;
    padding-block: 6px;
    padding-inline: 12px;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background: var(--md-sys-color-tertiary-container, #ffd8e4);
    color: var(--md-sys-color-on-tertiary-container, #31111d);
  }

  .travelling span {
    flex: 1;
  }

  .columns {
    flex: 1;
    min-block-size: 0;
    display: grid;
    grid-template-columns: minmax(12rem, 2fr) 3fr;
    border-block-start: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  .columns > * {
    min-inline-size: 0;
    overflow: auto;
    padding-block: 8px;
    padding-inline: 16px;
  }

  .columns > * + * {
    border-inline-start: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  @media (max-width: 36rem) {
    .columns {
      grid-template-columns: 1fr;
      grid-template-rows: minmax(8rem, 1fr) 2fr;
    }

    .columns > * + * {
      border-inline-start: none;
      border-block-start: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    }
  }

  .scroll {
    flex: 1;
    min-block-size: 0;
    overflow: auto;
    padding-block: 8px;
    padding-inline: 16px;
    border-block-start: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  .log {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .entry {
    display: flex;
    align-items: baseline;
    gap: 8px;
    inline-size: 100%;
    padding-block: 4px;
    padding-inline: 8px;
    border: none;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background: transparent;
    text-align: start;
  }

  .entry:hover {
    background: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
  }

  .entry[aria-pressed="true"] {
    background: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }

  .entry .type,
  .route-entry .where {
    flex: 1;
    min-inline-size: 0;
    overflow-wrap: anywhere;
    font-family: var(--lit-material-devtools-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  }

  .index,
  .time,
  .kind,
  .marker {
    flex: none;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .marker {
    color: var(--md-sys-color-tertiary, #7d5260);
    font-weight: 500;
  }

  .route-entry {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding-block: 4px;
    padding-inline: 8px;
  }

  .kind {
    min-inline-size: 4.5em;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-block: 12px 0;
  }

  .empty {
    margin: 0;
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  code {
    font-family: var(--lit-material-devtools-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  }

  .outlet {
    margin-block: 0 12px;
    padding-block: 8px;
    padding-inline: 12px;
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    border-radius: var(--md-sys-shape-corner-small, 8px);
  }

  .outlet dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 2px 12px;
    margin: 0;
  }

  .outlet dt {
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  .outlet dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  /* JSON tree */
  .tree,
  .tree ul {
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--lit-material-devtools-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
    font-size: 0.8125rem;
  }

  .tree ul {
    padding-inline-start: 16px;
    border-inline-start: 1px dotted var(--md-sys-color-outline-variant, #cac4d0);
    margin-inline-start: 6px;
  }

  .tree li {
    padding-block: 1px;
    overflow-wrap: anywhere;
  }

  .node {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    padding-block: 0;
    padding-inline: 2px 4px;
    border: none;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background: transparent;
    font: inherit;
    text-align: start;
  }

  .node::before {
    content: "▸";
    display: inline-block;
    inline-size: 1em;
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  .node[aria-expanded="true"]::before {
    content: "▾";
  }

  .node:hover {
    background: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
  }

  .leaf {
    padding-inline-start: calc(1em + 6px);
  }

  .key {
    color: var(--md-sys-color-primary, #6750a4);
  }

  .summary,
  .more {
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  .string {
    color: var(--lit-material-devtools-string-color, light-dark(#146c2e, #7dd897));
  }

  .number,
  .bigint {
    color: var(--lit-material-devtools-number-color, light-dark(#0b57d0, #a8c7fa));
  }

  .boolean,
  .null,
  .undefined {
    color: var(--lit-material-devtools-literal-color, light-dark(#8b1a5f, #ffb0cd));
  }

  @media (prefers-reduced-motion: no-preference) {
    .entry,
    .node,
    .tab {
      transition: background-color 100ms linear;
    }
  }
`;
