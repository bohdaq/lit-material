import "@lit-material/update-banner";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import type { UpdateBannerState } from "@lit-material/update-banner";

@customElement("docs-update-banner-page")
export class DocsUpdateBannerPage extends LitElement {
  static override styles = [pageStyles];

  @state() private state: UpdateBannerState = "available";
  @state() private progress = -1;
  @state() private dismissed = false;
  private timer?: ReturnType<typeof setInterval>;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.timer);
  }

  /** A pretend download: 0 → 100 % in about three seconds, then ready. */
  private onUpdate(): void {
    if (this.state === "ready") {
      this.state = "available";
      this.dismissed = true;
      return;
    }
    this.state = "downloading";
    this.progress = 0;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.progress = Math.min(1, this.progress + 0.05);
      if (this.progress >= 1) {
        clearInterval(this.timer);
        this.state = "ready";
        this.progress = -1;
      }
    }, 150);
  }

  override render() {
    return html`
      <h1>Update banner</h1>
      <p>
        A quiet bar offering a new version: it never takes focus or blocks the page (<code>role="status"</code>). The app
        sets <code>state</code> (<code>available</code>, <code>downloading</code> with <code>progress</code>,
        <code>ready</code>, <code>error</code>) and listens for <code>update</code> and <code>later</code>; how the update is
        fetched is up to it. <code>floating</code> pins it to the bottom end corner of the window.
      </p>
      <section style="display: block;">
        <h2>Try it</h2>
        ${this.dismissed
          ? html`<p>Hidden until next time. <button @click=${() => (this.dismissed = false)}>Show it again</button></p>`
          : html`<lit-material-update-banner
              app-name="Acme"
              version="2.4.0"
              state=${this.state}
              progress=${this.progress}
              @update=${() => this.onUpdate()}
              @later=${() => (this.dismissed = true)}
            ></lit-material-update-banner>`}
      </section>
      <section style="display: block;">
        <h2>Every state</h2>
        <div style="display: grid; gap: 12px;">
          <lit-material-update-banner version="2.4.0"></lit-material-update-banner>
          <lit-material-update-banner version="2.4.0" state="downloading" progress="0.42"></lit-material-update-banner>
          <lit-material-update-banner version="2.4.0" state="downloading"></lit-material-update-banner>
          <lit-material-update-banner version="2.4.0" state="ready"></lit-material-update-banner>
          <lit-material-update-banner version="2.4.0" state="error" error="The update didn't install: the signature didn't match."></lit-material-update-banner>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-update-banner-page": DocsUpdateBannerPage;
  }
}
