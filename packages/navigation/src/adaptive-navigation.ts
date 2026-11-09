import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import "./navigation-drawer.js";
import "./navigation-drawer-item.js";
import "./navigation-rail.js";
import "./navigation-rail-item.js";
import "./navigation-bar.js";
import "./navigation-bar-item.js";

export interface NavigationDestination {
  label: string;
  /** An icon: an `svg`/`html` template, or text such as an emoji. */
  icon?: TemplateResult | string;
  href?: string;
  disabled?: boolean;
  /** A badge on the icon: `true` for a dot, or a short count or text. Say what it means in `badgeLabel`. */
  badge?: boolean | number | string;
  /** The badge's meaning for screen readers ("2 conflicts"); without it a dot is silent. */
  badgeLabel?: string;
}

/**
 * One set of destinations shown as M3 prescribes for the window's width: a
 * navigation bar on compact windows (under 600px), a rail on medium ones
 * (600–839px), and a drawer — or a rail, with `expanded="rail"` — on
 * expanded ones (840px and up).
 *
 * All three are rendered and CSS shows one, so it needs no script to pick
 * and server-rendered markup is already right; the hidden ones are out of
 * the accessibility tree. `selected` is shared, and `change` fires (with the
 * new index in `selected`) whichever one was used.
 *
 * Place the bar yourself — e.g. the host fixed or sticky at the bottom on
 * compact windows: it sits where the element is.
 *
 * @element lit-material-adaptive-navigation
 *
 * @fires change - The selection changed; read `selected`.
 *
 * @cssprop --lit-material-adaptive-navigation-medium - Not a variable: breakpoints are fixed at 600px and 840px (M3 window size classes).
 */
@customElement("lit-material-adaptive-navigation")
export class LitMaterialAdaptiveNavigation extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }
    .bar,
    .rail,
    .drawer {
      display: none;
    }
    @media (max-width: 599.98px) {
      .bar { display: block; }
    }
    @media (min-width: 600px) and (max-width: 839.98px) {
      .rail { display: block; height: 100%; }
    }
    @media (min-width: 840px) {
      :host(:not([expanded="rail"])) .drawer { display: block; height: 100%; }
      :host([expanded="rail"]) .rail { display: block; height: 100%; }
    }
    [slot="icon"] {
      display: inline-flex;
      width: 24px;
      height: 24px;
      align-items: center;
      justify-content: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 6px;
      height: 6px;
      border-radius: 3px;
      background: var(--md-sys-color-error, #b3261e);
      color: var(--md-sys-color-on-error, #fff);
      font-size: 0.6875rem;
      line-height: 1;
    }
    .badge.count {
      min-width: 16px;
      height: 16px;
      padding-inline: 4px;
      border-radius: 8px;
      box-sizing: border-box;
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    [slot="icon"] svg {
      width: 100%;
      height: 100%;
    }
  `;

  @property({ attribute: false }) destinations: NavigationDestination[] = [];

  @property({ type: Number }) selected = -1;

  /** The rail is icon-only and 56px wide, labels as tooltips (`lit-material-navigation-rail` `compact`). */
  @property({ type: Boolean, reflect: true }) compact = false;

  /** What expanded windows show: `drawer` (default) or `rail`. */
  @property({ reflect: true }) expanded: "drawer" | "rail" = "drawer";

  /** The accessible name of the navigation landmark. Default: "Main", translated. */
  @property() label?: string;

  private readonly localize = new LocalizeController(this);

  private onChange(event: Event): void {
    event.stopPropagation();
    const selected = (event.target as unknown as { selected: number }).selected;
    if (selected === this.selected) return;
    this.selected = selected;
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private icon(d: NavigationDestination) {
    const icon = d.icon === undefined ? nothing : html`<span slot="icon" aria-hidden="true">${d.icon}</span>`;
    if (d.badge === undefined || d.badge === false) return icon;
    const text = d.badge === true ? "" : String(d.badge);
    return html`${icon}<span slot="badge" class=${text ? "badge count" : "badge"} aria-hidden="true">${text}</span>`;
  }

  private itemLabel(d: NavigationDestination) {
    return d.badgeLabel ? html`${d.label}<span class="visually-hidden">, ${d.badgeLabel}</span>` : d.label;
  }

  override render() {
    const ds = this.destinations;
    return html`
      <nav aria-label=${this.label ?? this.localize.term("navigation.main", "Main")}>
        <div class="drawer">
          <lit-material-navigation-drawer .selected=${this.selected} @change=${this.onChange}>
            ${ds.map((d, i) => html`<lit-material-navigation-drawer-item ?selected=${i === this.selected} ?disabled=${!!d.disabled} href=${d.href ?? nothing}
              >${this.icon(d)}${this.itemLabel(d)}</lit-material-navigation-drawer-item>`)}
          </lit-material-navigation-drawer>
        </div>
        <div class="rail">
          <lit-material-navigation-rail ?compact=${this.compact} .selected=${this.selected} @change=${this.onChange}>
            ${ds.map((d, i) => html`<lit-material-navigation-rail-item ?selected=${i === this.selected} ?disabled=${!!d.disabled} href=${d.href ?? nothing}
              >${this.icon(d)}${this.itemLabel(d)}</lit-material-navigation-rail-item>`)}
          </lit-material-navigation-rail>
        </div>
        <div class="bar">
          <lit-material-navigation-bar .selected=${this.selected} @change=${this.onChange}>
            ${ds.map((d, i) => html`<lit-material-navigation-bar-item ?selected=${i === this.selected} ?disabled=${!!d.disabled} href=${d.href ?? nothing}
              >${this.icon(d)}${this.itemLabel(d)}</lit-material-navigation-bar-item>`)}
          </lit-material-navigation-bar>
        </div>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-adaptive-navigation": LitMaterialAdaptiveNavigation;
  }
}
