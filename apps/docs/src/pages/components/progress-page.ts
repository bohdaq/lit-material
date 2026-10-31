import "@lit-material/progress";
import "@lit-material/button";
import type { LitMaterialLinearProgress, LitMaterialCircularProgress } from "@lit-material/progress";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query } from "lit/decorators.js";

@customElement("docs-progress-page")
export class DocsProgressPage extends LitElement {
  static override styles = [pageStyles];

  @query("#linear")
  private linear?: LitMaterialLinearProgress;

  @query("#circular")
  private circular?: LitMaterialCircularProgress;

  private readonly animateProgress = (): void => {
    if (!this.linear || !this.circular) return;
    const start = performance.now();
    const duration = 1500;
    this.linear.value = 0;
    this.circular.value = 0;
    const tick = (now: number): void => {
      const elapsed = Math.min(1, (now - start) / duration);
      if (this.linear) this.linear.value = elapsed;
      if (this.circular) this.circular.value = elapsed;
      if (elapsed < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  override render() {
    return html`
      <h1>Progress Indicators</h1>
      <p>Linear + circular, one package (<code>@lit-material/progress</code>).</p>

      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <lit-material-linear-progress id="linear" aria-label="Upload progress" value="0.3"></lit-material-linear-progress>
        <lit-material-linear-progress aria-label="Loading, unknown duration" indeterminate></lit-material-linear-progress>
        <lit-material-button variant="outlined" @click=${this.animateProgress}>Animate to 100%</lit-material-button>
      </div>

      <div style="display: flex; gap: 32px; align-items: center; margin-top: 20px;">
        <lit-material-circular-progress id="circular" aria-label="Upload progress" value="0.3"></lit-material-circular-progress>
        <lit-material-circular-progress aria-label="Loading, unknown duration" indeterminate></lit-material-circular-progress>
      </div>

      <h2>Usage meter</h2>
      <p>
        <code>lit-material-usage-meter</code> shows how much of a limit is used. It warns at 80% and turns critical at
        95% or over the limit, in words as well as colour.
      </p>
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 400px;">
        <lit-material-usage-meter label="CPU" unit="cores" value="1.5" max="4"></lit-material-usage-meter>
        <lit-material-usage-meter label="Memory" unit="GiB" value="6.6" max="8"></lit-material-usage-meter>
        <lit-material-usage-meter label="Disk" unit="GiB" value="21" max="20"></lit-material-usage-meter>
        <lit-material-usage-meter label="Public IPs" value="2"></lit-material-usage-meter>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-progress-page": DocsProgressPage;
  }
}
