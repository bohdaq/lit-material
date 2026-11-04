import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "@lit-material/button/button.js";
import "@lit-material/dialog";
import "@lit-material/text-field/text-field.js";
import type { LitMaterialDialog } from "@lit-material/dialog";
import { LocalizeController } from "@lit-material/core/localize.js";

/**
 * A confirmation dialog: a headline, a message, Cancel and a confirm button,
 * built on `lit-material-dialog`. `show()` resolves `true` when the visitor
 * confirms and `false` on Cancel, Escape or a backdrop click.
 *
 * `destructive` paints the confirm button in the error colour. Set
 * `require-text` (say, the resource's name) and the confirm button stays
 * disabled until the visitor types it exactly — for deletes that can't be
 * undone. Enter in that field confirms once it matches.
 *
 * For one-off prompts, `confirm({ ... })` from this package creates one of
 * these, awaits it and removes it.
 *
 * @element lit-material-confirm-dialog
 *
 * @slot - The message; overrides `message`.
 *
 * @fires close - After it closes; `returnValue` is `"confirm"` or `"cancel"`.
 */
@customElement("lit-material-confirm-dialog")
export class LitMaterialConfirmDialog extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }

    :host([hidden]) {
      display: none;
    }
    form {
      display: grid;
      gap: 16px;
    }
    p {
      margin: 0;
    }
    .destructive {
      --md-sys-color-primary: var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
      --md-sys-color-on-primary: var(--md-sys-color-on-error, light-dark(#ffffff, #601410));
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `;

  /** The question, e.g. "Delete project web?". */
  @property() headline = "";

  /** Supporting text under the headline. */
  @property() message = "";

  /** The confirm button's label. Default: "Confirm", translated. */
  @property({ attribute: "confirm-label" }) confirmLabel?: string;

  /** The cancel button's label. Default: "Cancel", translated. */
  @property({ attribute: "cancel-label" }) cancelLabel?: string;

  /** Paint the confirm button in the error colour. */
  @property({ type: Boolean }) destructive = false;

  /** Text the visitor must type before confirming (empty: no field). */
  @property({ attribute: "require-text" }) requireText = "";

  /** Whether the dialog is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** `"confirm"` or `"cancel"` once closed. */
  @state() returnValue = "";

  @state() private typed = "";

  @query("lit-material-dialog") private readonly dialog?: LitMaterialDialog;

  private resolve?: (confirmed: boolean) => void;

  private readonly localize = new LocalizeController(this);

  private get textMatches(): boolean {
    return this.requireText === "" || this.typed === this.requireText;
  }

  /** Opens the dialog; resolves `true` on confirm, `false` otherwise. */
  show(): Promise<boolean> {
    this.resolve?.(false);
    this.typed = "";
    this.returnValue = "";
    this.open = true;
    return new Promise((resolve) => (this.resolve = resolve));
  }

  /** Closes it as if the visitor picked `confirmed`. */
  close(confirmed = false): void {
    this.returnValue = confirmed ? "confirm" : "cancel";
    this.open = false;
  }

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (!changed.has("open")) return;
    if (this.open) {
      await this.dialog?.updateComplete;
      // The safe choice gets focus, so a stray Enter doesn't confirm; with a
      // type-to-confirm field, the field does.
      const target = this.renderRoot.querySelector<HTMLElement>(this.requireText ? "lit-material-text-field" : ".cancel");
      target?.focus();
    }
  }

  private readonly onSubmit = (event: Event): void => {
    event.preventDefault();
    if (this.textMatches) this.close(true);
  };

  private readonly onDialogClose = (event: Event): void => {
    // Ours replaces the inner dialog's.
    event.stopPropagation();
    if (!this.returnValue) this.returnValue = "cancel";
    this.open = false;
    const resolve = this.resolve;
    this.resolve = undefined;
    resolve?.(this.returnValue === "confirm");
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  };

  override render() {
    return html`
      <lit-material-dialog .open=${this.open} @close=${this.onDialogClose} @cancel=${(e: Event) => e.stopPropagation()}>
        <span slot="headline">${this.headline}</span>
        <form @submit=${this.onSubmit}>
          <slot>${this.message ? html`<p>${this.message}</p>` : nothing}</slot>
          ${this.requireText
            ? html`<lit-material-text-field
                variant="outlined"
                label=${this.localize.term("confirm.typeToConfirm", "Type {text} to confirm", { text: this.requireText })}
                autocomplete="off"
                .value=${this.typed}
                @input=${(e: Event) => (this.typed = (e.target as HTMLInputElement).value)}
              ></lit-material-text-field>`
            : nothing}
          <div class="actions">
            <lit-material-button class="cancel" variant="text" @click=${() => this.close(false)}>${this.cancelLabel ?? this.localize.term("confirm.cancel", "Cancel")}</lit-material-button>
            <lit-material-button class=${this.destructive ? "confirm destructive" : "confirm"} type="submit" ?disabled=${!this.textMatches}
              >${this.confirmLabel ?? this.localize.term("confirm.confirm", "Confirm")}</lit-material-button
            >
          </div>
        </form>
      </lit-material-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-confirm-dialog": LitMaterialConfirmDialog;
  }
}
