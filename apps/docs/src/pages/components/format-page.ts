import { formatBytes, formatCpu, formatDuration, formatNumber, parseQuantity } from "@lit-material/format";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-format-page")
export class DocsFormatPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Format</h1>
      <section>
        <p>Locale-aware helpers for sizes, counts, durations and Kubernetes quantities — plain functions, no element.</p>
        <table>
          <tbody>
            ${[
              ["formatBytes(1536)", formatBytes(1536)],
              ["formatBytes(1500, { binary: false })", formatBytes(1500, { binary: false })],
              ['formatBytes(parseQuantity("512Mi"))', formatBytes(parseQuantity("512Mi"))],
              ["formatNumber(12345, { compact: true })", formatNumber(12345, { compact: true })],
              ["formatDuration(7_500_000)", formatDuration(7_500_000)],
              ['formatDuration(65_000, { unitDisplay: "narrow" })', formatDuration(65_000, { unitDisplay: "narrow" })],
              ['formatCpu("250m")', formatCpu("250m")],
            ].map(([code, out]) => html`<tr><td><code>${code}</code></td><td>${out}</td></tr>`)}
          </tbody>
        </table>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-format-page": DocsFormatPage;
  }
}
