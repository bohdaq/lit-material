import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * A "Back to top" button for long pages: it appears once the page has
 * scrolled past `threshold`, and takes the reader back up — smoothly, unless
 * they prefer reduced motion.
 *
 * Give it `target`, the id of the element at the top (a page's `<main>` or
 * `<h1>`): the button is then an `<a href="#target">` and focus moves there
 * too, so keyboard and screen-reader users continue from the top instead of
 * from a button at the bottom. Without a target it scrolls the window to 0.
 *
 * While hidden it's out of the tab order and hidden from assistive
 * technology.
 *
 * @element lit-material-back-to-top
 *
 * @csspart button - The link.
 *
 * @cssprop --lit-material-back-to-top-inset - Distance from the viewport's bottom and end edges (default `16px`).
 */
@customElement("lit-material-back-to-top")
export class LitMaterialBackToTop extends LitElement {
  static override styles = css`
    :host {
      position: fixed;
      inset-block-end: var(--lit-material-back-to-top-inset, 16px);
      inset-inline-end: var(--lit-material-back-to-top-inset, 16px);
      z-index: 10;
      visibility: hidden;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 150ms linear, transform 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)), visibility 0s linear 150ms;
    }
    :host([visible]) {
      visibility: visible;
      opacity: 1;
      transform: none;
      transition: opacity 150ms linear, transform 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)), visibility 0s;
    }
    :host([hidden]) {
      display: none;
    }
    a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-sizing: border-box;
      min-height: 40px;
      padding: 0 16px 0 12px;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      background: var(--md-sys-color-secondary-container, light-dark(#e8def8, #4a4458));
      color: var(--md-sys-color-on-secondary-container, light-dark(#1d192b, #e8def8));
      box-shadow: var(--md-sys-elevation-level3, 0 1px 3px rgb(0 0 0 / 0.3), 0 4px 8px 3px rgb(0 0 0 / 0.15));
      font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
      font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
      font-weight: var(--md-sys-typescale-label-large-weight, 500);
      line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
      text-decoration: none;
    }
    a:hover {
      background: color-mix(in srgb, currentColor 8%, var(--md-sys-color-secondary-container, light-dark(#e8def8, #4a4458)));
    }
    a:focus-visible {
      outline: 3px solid var(--md-sys-color-secondary, light-dark(#625b71, #ccc2dc));
      outline-offset: 2px;
    }
    svg {
      width: 18px;
      height: 18px;
      flex: none;
    }
    @media (prefers-reduced-motion: reduce) {
      :host,
      :host([visible]) {
        transform: none;
        transition: none;
      }
    }
  `;

  /** Pixels scrolled before it appears. */
  @property({ type: Number }) threshold = 400;

  /** Id of the element at the top: scrolled to and focused. Empty: the window's top. */
  @property() target = "";

  @property() label = "Back to top";

  /** Set while the page is scrolled past `threshold`; reflected. */
  @property({ type: Boolean, reflect: true }) visible = false;

  private ticking = false;

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.check();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("scroll", this.onScroll);
  }

  private readonly onScroll = (): void => {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.check();
    });
  };

  private check(): void {
    this.visible = window.scrollY > this.threshold;
  }

  private targetElement(): HTMLElement | null {
    if (!this.target) return null;
    const root = this.getRootNode() as Document | ShadowRoot;
    return (root.getElementById?.(this.target) as HTMLElement | null) ?? document.getElementById(this.target);
  }

  private onClick(event: MouseEvent): void {
    // Let modified clicks open the link elsewhere, as links do.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const behavior: ScrollBehavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const target = this.targetElement();
    if (target) {
      target.scrollIntoView({ behavior, block: "start" });
      if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0, behavior });
      (this.shadowRoot?.activeElement as HTMLElement | null)?.blur();
    }
  }

  override render() {
    return html`<a
      part="button"
      href=${`#${this.target}`}
      tabindex=${this.visible ? "0" : "-1"}
      aria-hidden=${this.visible ? "false" : "true"}
      @click=${this.onClick}
      ><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M11 20V7.83l-5.59 5.59L4 12l8-8 8 8-1.41 1.42L13 7.83V20z" /></svg>${this.label}</a
    >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-back-to-top": LitMaterialBackToTop;
  }
}
