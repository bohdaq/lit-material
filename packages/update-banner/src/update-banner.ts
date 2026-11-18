import { html, LitElement, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { langOf, LocalizeController } from "@lit-material/core/localize.js";
import "@lit-material/button/button.js";
import { styles } from "./update-banner-styles.js";

/** Where an update is: offered, downloading, downloaded and waiting for a restart, or failed. */
export type UpdateBannerState = "available" | "downloading" | "ready" | "error";

const ICON = svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
const ERROR_ICON = svg`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M12 7v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><circle cx="12" cy="16.5" r="1.2" fill="currentColor"></circle></svg>`;

/**
 * A quiet bar that offers a new version of an app: "Version 1.3.0 is
 * available · Restart to update · Later". It never takes focus or blocks
 * the page (`role="status"`, not a dialog), and has nothing to do with how
 * the update is fetched: the app sets `state` and `progress` and listens for
 * `update` and `later`.
 *
 * - `available`: the version, the update button and Later.
 * - `downloading`: a progress bar (`progress` 0–1, or none for
 *   indeterminate); the buttons go.
 * - `ready`: downloaded; the button restarts (Later stays).
 * - `error`: `error` text (or a default), the button tries again, Later.
 *
 * The bar sits where you put it; `floating` pins it to the bottom end
 * corner of the viewport. Progress isn't put in the live region, so screen
 * readers hear each state once, not every tick.
 *
 * @element lit-material-update-banner
 *
 * @slot - Replaces the message (e.g. a link to the release notes).
 *
 * @csspart banner - The bar.
 * @csspart message - The text.
 * @csspart progress - The progress bar.
 * @csspart actions - The buttons' container.
 *
 * @cssprop --lit-material-update-banner-inset - Distance from the viewport edges when `floating` (default `16px`).
 *
 * @fires update - The update button (Restart to update, Restart, Try again) was pressed.
 * @fires later - Later was pressed: hide the bar (set `hidden` or remove it) and ask again another time.
 */
@customElement("lit-material-update-banner")
export class LitMaterialUpdateBanner extends LitElement {
  static override styles = styles;

  /** The version on offer, e.g. `1.3.0`. */
  @property() version = "";
  /** The app's name: "HITOP 1.3.0 is available". Default: "Version 1.3.0 is available". */
  @property({ attribute: "app-name" }) appName = "";
  @property({ reflect: true }) state: UpdateBannerState = "available";
  /** Download progress, 0 to 1, while `downloading`; leave unset (or negative) when the size isn't known. */
  @property({ type: Number }) progress = -1;
  /** What went wrong, for `state="error"`. */
  @property() error = "";
  /** Pins the bar to the bottom end corner of the viewport. */
  @property({ type: Boolean, reflect: true }) floating = false;

  private readonly localize = new LocalizeController(this);

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "status");
  }

  private message(): string {
    const args = { name: this.appName, version: this.version };
    switch (this.state) {
      case "downloading":
        return this.appName
          ? this.localize.term("updateBanner.downloadingNamed", "Downloading {name} {version}…", args)
          : this.localize.term("updateBanner.downloading", "Downloading version {version}…", args);
      case "ready":
        return this.appName
          ? this.localize.term("updateBanner.readyNamed", "{name} {version} is ready to install", args)
          : this.localize.term("updateBanner.ready", "Version {version} is ready to install", args);
      case "error":
        return this.error || this.localize.term("updateBanner.failed", "The update didn't install");
      default:
        return this.appName
          ? this.localize.term("updateBanner.availableNamed", "{name} {version} is available", args)
          : this.localize.term("updateBanner.available", "Version {version} is available", args);
    }
  }

  private percent(): string {
    return new Intl.NumberFormat(langOf(this), { style: "percent" }).format(Math.min(1, Math.max(0, this.progress)));
  }

  private readonly handleUpdate = (): void => {
    this.dispatchEvent(new Event("update", { bubbles: true, composed: true }));
  };

  private readonly handleLater = (): void => {
    this.dispatchEvent(new Event("later", { bubbles: true, composed: true }));
  };

  override render() {
    const downloading = this.state === "downloading";
    const known = this.progress >= 0;
    const action =
      this.state === "ready"
        ? this.localize.term("updateBanner.restart", "Restart")
        : this.state === "error"
          ? this.localize.term("updateBanner.retry", "Try again")
          : this.localize.term("updateBanner.restartToUpdate", "Restart to update");
    return html`
      <div class="banner" part="banner">
        <span class="icon ${this.state === "error" ? "error" : ""}">${this.state === "error" ? ERROR_ICON : ICON}</span>
        <span class="message" part="message"><slot>${this.message()}</slot></span>
        ${downloading
          ? html`<span class="progress-wrap">
              <progress
                part="progress"
                aria-label=${this.localize.term("updateBanner.progress", "Update download")}
                max="1"
                value=${known ? Math.min(1, Math.max(0, this.progress)) : nothing}
              ></progress>
              ${known ? html`<span class="percent" aria-hidden="true">${this.percent()}</span>` : nothing}
            </span>`
          : html`<span class="actions" part="actions">
              <lit-material-button variant="filled" class="update" @click=${this.handleUpdate}>${action}</lit-material-button>
              <lit-material-button variant="text" class="later" @click=${this.handleLater}>${this.localize.term("updateBanner.later", "Later")}</lit-material-button>
            </span>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-update-banner": LitMaterialUpdateBanner;
  }
}
