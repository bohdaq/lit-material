import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./badge-styles.js";

export type BadgeValue = string | number;

/**
 * Material Design 3 badge — a small status indicator, typically overlaid on
 * a corner of another element (an icon, an avatar, a nav item) to flag a
 * notification count or unread state.
 *
 * With no `value`, renders as a small dot (MD3's "small" badge). Set
 * `value` — a number (clamped by `max` to e.g. `"99+"`) or arbitrary text
 * like `"NEW"` — and it grows into the pill-shaped "large" badge
 * automatically.
 *
 * There's deliberately no content slot: an earlier version tried
 * auto-sizing from slotted content (via a `slotchange` listener and reading
 * `this.textContent`), but `@lit-labs/ssr` never attaches light DOM
 * children to the element instance it renders with at all — `textContent`
 * and `childNodes` are `undefined` there, not just empty — so server-
 * rendered markup could never know a slotted badge had content and would
 * always render the tiny dot, flashing to the correct size only after
 * client-side hydration. Routing everything through the `value` property
 * instead is fully reactive and SSR-safe by construction, so that's the
 * only content API this component has.
 *
 * Purely presentational: no dependency on `@lit-material/core` (nothing to
 * click or focus). Positioning (e.g. absolutely placed over a corner of an
 * icon) is left to your own CSS — badges show up in enough different
 * layouts that assuming one would be wrong more often than it'd help, the
 * same reasoning `lit-material-top-app-bar` uses for its own positioning.
 *
 * A bare number or dot is meaningless out of context ("5" — five what?), and
 * is usually paired with a parent control that already describes it in its
 * own `aria-label` (e.g. an icon button labeled "Notifications, 5 unread").
 * So by default the badge is `aria-hidden` — purely decorative, adding
 * nothing to the accessibility tree on top of that parent label. Set
 * `label` to override that and expose the badge as its own
 * `role="status"` live region instead (e.g. for a standalone badge with no
 * describing parent) — `aria-hidden` and `label` are mutually exclusive by
 * construction, not something to combine.
 *
 * @element lit-material-badge
 *
 * @csspart badge - The badge's visible surface.
 */
@customElement("lit-material-badge")
export class LitMaterialBadge extends LitElement {
  static override styles = styles;

  /** A number (clamped by `max`) or arbitrary text. Unset renders the small dot. */
  @property() value?: BadgeValue;

  /** Above this, a numeric `value` displays as `"{max}+"` instead of the exact number. */
  @property({ type: Number }) max = 99;

  /** Accessible name for a standalone badge. See the class docs for when to use this. */
  @property() label?: string;

  private get displayValue(): string {
    // HTML attributes always arrive as strings — value="150" set via
    // markup is the string "150", not the number 150 — so numeric-ness is
    // decided by whether the value *parses* as a number, not by
    // `typeof this.value`, to clamp attribute-set and property-set numbers
    // the same way. Non-numeric text (e.g. "NEW") is rendered as-is.
    const numeric = Number(this.value);
    if (Number.isNaN(numeric)) return String(this.value);
    return numeric > this.max ? `${this.max}+` : String(numeric);
  }

  override render() {
    const hasValue = this.value !== undefined && this.value !== "";
    return html`
      <span
        class="badge ${hasValue ? "large" : ""}"
        part="badge"
        role=${this.label ? "status" : nothing}
        aria-label=${this.label || nothing}
        aria-hidden=${this.label ? nothing : "true"}
      >
        ${hasValue ? this.displayValue : nothing}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-badge": LitMaterialBadge;
  }
}
