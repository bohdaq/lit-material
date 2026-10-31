import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@lit-material/icon-button";
import "./copy-button.js";
import { hideIcon, showIcon } from "./icons.js";

/**
 * A single-line value with a copy button: URLs, ids, commands, tokens.
 * The value sits in a read-only, selectable field in a monospace face.
 * `masked` hides it behind dots with a show/hide toggle, for secrets.
 *
 * For multi-line text (a kubeconfig, a script) use
 * `lit-material-code-block`, which copies too.
 *
 * @element lit-material-clipboard-copy
 *
 * @csspart field - The read-only input.
 *
 * @cssprop --lit-material-clipboard-copy-font - The value's font family (default monospace).
 *
 * @fires copy - After a copy attempt; `detail` is `{ text, ok }`.
 */
@customElement("lit-material-clipboard-copy")
export class LitMaterialClipboardCopy extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      padding-inline-start: 12px;
      border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
      border-radius: var(--md-sys-shape-corner-small, 8px);
      background: var(--md-sys-color-surface-container-low, light-dark(#f7f2fa, #1d1b20));
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    }
    input {
      flex: 1;
      min-width: 0;
      padding: 8px 0;
      border: 0;
      background: transparent;
      color: inherit;
      font-family: var(--lit-material-clipboard-copy-font, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace);
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      /* Room for descenders: monospace underscores sit low. */
      line-height: 1.5;
      text-overflow: ellipsis;
    }
    input:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      outline-offset: 2px;
      border-radius: 2px;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  `;

  /** The text shown and copied. */
  @property() value = "";

  /** Accessible name for the value, e.g. "API URL". */
  @property() label = "";

  /** Hide the value behind dots, with a show/hide toggle. Copying still copies the value. */
  @property({ type: Boolean }) masked = false;

  @state() private revealed = false;

  override render() {
    const hidden = this.masked && !this.revealed;
    const name = this.label || "Value";
    return html`
      <input
        part="field"
        type=${hidden ? "password" : "text"}
        readonly
        .value=${this.value}
        aria-label=${name}
        autocomplete="off"
        spellcheck="false"
        @focus=${(e: FocusEvent) => (e.target as HTMLInputElement).select()}
      />
      ${this.masked
        ? html`<lit-material-icon-button
            toggle
            .selected=${this.revealed}
            aria-label=${`Show ${name}`}
            @change=${(e: Event) => {
              e.stopPropagation();
              this.revealed = (e.target as HTMLElement & { selected: boolean }).selected;
            }}
          >
            <span slot="icon">${showIcon}</span>
            <span slot="selected-icon">${hideIcon}</span>
          </lit-material-icon-button>`
        : nothing}
      <lit-material-copy-button .value=${this.value} label=${`Copy ${name}`}></lit-material-copy-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-clipboard-copy": LitMaterialClipboardCopy;
  }
}
