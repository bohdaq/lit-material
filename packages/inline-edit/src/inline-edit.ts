import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "@lit-material/icon-button";
import "@lit-material/text-field/text-field.js";
import { LocalizeController } from "@lit-material/core/localize.js";

// Material icons edit, check, close (Apache 2.0).
const svg = (d: string) => html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d=${d}></path></svg>`;
const editIcon = svg(
  "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
);
const saveIcon = svg("M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z");
const cancelIcon = svg("M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");

/** Saves `value`; resolve to finish, or return/throw a message to stay editing and show it. */
export type InlineEditSave = (value: string) => void | string | Promise<void | string>;

/**
 * A value you can edit where it stands: a resource's name, a label, a
 * description. It reads as text with an edit button; the button (or a
 * double-click on the text) swaps in a field with save and cancel. Enter
 * saves, Escape cancels, and focus returns to the edit button.
 *
 * Saving: set `save` to a function that stores the value (e.g. a PATCH). It
 * may return a promise; while it runs the field is busy. Throw, or return a
 * message, and the field stays open with that message as its error. Without
 * `save`, the new value is taken at once. Either way a `change` event
 * follows a successful save, with `detail: { value, previous }`.
 *
 * `validator` checks the text before saving (return a message to refuse).
 *
 * @element lit-material-inline-edit
 *
 * @fires change - After a save; `detail: { value, previous }`.
 * @fires cancel - When an edit is abandoned.
 *
 * @csspart value - The text shown when not editing.
 */
@customElement("lit-material-inline-edit")
export class LitMaterialInlineEdit extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      max-width: 100%;
      min-width: 0;
    }
    :host([hidden]) {
      display: none;
    }
    .value {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .placeholder {
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      font-style: italic;
    }
    form {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }
    lit-material-text-field {
      flex: 1;
      min-width: 0;
      --lit-material-text-field-min-width: var(--lit-material-inline-edit-min-width, 12ch);
    }
    lit-material-icon-button.action {
      margin-block-start: 8px;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  `;

  /** The current value. */
  @property() value = "";

  /** What the value is, e.g. "Project name": labels the field and the buttons. */
  @property() label = "";

  /** Shown when the value is empty. */
  @property() placeholder = "";

  /** Stores the new value; see the class docs. */
  @property({ attribute: false }) save?: InlineEditSave;

  /** Checks the text before saving; returns a message to refuse it. */
  @property({ attribute: false }) validator?: (value: string) => string;

  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Whether the field is open; reflected. */
  @property({ type: Boolean, reflect: true }) editing = false;

  /** Set while `save` runs; reflected. */
  @property({ type: Boolean, reflect: true }) busy = false;

  @state() private draft = "";

  @state() private error = "";

  @query("lit-material-text-field") private readonly field?: HTMLElement;

  @query(".edit") private readonly editButton?: HTMLElement;

  private readonly localize = new LocalizeController(this);

  /** Opens the field with the current value selected. */
  async edit(): Promise<void> {
    if (this.disabled || this.editing) return;
    this.draft = this.value;
    this.error = "";
    this.editing = true;
    await this.updateComplete;
    const field = this.field as (HTMLElement & { updateComplete?: Promise<unknown> }) | undefined;
    await field?.updateComplete;
    field?.focus();
    field?.shadowRoot?.querySelector("input")?.select();
  }

  /** Closes the field without saving. */
  async cancel(): Promise<void> {
    if (!this.editing || this.busy) return;
    this.editing = false;
    this.dispatchEvent(new Event("cancel", { bubbles: true, composed: true }));
    await this.restoreFocus();
  }

  /** Saves the field's text; resolves `true` when it was taken. */
  async commit(): Promise<boolean> {
    if (!this.editing || this.busy) return false;
    const value = this.draft;
    const refused = this.validator?.(value) ?? "";
    if (refused) {
      this.error = refused;
      return false;
    }
    if (value === this.value) {
      this.editing = false;
      await this.restoreFocus();
      return true;
    }
    if (this.save) {
      this.busy = true;
      try {
        const message = await this.save(value);
        if (typeof message === "string" && message) {
          this.error = message;
          return false;
        }
      } catch (e) {
        this.error = e instanceof Error ? e.message : String(e);
        return false;
      } finally {
        this.busy = false;
      }
    }
    const previous = this.value;
    this.value = value;
    this.editing = false;
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { value, previous } }));
    await this.restoreFocus();
    return true;
  }

  private async restoreFocus(): Promise<void> {
    await this.updateComplete;
    this.editButton?.focus();
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      void this.cancel();
    }
  }

  override render() {
    const t = this.localize;
    const label = this.label;
    const editLabel = label
      ? t.term("inlineEdit.editNamed", "Edit {name}", { name: label })
      : t.term("inlineEdit.edit", "Edit value");
    if (!this.editing) {
      return html`<span
          part="value"
          class=${this.value ? "value" : "value placeholder"}
          @dblclick=${() => void this.edit()}
          >${this.value || this.placeholder}</span
        ><lit-material-icon-button
          class="edit"
          aria-label=${editLabel}
          ?disabled=${this.disabled}
          @click=${() => void this.edit()}
          ><span slot="icon">${editIcon}</span></lit-material-icon-button
        >`;
    }
    const saveLabel = label
      ? t.term("inlineEdit.saveNamed", "Save {name}", { name: label })
      : t.term("inlineEdit.save", "Save value");
    const cancelLabel = label
      ? t.term("inlineEdit.cancelNamed", "Cancel editing {name}", { name: label })
      : t.term("inlineEdit.cancel", "Cancel editing value");
    return html`<form
      @submit=${(e: Event) => {
        e.preventDefault();
        void this.commit();
      }}
      @keydown=${this.onKeyDown}
    >
      <lit-material-text-field
        variant="outlined"
        label=${this.label || nothing}
        aria-label=${label ? nothing : t.term("inlineEdit.value", "value")}
        .value=${this.draft}
        error-text=${this.error}
        ?error=${Boolean(this.error)}
        ?disabled=${this.busy}
        @input=${(e: Event) => {
          this.draft = (e.target as HTMLInputElement).value;
          this.error = "";
        }}
        @change=${(e: Event) => e.stopPropagation()}
      ></lit-material-text-field>
      <lit-material-icon-button class="action" aria-label=${saveLabel} ?disabled=${this.busy} @click=${() => void this.commit()}
        ><span slot="icon">${saveIcon}</span></lit-material-icon-button
      >
      <lit-material-icon-button class="action" aria-label=${cancelLabel} ?disabled=${this.busy} @click=${() => void this.cancel()}
        ><span slot="icon">${cancelIcon}</span></lit-material-icon-button
      >
    </form>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-inline-edit": LitMaterialInlineEdit;
  }
}
