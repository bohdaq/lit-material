import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import { cssProps } from "@lit-material/core/css-props.js";

let instanceCount = 0;

const checkIcon = html`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>`;
const chevronIcon = html`<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z" /></svg>`;
const closeIcon = html`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z" /></svg>`;

/**
 * One task in a `lit-material-checklist`: a label, and under it what to do
 * (text, a command to copy, a button). Its content shows while it's the next
 * task to do, or when the reader opens it.
 *
 * `done` is yours to set from real state (the first workspace exists, a
 * teammate joined): the checklist never ticks a task itself.
 *
 * @element lit-material-checklist-item
 *
 * @slot - What to do: text, a copyable command, a button.
 *
 * @csspart item - The row.
 * @csspart toggle - The button with the mark and the label.
 * @csspart content - The slotted content's box.
 */
@customElement("lit-material-checklist-item")
export class LitMaterialChecklistItem extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
    .item {
      border-top: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    }
    button {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      outline-offset: 2px;
      border-radius: 4px;
    }
    .mark {
      flex: none;
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      box-sizing: border-box;
      border: 2px solid var(--md-sys-color-outline, light-dark(#79747e, #938f99));
      border-radius: 50%;
    }
    :host([done]) .mark {
      border-color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      background: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      color: var(--md-sys-color-on-primary, light-dark(#ffffff, #381e72));
    }
    .mark svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
    .label {
      flex: 1;
      font-size: var(--md-sys-typescale-body-large-size, 1rem);
    }
    :host([done]) .label {
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    .chevron {
      flex: none;
      width: 20px;
      height: 20px;
      fill: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      transition: transform 150ms;
    }
    [aria-expanded="true"] .chevron {
      transform: rotate(180deg);
    }
    @media (prefers-reduced-motion: reduce) {
      .chevron {
        transition: none;
      }
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    .content {
      padding-block: 0 16px;
      padding-inline: 34px 0;
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    .content[hidden] {
      display: none;
    }
  `;

  /** The task, e.g. "Share a workspace". */
  @property() label = "";

  /** The task is done. */
  @property({ type: Boolean, reflect: true }) done = false;

  /** The content shows. Set by the checklist for the next task; the reader toggles it. */
  @property({ type: Boolean, reflect: true }) expanded = false;

  private readonly localize = new LocalizeController(this);
  private readonly contentId = `lit-material-checklist-item-${++instanceCount}`;

  override render() {
    const state = this.done ? this.localize.term("checklist.done", "Done") : this.localize.term("checklist.toDo", "To do");
    return html`
      <div class="item" part="item">
        <button
          part="toggle"
          aria-expanded=${this.expanded ? "true" : "false"}
          aria-controls=${this.contentId}
          @click=${this.toggle}
        >
          <span class="mark">${this.done ? checkIcon : nothing}</span>
          <span class="label">${this.label}<span class="visually-hidden">, ${state}</span></span>
          ${chevronIcon}
        </button>
        <div class="content" part="content" id=${this.contentId} ?hidden=${!this.expanded}><slot></slot></div>
      </div>
    `;
  }

  private toggle(): void {
    this.expanded = !this.expanded;
    this.dispatchEvent(new Event("lit-material-checklist-toggle", { bubbles: true, composed: true }));
  }
}

/**
 * A getting-started checklist: a heading, "2 of 4 done" with a progress bar,
 * and the tasks. The next task to do is open; the others open on a click.
 * Optionally dismissible, and remembered as dismissed per browser with
 * `storage-key`.
 *
 * @element lit-material-checklist
 *
 * @slot - `lit-material-checklist-item` elements.
 * @slot complete - Shown in place of the progress line once every task is done.
 *
 * @csspart card - The outer box.
 * @csspart progress - The progress bar.
 * @csspart dismiss - The dismiss button.
 *
 * @fires dismiss - The reader dismissed the checklist (it hides itself).
 */
@customElement("lit-material-checklist")
export class LitMaterialChecklist extends LitElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    }
    :host([hidden]) {
      display: none;
    }
    .card {
      padding: 20px 24px 8px;
      border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
      border-radius: var(--md-sys-shape-corner-large, 16px);
      background: var(--md-sys-color-surface-container-low, light-dark(#f7f2fa, #1d1b20));
    }
    .head {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .titles {
      flex: 1;
      min-width: 0;
    }
    h2 {
      margin: 0;
      font-size: var(--md-sys-typescale-title-medium-size, 1rem);
      font-weight: var(--md-sys-typescale-title-medium-weight, 500);
    }
    .count {
      margin: 4px 0 0;
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    .bar {
      height: 4px;
      margin: 12px 0 16px;
      border-radius: 2px;
      background: var(--md-sys-color-surface-container-highest, light-dark(#e6e0e9, #36343b));
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      transition: width 250ms;
    }
    @media (prefers-reduced-motion: reduce) {
      .fill {
        transition: none;
      }
    }
    .dismiss {
      flex: none;
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      margin: -6px -8px 0 0;
      border: 0;
      border-radius: 50%;
      background: none;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      cursor: pointer;
    }
    .dismiss:hover {
      background: color-mix(in srgb, currentColor 8%, transparent);
    }
    .dismiss:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    }
    .dismiss svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
  `;

  /** The heading, e.g. "Get started". */
  @property() heading = "";

  /** Show a dismiss button. */
  @property({ type: Boolean }) dismissible = false;

  /** Remember a dismissal in this browser under this key (localStorage), and stay hidden on later visits. */
  @property({ attribute: "storage-key" }) storageKey = "";

  @state() private total = 0;
  @state() private doneCount = 0;

  private readonly localize = new LocalizeController(this);
  private readonly headingId = `lit-material-checklist-heading-${++instanceCount}`;
  private observer?: MutationObserver;
  /** Items the reader opened or closed themselves: the checklist leaves those alone. */
  private readonly touched = new WeakSet<Element>();

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.storageKey && this.readDismissed()) this.hidden = true;
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this, { subtree: true, attributes: true, attributeFilter: ["done"], childList: true });
    this.addEventListener("lit-material-checklist-toggle", this.handleToggle);
    this.sync();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.removeEventListener("lit-material-checklist-toggle", this.handleToggle);
  }

  private get items(): LitMaterialChecklistItem[] {
    return [...this.querySelectorAll<LitMaterialChecklistItem>(":scope > lit-material-checklist-item")];
  }

  private readonly handleToggle = (event: Event): void => {
    this.touched.add(event.target as Element);
  };

  /** Counts the tasks and opens the next one to do (unless the reader chose otherwise). */
  private sync(): void {
    const items = this.items;
    this.total = items.length;
    this.doneCount = items.filter((item) => item.hasAttribute("done")).length;
    const next = items.find((item) => !item.hasAttribute("done"));
    for (const item of items) {
      if (this.touched.has(item)) continue;
      item.expanded = item === next;
    }
  }

  private readDismissed(): boolean {
    try {
      return localStorage.getItem(this.storageKey) === "dismissed";
    } catch {
      return false;
    }
  }

  /** Hides the checklist (and remembers it with `storage-key`). */
  dismiss(): void {
    this.hidden = true;
    if (this.storageKey) {
      try {
        localStorage.setItem(this.storageKey, "dismissed");
      } catch {
        // Storage refused (private mode): hidden for this visit only.
      }
    }
    this.dispatchEvent(new Event("dismiss", { bubbles: true, composed: true }));
  }

  override render() {
    const complete = this.total > 0 && this.doneCount === this.total;
    const progress = this.localize.term("checklist.progress", "{done} of {total} done", { done: this.doneCount, total: this.total });
    const percent = this.total ? Math.round((this.doneCount / this.total) * 100) : 0;
    return html`
      <section class="card" part="card" aria-labelledby=${this.heading ? this.headingId : nothing}>
        <div class="head">
          <div class="titles">
            ${this.heading ? html`<h2 id=${this.headingId}>${this.heading}</h2>` : nothing}
            <p class="count" aria-live="polite">${complete ? html`<slot name="complete">${progress}</slot>` : progress}</p>
          </div>
          ${this.dismissible
            ? html`<button class="dismiss" part="dismiss" aria-label=${this.localize.term("checklist.dismiss", "Dismiss")} @click=${() => this.dismiss()}>
                ${closeIcon}
              </button>`
            : nothing}
        </div>
        <div
          class="bar"
          part="progress"
          role="progressbar"
          aria-label=${progress}
          aria-valuemin="0"
          aria-valuemax=${this.total}
          aria-valuenow=${this.doneCount}
        >
          <div class="fill" style=${cssProps({ width: `${percent}%` })}></div>
        </div>
        <slot @slotchange=${() => this.sync()}></slot>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-checklist": LitMaterialChecklist;
    "lit-material-checklist-item": LitMaterialChecklistItem;
  }
}
