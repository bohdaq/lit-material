import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./timestamp-styles.js";

export type TimestampDateFormat = "full" | "long" | "medium" | "short" | "none";
export type TimestampTimeFormat = "full" | "long" | "medium" | "short" | "none";

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
];

function pickRelativeUnit(diffMs: number): { value: number; unit: Intl.RelativeTimeFormatUnit } {
  const abs = Math.abs(diffMs);
  for (const { unit, ms } of RELATIVE_UNITS) {
    if (abs >= ms || unit === "second") {
      return { value: Math.round(diffMs / ms), unit };
    }
  }
  return { value: 0, unit: "second" };
}

/**
 * A date/time display built on the native `<time>` element — its
 * machine-readable `datetime` attribute always holds a full ISO string
 * regardless of how the visible text is formatted.
 *
 * `relative` swaps the visible text for a live-updating relative phrase
 * ("3 hours ago", "in 2 days") via `Intl.RelativeTimeFormat`, refreshed
 * every 30 seconds while connected, with the absolute `dateFormat`/
 * `timeFormat`-formatted date always available in the native `title`
 * tooltip — so precision is never more than a hover away, even when the
 * visible text is intentionally coarse.
 *
 * @element lit-material-timestamp
 *
 * @csspart time - The `<time>` element.
 */
@customElement("lit-material-timestamp")
export class LitMaterialTimestamp extends LitElement {
  static override styles = styles;

  /** An ISO 8601 date-time string. */
  @property() date = "";
  @property({ attribute: "date-format" }) dateFormat: TimestampDateFormat = "medium";
  @property({ attribute: "time-format" }) timeFormat: TimestampTimeFormat = "none";
  @property({ type: Boolean, reflect: true }) relative = false;
  /** BCP 47 locale tag. Defaults to the browser's own locale when unset. */
  @property() locale = "";

  private refreshTimer?: ReturnType<typeof setInterval>;

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncRefreshTimer();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.refreshTimer);
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("relative")) this.syncRefreshTimer();
  }

  private syncRefreshTimer(): void {
    clearInterval(this.refreshTimer);
    // Not actually reachable during @lit-labs/ssr's render (connectedCallback
    // doesn't fire there — see lit-material-tooltip for the fuller
    // explanation), but the guard is cheap insurance against a stray Node
    // timer if that were ever untrue.
    if (!this.relative || typeof setInterval === "undefined") return;
    this.refreshTimer = setInterval(() => this.requestUpdate(), 30_000);
  }

  private get parsedDate(): Date | null {
    if (!this.date) return null;
    const parsed = new Date(this.date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private formatAbsolute(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {};
    if (this.dateFormat !== "none") options.dateStyle = this.dateFormat;
    if (this.timeFormat !== "none") options.timeStyle = this.timeFormat;
    if (!options.dateStyle && !options.timeStyle) return "";
    return new Intl.DateTimeFormat(this.locale || undefined, options).format(date);
  }

  private formatRelative(date: Date): string {
    const { value, unit } = pickRelativeUnit(date.getTime() - Date.now());
    return new Intl.RelativeTimeFormat(this.locale || undefined, { numeric: "auto" }).format(value, unit);
  }

  override render() {
    const date = this.parsedDate;
    if (!date) return html`<time class="time" part="time"><slot></slot></time>`;

    const displayText = this.relative ? this.formatRelative(date) : this.formatAbsolute(date);
    const title = this.relative ? this.formatAbsolute(date) : nothing;

    return html`<time class="time" part="time" datetime=${date.toISOString()} title=${title || nothing}
      >${displayText}</time
    >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-timestamp": LitMaterialTimestamp;
  }
}
