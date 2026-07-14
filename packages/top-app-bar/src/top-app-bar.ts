import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./top-app-bar-styles.js";

export type TopAppBarVariant = "center-aligned" | "small" | "medium" | "large";

/**
 * Material Design 3 top app bar.
 *
 * A header bar for a screen's title and its primary navigation/actions.
 * `center-aligned` and `small` are a single 64dp row; `medium` and `large`
 * add a second, taller row below for a bigger headline. Layout/typography
 * only — positioning (e.g. `position: sticky; top: 0`) is left to the
 * consumer's page, since a top app bar is used in enough different contexts
 * (full page, a panel, a dialog) that assuming one would be wrong more often
 * than it'd help.
 *
 * Scroll-driven elevation is built in: by default the bar watches `window`
 * scroll and reflects `elevated` (surface tint + shadow) once the page has
 * scrolled past `threshold`. Point `scrollTarget` at a specific scrolling
 * element instead of the window, or set `elevated` directly if you're
 * already tracking scroll yourself. What's deliberately out of scope is the
 * Large/Medium-collapses-to-Small-on-scroll morphing behavior — that
 * changes layout, not just elevation, and is a reasonable follow-up rather
 * than part of this first pass.
 *
 * @element lit-material-top-app-bar
 *
 * @slot - The headline/title text.
 * @slot leading - Typically a single navigation icon button.
 * @slot trailing - Action icon buttons, in order.
 *
 * @csspart bar - The header element (background/elevation).
 * @csspart leading - The leading slot's container.
 * @csspart headline - The headline slot's container.
 * @csspart trailing - The trailing slot's container.
 */
@customElement("lit-material-top-app-bar")
export class LitMaterialTopAppBar extends LitElement {
  static override styles = styles;

  @property() variant: TopAppBarVariant = "small";

  /**
   * Whether the bar shows its "scrolled" surface tint + shadow. Kept in sync
   * automatically from `scrollTarget` (or `window` scroll by default), but
   * can also be set directly if you're driving it from your own listener.
   */
  @property({ type: Boolean, reflect: true }) elevated = false;

  /** Element whose scroll position drives `elevated` automatically. Defaults to `window`. */
  @property({ attribute: false }) scrollTarget?: HTMLElement;

  /** Scroll offset in pixels past which `elevated` turns on. */
  @property({ type: Number }) threshold = 4;

  private attachedTarget: HTMLElement | Window | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.attachScrollListener();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachScrollListener();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("scrollTarget")) {
      this.attachScrollListener();
    }
  }

  private attachScrollListener(): void {
    this.detachScrollListener();
    if (typeof window === "undefined") return; // SSR guard: no scroll to track server-side.
    const target = this.scrollTarget ?? window;
    target.addEventListener("scroll", this.handleScroll, { passive: true });
    this.attachedTarget = target;
    this.handleScroll();
  }

  private detachScrollListener(): void {
    this.attachedTarget?.removeEventListener("scroll", this.handleScroll);
    this.attachedTarget = null;
  }

  private readonly handleScroll = (): void => {
    const scrollTop = this.scrollTarget ? this.scrollTarget.scrollTop : window.scrollY;
    this.elevated = scrollTop > this.threshold;
  };

  override render() {
    return html`
      <header class="bar ${this.variant}" part="bar">
        <div class="leading" part="leading"><slot name="leading"></slot></div>
        <span class="headline" part="headline"><slot></slot></span>
        <div class="trailing" part="trailing"><slot name="trailing"></slot></div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-top-app-bar": LitMaterialTopAppBar;
  }
}
