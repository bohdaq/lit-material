import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./circular-progress-styles.js";

/**
 * Material Design 3 circular progress indicator.
 *
 * Purely presentational — `role="progressbar"` and `aria-value*` are set on
 * the host itself, so it carries no dependency on `@lit-material/core`.
 * Has no visible label of its own: set `aria-label` or `aria-labelledby` on
 * the host, same requirement as `lit-material-linear-progress`.
 *
 * `indeterminate` shows a fixed-length arc continuously rotating — see the
 * styles for why that's a deliberate simplification of the full Material
 * spec animation (which also grows/shrinks the arc as it spins). Otherwise
 * the arc's length reflects `value / max`.
 *
 * @element lit-material-circular-progress
 *
 * @csspart track - The background ring.
 * @csspart indicator - The filled arc.
 */
@customElement("lit-material-circular-progress")
export class LitMaterialCircularProgress extends LitElement {
  static override styles = styles;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) max = 1;
  @property({ type: Boolean, reflect: true }) indeterminate = false;

  /** Diameter in pixels. */
  @property({ type: Number }) size = 48;
  @property({ type: Number, attribute: "stroke-width" }) strokeWidth = 4;

  // `willUpdate` (not the constructor or `connectedCallback`/`updated`): a custom element constructor must not
  // gain attributes per the spec's conformance requirements, and `connectedCallback`-set attributes land too
  // late to appear in `@lit-labs/ssr`'s serialized host tag — `willUpdate` runs inside the same synchronous
  // reactive-update pass that produces SSR's output, so it's the one place both concerns are satisfied.
  protected override willUpdate(changed: Map<string, unknown>): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "progressbar");
    }
    if (!changed.has("value") && !changed.has("max") && !changed.has("indeterminate")) return;
    this.syncAria();
  }

  private get clampedValue(): number {
    return Math.min(this.max, Math.max(0, this.value));
  }

  private get ratio(): number {
    return this.max > 0 ? this.clampedValue / this.max : 0;
  }

  private syncAria(): void {
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", String(this.max));
    if (this.indeterminate) {
      this.removeAttribute("aria-valuenow");
    } else {
      this.setAttribute("aria-valuenow", String(this.clampedValue));
    }
  }

  override render() {
    const center = this.size / 2;
    const radius = Math.max(0, center - this.strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;
    const dashoffset = this.indeterminate ? circumference * 0.25 : circumference * (1 - this.ratio);

    return html`
      <svg
        part="svg"
        class=${this.indeterminate ? "spin" : ""}
        width=${this.size}
        height=${this.size}
        viewBox="0 0 ${this.size} ${this.size}"
      >
        <circle
          class="track"
          part="track"
          cx=${center}
          cy=${center}
          r=${radius}
          fill="none"
          stroke-width=${this.strokeWidth}
        ></circle>
        <circle
          class="indicator ${this.indeterminate ? "" : "determinate"}"
          part="indicator"
          cx=${center}
          cy=${center}
          r=${radius}
          fill="none"
          stroke-width=${this.strokeWidth}
          stroke-dasharray=${circumference}
          stroke-dashoffset=${dashoffset}
          transform="rotate(-90 ${center} ${center})"
        ></circle>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-circular-progress": LitMaterialCircularProgress;
  }
}
