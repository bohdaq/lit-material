import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import "./clipboard-copy.js";

let instanceCount = 0;

/**
 * A secret shown once, right after it was created: an access token, an API
 * key, a recovery code. The value with a copy button, and a warning that it
 * can't be shown again. Put a "Done" button in the `actions` slot that drops
 * the element (and the secret) from the page.
 *
 * Announced to screen readers when it appears (`role="status"`), and focus
 * goes to the value on first render, so the reader lands on it.
 *
 * @element lit-material-new-secret
 *
 * @slot warning - Replaces the default warning text.
 * @slot actions - Buttons under the value, e.g. "Done".
 *
 * @csspart container - The outlined box.
 * @csspart value - The `lit-material-clipboard-copy` holding the secret.
 *
 * @cssprop --lit-material-new-secret-shape - Corner radius (default `--md-sys-shape-corner-medium`).
 *
 * @fires copy - Bubbles from the copy button; `detail` is `{ text, ok }`.
 */
@customElement("lit-material-new-secret")
export class LitMaterialNewSecret extends LitElement {
  static override styles = css`
    :host {
      display: block;
      min-inline-size: min(100%, 360px);
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    }
    :host([hidden]) {
      display: none;
    }
    .container {
      display: grid;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      border-radius: var(--lit-material-new-secret-shape, var(--md-sys-shape-corner-medium, 12px));
      background: var(--md-sys-color-surface-container-low, light-dark(#f7f2fa, #1d1b20));
    }
    .heading {
      margin: 0;
      font-size: var(--md-sys-typescale-title-small-size, 0.875rem);
      font-weight: var(--md-sys-typescale-title-small-weight, 500);
    }
    .warning {
      margin: 0;
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    lit-material-clipboard-copy {
      background: var(--md-sys-color-surface, light-dark(#fef7ff, #141218));
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }
    .actions[hidden] {
      display: none;
    }
  `;

  /** The secret. */
  @property() value = "";

  /** What it is, e.g. "Access token \"ci\"": the heading and the value's accessible name. */
  @property() label = "";

  @state() private hasActions = false;

  private readonly localize = new LocalizeController(this);
  private readonly headingId = `lit-material-new-secret-${++instanceCount}`;

  protected override async firstUpdated(): Promise<void> {
    const copy = this.renderRoot.querySelector("lit-material-clipboard-copy");
    await (copy as LitElement | null)?.updateComplete;
    copy?.shadowRoot?.querySelector("input")?.focus();
  }

  override render() {
    const label = this.label || this.localize.term("newSecret.label", "New secret");
    return html`
      <div class="container" part="container" role="status" aria-labelledby=${this.headingId}>
        <p class="heading" id=${this.headingId}>${label}</p>
        <lit-material-clipboard-copy part="value" .value=${this.value} label=${label}></lit-material-clipboard-copy>
        <p class="warning">
          <slot name="warning">${this.localize.term("newSecret.warning", "Copy it now and keep it somewhere safe: it won't be shown again.")}</slot>
        </p>
        <div class="actions" ?hidden=${!this.hasActions}>
          <slot
            name="actions"
            @slotchange=${(e: Event) => (this.hasActions = (e.target as HTMLSlotElement).assignedElements().length > 0)}
          ></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-new-secret": LitMaterialNewSecret;
  }
}
