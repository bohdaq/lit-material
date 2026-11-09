import "@lit-material/timing-waterfall";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-timing-waterfall-page")
export class DocsTimingWaterfallPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Timing waterfall</h1>
      <p>Where a request's time went: DNS, connect, waiting for the first byte and download, as one bar and a legend.</p>
      <section>
        <h2>A new connection</h2>
        <lit-material-timing-waterfall .timings=${{ dnsMs: 4, connectMs: 30, waitMs: 96, downloadMs: 12, totalMs: 142, reused: false }}></lit-material-timing-waterfall>
      </section>
      <section>
        <h2>A reused connection</h2>
        <lit-material-timing-waterfall .timings=${{ dnsMs: 0, connectMs: 0, waitMs: 20, downloadMs: 1, totalMs: 21, reused: true }}></lit-material-timing-waterfall>
      </section>
      <section>
        <h2>Your own phases</h2>
        <lit-material-timing-waterfall .phases=${[{ label: "Queued", ms: 40 }, { label: "Build", ms: 820 }, { label: "Upload", ms: 160 }]}></lit-material-timing-waterfall>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-timing-waterfall-page": DocsTimingWaterfallPage;
  }
}
