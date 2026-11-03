import { css, html, nothing } from "lit";

/**
 * The visible label next to a checkbox, radio or switch: `label` names the
 * control (a `<label for>` in the same shadow root, so clicking the text
 * toggles it), `supportingText` describes it. Render it after the control
 * and give the native input `id="control"` and
 * `aria-describedby=${supportingText ? "supporting" : nothing}`.
 */
export function controlLabel(label: string, supportingText: string, disabled: boolean) {
  if (!label && !supportingText) return nothing;
  return html`<span class="control-text ${disabled ? "disabled" : ""}" part="text">
    ${label ? html`<label for="control" part="label">${label}</label>` : nothing}
    ${supportingText ? html`<span class="supporting" id="supporting" part="supporting-text">${supportingText}</span>` : nothing}
  </span>`;
}

export const controlLabelStyles = css`
  .control-text {
    margin-inline-start: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 40px;
    padding-block: 10px;
    box-sizing: border-box;
  }
  .control-text label {
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-large-size, 1rem);
    line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
    cursor: pointer;
  }
  .control-text .supporting {
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }
  .control-text.disabled {
    opacity: 0.38;
  }
  .control-text.disabled label {
    cursor: default;
  }
`;
