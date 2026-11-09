import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";

export type StatusBarTone = "neutral" | "success" | "warning" | "error";

/**
 * A thin bar along the bottom of an app window, like an editor's: the open
 * file, the save state, the connection, a shortcut hint. Items go in the
 * default slot (the start) or the `end` slot; on narrow windows the bar
 * wraps instead of clipping.
 *
 * The bar is a labelled region (`label`, default "Status"). Put
 * `lit-material-status-bar-item` elements in it, or any short text.
 *
 * @element lit-material-status-bar
 *
 * @slot - Items at the start.
 * @slot end - Items at the end.
 *
 * @csspart bar - The bar.
 *
 * @cssprop --lit-material-status-bar-height - Minimum height (default `28px`).
 * @cssprop --lit-material-status-bar-background - Background (default `--md-sys-color-surface`).
 * @cssprop --lit-material-status-bar-color - Text (default `--md-sys-color-on-surface-variant`).
 */
@customElement("lit-material-status-bar")
export class LitMaterialStatusBar extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border-block-start: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
      background: var(--lit-material-status-bar-background, var(--md-sys-color-surface, light-dark(#fef7ff, #141218)));
      color: var(--lit-material-status-bar-color, var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0)));
      font-family: var(--md-sys-typescale-body-small-font, Roboto, system-ui, sans-serif);
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      line-height: 1rem;
      font-variant-numeric: tabular-nums;
    }
    :host([hidden]) {
      display: none;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px 16px;
      box-sizing: border-box;
      min-height: var(--lit-material-status-bar-height, 28px);
      padding: 2px 12px;
    }
    .start,
    .end {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px 16px;
      min-width: 0;
    }
    .end {
      margin-inline-start: auto;
    }
  `;

  /** The region's accessible name. Unset, "Status", translated. */
  @property() label = "";

  private readonly localize = new LocalizeController(this);

  override render() {
    return html`<div class="bar" part="bar" role="region" aria-label=${this.label || this.localize.term("statusBar.label", "Status")}>
      <div class="start"><slot></slot></div>
      <div class="end"><slot name="end"></slot></div>
    </div>`;
  }
}

/**
 * One item in a `lit-material-status-bar`: plain text, a button (`button`),
 * or a link (`href`). `tone` colours it and is not colour only: pair it with
 * words ("Unsaved", "2 conflicts"). An optional `icon` slot goes before the
 * text.
 *
 * @element lit-material-status-bar-item
 *
 * @slot - The text.
 * @slot icon - An icon before the text.
 *
 * @fires click - The button was pressed (native).
 *
 * @csspart item - The span, button or link.
 */
@customElement("lit-material-status-bar-item")
export class LitMaterialStatusBarItem extends LitElement {
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles = css`
    :host {
      display: inline-flex;
      min-width: 0;
    }
    :host([hidden]) {
      display: none;
    }
    .item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 24px;
      max-width: 100%;
      margin: 0;
      padding: 0 4px;
      border: 0;
      border-radius: var(--md-sys-shape-corner-extra-small, 4px);
      background: none;
      color: inherit;
      font: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-decoration: none;
    }
    button.item,
    a.item {
      cursor: pointer;
    }
    button.item:hover,
    a.item:hover {
      background: color-mix(in srgb, currentColor 8%, transparent);
    }
    .item:focus-visible {
      outline: 2px solid var(--md-sys-color-secondary, #625b71);
      outline-offset: 1px;
    }
    :host([tone="success"]) .item {
      color: var(--lit-material-status-bar-success, light-dark(#2f6b4a, #7fd8b0));
    }
    :host([tone="warning"]) .item {
      color: var(--lit-material-status-bar-warning, light-dark(#8a5a12, #f2b45c));
    }
    :host([tone="error"]) .item {
      color: var(--lit-material-status-bar-error, var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5)));
    }
    slot[name="icon"]::slotted(*) {
      width: 14px;
      height: 14px;
      flex: none;
    }
    @media (pointer: coarse) {
      .item {
        min-height: 32px;
      }
    }
  `;

  /** Renders a `<button>`. */
  @property({ type: Boolean, reflect: true }) button = false;
  /** Renders a link. */
  @property() href = "";
  /** Colour of the text; say the state in words too. */
  @property({ reflect: true }) tone: StatusBarTone = "neutral";
  /** A longer description (`title`), e.g. what a button does. */
  @property() description = "";

  override render() {
    const content = html`<slot name="icon"></slot><slot></slot>`;
    const title = this.description || nothing;
    if (this.href) return html`<a class="item" part="item" href=${this.href} title=${title}>${content}</a>`;
    if (this.button) return html`<button class="item" part="item" type="button" title=${title}>${content}</button>`;
    return html`<span class="item" part="item" title=${title}>${content}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-status-bar": LitMaterialStatusBar;
    "lit-material-status-bar-item": LitMaterialStatusBarItem;
  }
}
