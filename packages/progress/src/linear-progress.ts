import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./linear-progress-styles.js";

/**
 * Material Design 3 linear progress indicator.
 *
 * Purely presentational — `role="progressbar"` and `aria-value*` are set on
 * the host itself (there's no interactive control to delegate to, unlike
 * `lit-material-slider`), so it carries no dependency on `@lit-material/core`
 * at all. Has no visible label of its own: set `aria-label` or
 * `aria-labelledby` on the host, same requirement as slider.
 *
 * `indeterminate` shows the classic two-bar sliding animation for
 * unknown-duration work; otherwise the indicator's width reflects
 * `value / max`. A buffer/secondary-track variant (for e.g. video buffering)
 * is a deliberate scope cut — reasonable to add later, but not part of this
 * first pass.
 *
 * @element lit-material-linear-progress
 *
 * @csspart track - The background track.
 * @csspart indicator - The filled indicator bar(s).
 */
@customElement("lit-material-linear-progress")
export class LitMaterialLinearProgress extends LitElement {
  static override styles = styles;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) max = 1;
  @property({ type: Boolean, reflect: true }) indeterminate = false;

  // `willUpdate` (not the constructor or `connectedCallback`/`updated`): a custom element constructor must not
  // gain attributes per the spec's conformance requirements, and attribute mutations made in `connectedCallback`
  // land too late to appear in the server-rendered host tag, since by then its attributes have already been
  // serialized — `willUpdate` runs inside the same synchronous reactive-update pass that produces SSR's output.
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
    if (this.indeterminate) {
      return html`
        <div class="track" part="track"></div>
        <div class="indicator indeterminate1" part="indicator"></div>
        <div class="indicator indeterminate2" part="indicator"></div>
      `;
    }

    return html`
      <div class="track" part="track"></div>
      <div class="indicator determinate" part="indicator" style="width: ${this.ratio * 100}%"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-linear-progress": LitMaterialLinearProgress;
  }
}
