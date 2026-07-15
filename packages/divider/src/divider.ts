import { LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./divider-styles.js";

export type DividerOrientation = "horizontal" | "vertical";

/**
 * Material Design 3 divider — a thin line that groups or separates content,
 * typically inside a list or between sections.
 *
 * Purely visual: no slot, no shadow DOM content at all (`render()` returns
 * nothing) — the host element itself *is* the line, styled directly via
 * `:host`. No dependency on `@lit-material/core` (nothing to click or
 * focus).
 *
 * `insetStart`/`insetEnd` indent the line on the axis perpendicular to it
 * (inline/left-right for a horizontal divider, block/top-bottom for a
 * vertical one) — e.g. to align a divider under a list item's text with a
 * leading icon it doesn't run under. Both unset is a full-bleed divider;
 * both set is MD3's "middle inset" variant.
 *
 * @element lit-material-divider
 */
@customElement("lit-material-divider")
export class LitMaterialDivider extends LitElement {
  static override styles = styles;

  @property({ reflect: true }) orientation: DividerOrientation = "horizontal";
  @property({ type: Boolean, attribute: "inset-start", reflect: true }) insetStart = false;
  @property({ type: Boolean, attribute: "inset-end", reflect: true }) insetEnd = false;

  protected override willUpdate(): void {
    // Not connectedCallback(): attribute mutations made there don't make it
    // into SSR's serialized host tag (see lit-material-linear-progress for
    // the full explanation) — willUpdate() runs inside the same
    // synchronous pass that produces SSR's output.
    if (!this.hasAttribute("role")) this.setAttribute("role", "separator");
    if (this.orientation === "vertical") {
      this.setAttribute("aria-orientation", "vertical");
    } else {
      this.removeAttribute("aria-orientation");
    }
  }

  override render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-divider": LitMaterialDivider;
  }
}
