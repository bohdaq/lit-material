import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "./menu.js";
import type { LitMaterialMenu } from "./menu.js";

/**
 * An app launcher: a grid button in a top bar that opens a menu of the
 * other apps and consoles a person can go to — Grafana, the billing portal,
 * the docs.
 *
 * Put `lit-material-list-item`s with `href` in it (an icon in their
 * `leading` slot, a description in `supporting-text`), and dividers or
 * headings between groups. With `searchable` a field at the top filters the
 * items by their text as you type; arrow keys go from it into the list.
 *
 * @element lit-material-app-launcher
 *
 * @slot - The apps: `lit-material-list-item` elements with `href`.
 * @slot icon - Replaces the grid icon on the button.
 *
 * @csspart button - The button that opens the menu.
 * @csspart menu - The menu.
 * @csspart search - The search field.
 *
 * @fires close - After the menu closes.
 */
@customElement("lit-material-app-launcher")
export class LitMaterialAppLauncher extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    :host([hidden]) {
      display: none;
    }
    .button {
      display: inline-grid;
      place-items: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 0;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      background: transparent;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      cursor: pointer;
    }
    .button:hover,
    .button[aria-expanded="true"] {
      background: color-mix(in srgb, currentColor 8%, transparent);
    }
    .button:focus-visible {
      outline: 3px solid var(--md-sys-color-secondary, light-dark(#625b71, #ccc2dc));
      outline-offset: 2px;
    }
    .button svg,
    ::slotted([slot="icon"]) {
      width: 24px;
      height: 24px;
    }
    lit-material-menu {
      min-width: 280px;
      max-width: min(360px, calc(100vw - 16px));
    }
    .search {
      padding: 4px 12px 8px;
    }
    input {
      box-sizing: border-box;
      width: 100%;
      height: 40px;
      padding: 0 12px;
      border: 1px solid var(--md-sys-color-outline, light-dark(#79747e, #938f99));
      border-radius: var(--md-sys-shape-corner-extra-small, 4px);
      background: transparent;
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
      font: inherit;
      font-family: var(--md-sys-typescale-body-large-font, Roboto, system-ui, sans-serif);
      font-size: var(--md-sys-typescale-body-large-size, 1rem);
    }
    input:focus {
      outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      outline-offset: -1px;
      border-color: transparent;
    }
    .empty {
      margin: 8px 16px 12px;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    }
  `;

  /** Names the button and the menu. */
  @property() label = "Applications";

  /** Adds a field that filters the apps by their text. */
  @property({ type: Boolean, reflect: true }) searchable = false;

  /** The search field's accessible name. */
  @property({ attribute: "search-label" }) searchLabel = "Search applications";

  /** Shown when the search matches nothing. */
  @property({ attribute: "empty-text" }) emptyText = "No applications match";

  @property({ type: Boolean, reflect: true }) open = false;

  @state() private noMatches = false;

  /**
   * Open when the pointer went down on the button: the popover's light dismiss
   * closes the menu before the click, which must then not reopen it.
   */
  private openAtPointerDown = false;

  @query("button") private readonly button!: HTMLButtonElement;
  @query("lit-material-menu") private readonly menu!: LitMaterialMenu;
  @query("input") private readonly search?: HTMLInputElement;

  /** Opens the menu. */
  show(): void {
    this.menu.show(this.button);
    this.open = true;
    // The menu focuses itself on opening; with a search field, start there.
    if (this.searchable) requestAnimationFrame(() => this.search?.focus());
  }

  /** Closes the menu. */
  close(): void {
    this.menu.close();
  }

  private get apps(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>("lit-material-list-item"));
  }

  private filter(): void {
    const query = (this.search?.value ?? "").trim().toLowerCase();
    let shown = 0;
    for (const app of this.apps) {
      const match = !query || (app.textContent ?? "").toLowerCase().includes(query);
      app.hidden = !match;
      if (match) shown++;
    }
    this.noMatches = shown === 0 && this.apps.length > 0;
  }

  private onButtonClick(event: MouseEvent): void {
    const wasOpen = event.detail > 0 ? this.openAtPointerDown : this.open;
    this.openAtPointerDown = false;
    if (wasOpen) this.close();
    else this.show();
  }

  private onClose(): void {
    this.open = false;
    if (this.search && this.search.value) {
      this.search.value = "";
      this.filter();
    }
  }

  override render() {
    return html`<button
        part="button"
        class="button"
        type="button"
        aria-label=${this.label}
        aria-haspopup="true"
        aria-expanded=${this.open ? "true" : "false"}
        @pointerdown=${() => (this.openAtPointerDown = this.open)}
        @click=${this.onButtonClick}
      >
        <slot name="icon"
          ><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path
              d="M4 8h4V4H4zm6 12h4v-4h-4zm-6 0h4v-4H4zm0-6h4v-4H4zm6 0h4v-4h-4zm6-10v4h4V4zm-6 4h4V4h-4zm6 6h4v-4h-4zm0 6h4v-4h-4z"
            /></svg
        ></slot>
      </button>
      <lit-material-menu part="menu" aria-label=${this.label} @close=${this.onClose}>
        ${this.searchable
          ? html`<div class="search"><input part="search" type="search" autocomplete="off" aria-label=${this.searchLabel} @input=${this.filter} /></div>`
          : nothing}
        <slot @slotchange=${() => this.search?.value && this.filter()}></slot>
        ${this.noMatches ? html`<p class="empty" role="status">${this.emptyText}</p>` : nothing}
      </lit-material-menu>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-app-launcher": LitMaterialAppLauncher;
  }
}
