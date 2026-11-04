import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-large-font, Roboto, system-ui, sans-serif);
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]) {
    display: none;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .label {
    padding-inline: 4px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
    font-weight: 500;
    cursor: default;
  }

  .container {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    border: 1px solid var(--md-sys-color-outline, #79747e);
    background: transparent;
  }

  .container:focus-within {
    border-color: var(--md-sys-color-primary, #6750a4);
    box-shadow: inset 0 0 0 1px var(--md-sys-color-primary, #6750a4);
  }

  :host([variant="filled"]) .container {
    border: none;
    border-block-end: 1px solid var(--md-sys-color-on-surface-variant, #49454f);
    border-radius: var(--md-sys-shape-corner-extra-small, 4px) var(--md-sys-shape-corner-extra-small, 4px) 0 0;
    background: var(--md-sys-color-surface-container-highest, #e6e0e9);
  }

  :host([variant="filled"]) .container:focus-within {
    box-shadow: inset 0 -2px 0 0 var(--md-sys-color-primary, #6750a4);
  }

  :host([error]) .container,
  .container.invalid {
    border-color: var(--md-sys-color-error, #b3261e);
  }

  :host([error]) .container:focus-within,
  .container.invalid:focus-within {
    box-shadow: inset 0 0 0 1px var(--md-sys-color-error, #b3261e);
  }

  :host([disabled]) .container {
    opacity: 0.38;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    padding: 4px;
    border-block-end: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  .divider {
    inline-size: 1px;
    block-size: 24px;
    margin-inline: 4px;
    background: var(--md-sys-color-outline-variant, #cac4d0);
  }

  button.tool {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 40px;
    block-size: 40px;
    padding: 0;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background: transparent;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    cursor: pointer;
    outline: none;
  }

  button.tool::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: currentColor;
    opacity: 0;
    transition: opacity 100ms linear;
  }

  button.tool:hover::before {
    opacity: 0.08;
  }

  button.tool:active::before {
    opacity: 0.12;
  }

  button.tool[aria-pressed="true"] {
    background: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }

  button.tool[aria-disabled="true"],
  button.tool:disabled {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
    cursor: default;
  }

  button.tool[aria-disabled="true"]::before,
  button.tool:disabled::before {
    opacity: 0;
  }

  .tool:focus-visible {
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
  }

  .icon {
    inline-size: 20px;
    block-size: 20px;
    fill: currentColor;
  }

  :host(:dir(rtl)) .icon.mirror {
    transform: scaleX(-1);
  }

  .block-select {
    block-size: 40px;
    padding-inline: 8px;
    border: none;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background: transparent;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font: inherit;
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    cursor: pointer;
  }

  .block-select:hover {
    background: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
  }

  .content {
    box-sizing: border-box;
    min-block-size: var(--lit-material-rich-text-min-height, 8rem);
    max-block-size: var(--lit-material-rich-text-max-height, none);
    overflow: auto;
    padding: 12px 16px;
    outline: none;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    font-size: var(--md-sys-typescale-body-large-size, 1rem);
    line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
    cursor: text;
  }

  .content.empty::before {
    content: attr(data-placeholder);
    position: absolute;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    pointer-events: none;
  }

  .content > :first-child {
    margin-block-start: 0;
  }

  .content > :last-child {
    margin-block-end: 0;
  }

  .content p {
    margin-block: 0 0.5em;
  }

  .content h2 {
    margin-block: 0.75em 0.5em;
    font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
    line-height: var(--md-sys-typescale-headline-small-line-height, 2rem);
    font-weight: 400;
  }

  .content h3 {
    margin-block: 0.75em 0.5em;
    font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
    line-height: var(--md-sys-typescale-title-large-line-height, 1.75rem);
    font-weight: 400;
  }

  .content blockquote {
    margin-block: 0 0.5em;
    margin-inline: 0;
    padding-inline-start: 12px;
    border-inline-start: 4px solid var(--md-sys-color-outline-variant, #cac4d0);
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  .content blockquote p:last-child {
    margin-block-end: 0;
  }

  .content ul,
  .content ol {
    margin-block: 0 0.5em;
    padding-inline-start: 1.5em;
  }

  .content li > ul,
  .content li > ol {
    margin-block: 0;
  }

  .content pre,
  .content code {
    font-family: var(--lit-material-code-font, ui-monospace, "Roboto Mono", Menlo, Consolas, monospace);
    font-size: 0.875em;
  }

  .content pre {
    margin-block: 0 0.5em;
    padding: 8px 12px;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background: var(--md-sys-color-surface-container, #f3edf7);
    white-space: pre-wrap;
  }

  .content code {
    padding: 0 0.25em;
    border-radius: 4px;
    background: var(--md-sys-color-surface-container-high, #ece6f0);
  }

  .content a {
    color: var(--md-sys-color-primary, #6750a4);
    text-decoration: underline;
  }

  .link-panel {
    position: absolute;
    z-index: 2;
    inset-block-start: 52px;
    inset-inline-start: 8px;
    box-sizing: border-box;
    display: grid;
    gap: 8px;
    inline-size: min(360px, calc(100% - 16px));
    padding: 12px;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background: var(--md-sys-color-surface-container, #f3edf7);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.3),
      0 2px 6px 2px rgba(0, 0, 0, 0.15);
  }

  .link-field {
    display: grid;
    gap: 4px;
  }

  .link-label {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
  }

  .link-input {
    box-sizing: border-box;
    inline-size: 100%;
    block-size: 40px;
    padding-inline: 12px;
    border: 1px solid var(--md-sys-color-outline, #79747e);
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background: transparent;
    color: inherit;
    font: inherit;
  }

  .link-input:focus {
    outline: none;
    border-color: var(--md-sys-color-primary, #6750a4);
    box-shadow: inset 0 0 0 1px var(--md-sys-color-primary, #6750a4);
  }

  .link-input[aria-invalid="true"] {
    border-color: var(--md-sys-color-error, #b3261e);
  }

  .link-error {
    color: var(--md-sys-color-error, #b3261e);
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
  }

  .link-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .text-button {
    block-size: 40px;
    padding-inline: 12px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background: transparent;
    color: var(--md-sys-color-primary, #6750a4);
    font: inherit;
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    font-weight: 500;
    cursor: pointer;
  }

  .text-button:hover {
    background: color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 8%, transparent);
  }

  .text-button:focus-visible {
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
  }

  .supporting {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding-inline: 16px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
  }

  :host([error]) .supporting,
  .container.invalid + .supporting {
    color: var(--md-sys-color-error, #b3261e);
  }

  .supporting-text {
    flex: 1;
  }

  .counter {
    flex: none;
  }

  .visually-hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    button.tool::before {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    button.tool[aria-pressed="true"] {
      outline: 2px solid ButtonText;
    }
  }
`;
