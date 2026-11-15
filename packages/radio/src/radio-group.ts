import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * A labelled group of `lit-material-radio`s: gives them the ARIA
 * `radiogroup` role and an accessible name, and shows the label above them.
 * Grouping, arrow keys and the single tab stop still come from the radios'
 * shared `name`; this element only adds the semantics and the layout.
 *
 * ```html
 * <lit-material-radio-group label="Plan">
 *   <label><lit-material-radio name="plan" value="free" checked></lit-material-radio> Free</label>
 *   <label><lit-material-radio name="plan" value="team"></lit-material-radio> Team</label>
 * </lit-material-radio-group>
 * ```
 *
 * @element lit-material-radio-group
 *
 * @slot - The radios (each usually wrapped in a `<label>`).
 *
 * @csspart label - The visible group label.
 * @csspart options - The container the radios are laid out in.
 */
@customElement("lit-material-radio-group")
export class LitMaterialRadioGroup extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
    .label {
      margin-block-end: 4px;
      color: var(--md-sys-color-on-surface-variant, #49454f);
      font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    }
    .options {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    :host([orientation="horizontal"]) .options {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 4px 16px;
    }
  `;

  /** The group's name, shown above the radios and given to assistive technology. */
  @property() label = "";
  /** Lays the radios out in a column (default) or a wrapping row. */
  @property({ reflect: true }) orientation: "vertical" | "horizontal" = "vertical";

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "radiogroup");
    if (this.label) this.setAttribute("aria-label", this.label);
    else if (this.getAttribute("aria-label") === null) this.removeAttribute("aria-label");
  }

  override render() {
    return html`${this.label ? html`<div class="label" part="label" aria-hidden="true">${this.label}</div>` : nothing}
      <div class="options" part="options"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-radio-group": LitMaterialRadioGroup;
  }
}
