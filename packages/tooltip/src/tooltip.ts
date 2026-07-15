import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./tooltip-styles.js";

let nextId = 0;

/**
 * Material Design 3 plain tooltip — a short text label that appears near an
 * anchor element on hover or keyboard focus, built on the native Popover API
 * (`popover="manual"`, so top-layer rendering escapes clipping/overflow
 * ancestors) the same way `lit-material-menu` and `lit-material-snackbar`
 * build on it.
 *
 * Unlike Menu, this component doesn't wait for you to call `show()` — it
 * attaches its own `mouseenter`/`focus`/`mouseleave`/`blur` listeners to
 * whatever `anchorElement` resolves to (from the `anchor` id, or set
 * directly), and manages `showDelay`/`hideDelay` itself. It also sets
 * `aria-describedby` on the anchor pointing at itself, so its text is
 * exposed to assistive tech as a description of the anchor (not a
 * replacement for the anchor's own accessible name — don't rely on a
 * tooltip to be the *only* label for an unlabeled icon button).
 *
 * Deliberately out of scope for this first pass: the MD3 "rich" tooltip
 * variant (title + supporting text + action buttons) and touch long-press
 * triggering — this is the plain, hover/focus-only variant.
 *
 * @element lit-material-tooltip
 *
 * @slot - The tooltip's text.
 *
 * @csspart tooltip - The host itself (background, padding, shape).
 */
@customElement("lit-material-tooltip")
export class LitMaterialTooltip extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;
  /** id of the anchor element to position against and describe. See also `anchorElement`. */
  @property() anchor?: string;
  /** Hover/focus delay (ms) before showing. */
  @property({ type: Number, attribute: "show-delay" }) showDelay = 500;
  /** Delay (ms) before hiding once the anchor is no longer hovered/focused. */
  @property({ type: Number, attribute: "hide-delay" }) hideDelay = 200;

  private explicitAnchorElement?: HTMLElement;
  private boundAnchor?: HTMLElement;
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  // Not `this.id`: the SSR light-DOM shim doesn't implement `id` as a
  // reflecting accessor, so assigning `this.id = ...` silently sets a
  // stray JS property instead of the "id" content attribute, and never
  // makes it into SSR's serialized output. Computed once from any
  // statically-declared "id" attribute (available synchronously at
  // construction for parser-created elements) or generated, then applied
  // via setAttribute() in willUpdate() like every other host attribute here.
  private readonly tooltipId: string;

  constructor() {
    super();
    // Reading (not setting) an attribute here, and only for parser-created elements: per the custom element
    // upgrade reaction spec, an element already parsed with a static `id="..."` before `customElements.define()`
    // runs has that attribute in place by the time its (now-upgraded) constructor executes — this line only ever
    // sees a real, author-set id in exactly that case. A `document.createElement()`-created element has no
    // attributes yet regardless, so `getAttribute` correctly returns `null` and falls through to generating one.
    // eslint-disable-next-line wc/no-constructor-attributes
    this.tooltipId = this.getAttribute("id") || `lit-material-tooltip-${++nextId}`;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unbindAnchor();
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
  }

  protected override willUpdate(): void {
    // Not connectedCallback(): attribute mutations made there don't make it
    // into SSR's serialized host tag (see lit-material-linear-progress for
    // the full explanation) — willUpdate() runs inside the same
    // synchronous pass that produces SSR's output. These are all static,
    // but the guards keep this idempotent across every update regardless.
    if (!this.hasAttribute("popover")) this.setAttribute("popover", "manual");
    if (!this.hasAttribute("role")) this.setAttribute("role", "tooltip");
    if (!this.hasAttribute("id")) this.setAttribute("id", this.tooltipId);
  }

  protected override firstUpdated(): void {
    this.bindAnchor();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("anchor")) this.bindAnchor();
    if (changed.has("open")) this.syncOpenState();
  }

  /** The element this tooltip describes and positions against. */
  get anchorElement(): HTMLElement | undefined {
    if (this.explicitAnchorElement) return this.explicitAnchorElement;
    if (this.anchor && typeof this.getRootNode === "function") {
      const root = this.getRootNode() as Document | ShadowRoot;
      return typeof root.getElementById === "function" ? (root.getElementById(this.anchor) ?? undefined) : undefined;
    }
    return undefined;
  }

  set anchorElement(element: HTMLElement | undefined) {
    this.explicitAnchorElement = element;
    this.bindAnchor();
  }

  /** Shows the tooltip immediately, bypassing `showDelay`. */
  show(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    this.open = true;
  }

  /** Hides the tooltip immediately, bypassing `hideDelay`. */
  hide(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    this.open = false;
  }

  private syncOpenState(): void {
    if (typeof this.showPopover !== "function") return; // SSR guard
    if (this.open) {
      if (!this.matches(":popover-open")) {
        this.showPopover();
        this.updatePosition();
      }
    } else if (this.matches(":popover-open")) {
      this.hidePopover();
    }
  }

  private bindAnchor(): void {
    const next = this.anchorElement;
    if (next === this.boundAnchor) return;
    this.unbindAnchor();
    this.boundAnchor = next;
    if (!next) return;
    next.addEventListener("mouseenter", this.handleAnchorShow);
    next.addEventListener("focus", this.handleAnchorShow);
    next.addEventListener("mouseleave", this.handleAnchorHide);
    next.addEventListener("blur", this.handleAnchorHide);
    next.addEventListener("keydown", this.handleAnchorKeydown);
    next.setAttribute("aria-describedby", this.tooltipId);
  }

  private unbindAnchor(): void {
    if (!this.boundAnchor) return;
    this.boundAnchor.removeEventListener("mouseenter", this.handleAnchorShow);
    this.boundAnchor.removeEventListener("focus", this.handleAnchorShow);
    this.boundAnchor.removeEventListener("mouseleave", this.handleAnchorHide);
    this.boundAnchor.removeEventListener("blur", this.handleAnchorHide);
    this.boundAnchor.removeEventListener("keydown", this.handleAnchorKeydown);
    if (this.boundAnchor.getAttribute("aria-describedby") === this.tooltipId) {
      this.boundAnchor.removeAttribute("aria-describedby");
    }
    this.boundAnchor = undefined;
  }

  private updatePosition(): void {
    const anchorEl = this.anchorElement;
    if (!anchorEl) return;
    const anchorRect = anchorEl.getBoundingClientRect();
    const tooltipRect = this.getBoundingClientRect();
    const gap = 4;

    // Prefer above the anchor; flip below if that would go off the top of the viewport.
    let top = anchorRect.top - gap - tooltipRect.height;
    if (top < 0) {
      top = anchorRect.bottom + gap;
    }

    let left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
    left = Math.max(4, Math.min(left, window.innerWidth - tooltipRect.width - 4));

    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
  }

  private readonly handleAnchorShow = (): void => {
    clearTimeout(this.hideTimer);
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => this.show(), this.showDelay);
  };

  private readonly handleAnchorHide = (): void => {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.hide(), this.hideDelay);
  };

  private readonly handleAnchorKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.open) {
      this.hide();
    }
  };

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-tooltip": LitMaterialTooltip;
  }
}
