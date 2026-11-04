import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "@lit-material/icon-button";
import "@lit-material/text-field/text-field.js";
import { LocalizeController } from "@lit-material/core/localize.js";

export interface DualListItem {
  value: string;
  label: string;
  /** Can't be moved either way. */
  disabled?: boolean;
}

type Side = "available" | "chosen";

// Material icons chevron_right, chevron_left, keyboard_double_arrow_right/left (Apache 2.0).
const svg = (d: string) => html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d=${d}></path></svg>`;
const addIcon = svg("M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z");
const removeIcon = svg("M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z");
const addAllIcon = svg("M6.41 6 5 7.41 9.58 12 5 16.59 6.41 18l6-6zm6.59 0-1.41 1.41L16.17 12l-4.58 4.59L13 18l6-6z");
const removeAllIcon = svg("M17.59 18 19 16.59 14.42 12 19 7.41 17.59 6l-6 6zm-6.59 0L12.41 16.59 7.83 12l4.58-4.59L11 6l-6 6z");

let nextId = 0;

/**
 * Picks a subset of a list by moving items between "Available" and
 * "Chosen": project members, permissions, scopes, regions. `items` lists
 * everything; `selected` holds the chosen values.
 *
 * Mark items with a click (Ctrl/⌘-click adds to the marks, Shift-click
 * marks a range) and move them with the arrow buttons, or double-click an
 * item to move just it. Each list is a multi-select listbox: ↑/↓ move,
 * Space marks, Shift+↑/↓ extends the marks, Ctrl+A marks everything shown,
 * Enter moves the marked items, Home/End jump. `filterable` adds a filter
 * field above each list; "move all" moves only what the filter shows.
 *
 * @element lit-material-dual-list-selector
 *
 * @fires change - After a move; `detail: { selected }`.
 *
 * @csspart pane - Each side (header, filter, list).
 * @csspart list - Each listbox.
 * @csspart option - Each item.
 *
 * @cssprop --lit-material-dual-list-height - Height of each list (default `16rem`).
 */
@customElement("lit-material-dual-list-selector")
export class LitMaterialDualListSelector extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: stretch;
      gap: 8px;
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
      font-family: var(--md-sys-typescale-body-large-font, Roboto, system-ui, sans-serif);
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    }
    :host([hidden]) {
      display: none;
    }
    .pane {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-weight: 500;
    }
    .count {
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      font-weight: 400;
      font-variant-numeric: tabular-nums;
    }
    lit-material-text-field {
      --lit-material-text-field-min-width: 0;
    }
    .list {
      box-sizing: border-box;
      height: var(--lit-material-dual-list-height, 16rem);
      margin: 0;
      padding: 4px 0;
      overflow-y: auto;
      list-style: none;
      border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
      border-radius: var(--md-sys-shape-corner-small, 8px);
      outline: none;
    }
    .list:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      outline-offset: 2px;
    }
    .option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      cursor: pointer;
      user-select: none;
    }
    .option:hover {
      background: color-mix(in srgb, currentColor 8%, transparent);
    }
    .option[aria-selected="true"] {
      background: var(--md-sys-color-secondary-container, light-dark(#e8def8, #4a4458));
      color: var(--md-sys-color-on-secondary-container, light-dark(#1d192b, #e8def8));
    }
    .option.active {
      box-shadow: inset 2px 0 0 var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    }
    .option[aria-disabled="true"] {
      opacity: 0.38;
      cursor: default;
    }
    .mark {
      flex: none;
      width: 16px;
      height: 16px;
      box-sizing: border-box;
      border: 2px solid currentColor;
      border-radius: 2px;
      opacity: 0.6;
    }
    .option[aria-selected="true"] .mark {
      opacity: 1;
      background: currentColor;
    }
    .empty {
      padding: 6px 12px;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    .controls {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
    /* The chevrons point from one list to the other, and the lists swap sides right to left. */
    :host(:dir(rtl)) .controls svg {
      transform: scaleX(-1);
    }
    @media (max-width: 600px) {
      :host {
        flex-direction: column;
      }
      .controls {
        flex-direction: row;
        justify-content: center;
      }
      .controls svg,
      :host(:dir(rtl)) .controls svg {
        transform: rotate(90deg);
      }
    }
  `;

  /** Every item, in display order. */
  @property({ type: Array }) items: DualListItem[] = [];

  /** The chosen values. */
  @property({ type: Array }) selected: string[] = [];

  /** Heading of the list of items to pick from. Default: "Available", translated. */
  @property({ attribute: "available-label" }) availableLabel?: string;

  /** Heading of the list of picked items. Default: "Chosen", translated. */
  @property({ attribute: "chosen-label" }) chosenLabel?: string;

  /** Adds a filter field above each list. */
  @property({ type: Boolean }) filterable = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private marks: Record<Side, Set<string>> = { available: new Set(), chosen: new Set() };

  @state() private active: Record<Side, string | null> = { available: null, chosen: null };

  @state() private filters: Record<Side, string> = { available: "", chosen: "" };

  /** Where Shift-selection extends from, per side. */
  private anchor: Record<Side, string | null> = { available: null, chosen: null };

  private readonly uid = `dual-list-${++nextId}`;

  private readonly localize = new LocalizeController(this);

  private label(side: Side): string {
    return side === "available"
      ? (this.availableLabel ?? this.localize.term("dualList.available", "Available"))
      : (this.chosenLabel ?? this.localize.term("dualList.chosen", "Chosen"));
  }

  /** A list's label inside a sentence ("Move marked to chosen"). */
  private lowerLabel(side: Side): string {
    const label = this.label(side);
    try {
      return label.toLocaleLowerCase(this.localize.lang);
    } catch {
      return label.toLowerCase();
    }
  }

  private visible(side: Side): DualListItem[] {
    const chosen = new Set(this.selected);
    const filter = this.filters[side].trim().toLowerCase();
    return this.items.filter(
      (item) => chosen.has(item.value) === (side === "chosen") && (!filter || item.label.toLowerCase().includes(filter)),
    );
  }

  private movable(side: Side, values: Iterable<string>): string[] {
    const shown = new Map(this.visible(side).map((item) => [item.value, item]));
    return [...values].filter((v) => shown.has(v) && !shown.get(v)!.disabled);
  }

  /** Moves `values` from `side` to the other list. */
  move(side: Side, values: Iterable<string>): void {
    const moving = this.movable(side, values);
    if (moving.length === 0 || this.disabled) return;
    const set = new Set(this.selected);
    for (const v of moving) {
      if (side === "available") set.add(v);
      else set.delete(v);
    }
    // Keep `items` order.
    this.selected = this.items.filter((item) => set.has(item.value)).map((item) => item.value);
    this.marks = { ...this.marks, [side]: new Set() };
    const rest = this.visible(side);
    this.active = { ...this.active, [side]: rest[0]?.value ?? null };
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { selected: this.selected } }));
  }

  private setMarks(side: Side, marks: Set<string>, active: string | null): void {
    this.marks = { ...this.marks, [side]: marks };
    this.active = { ...this.active, [side]: active };
  }

  private range(side: Side, from: string | null, to: string): Set<string> {
    const values = this.visible(side).filter((i) => !i.disabled).map((i) => i.value);
    const a = from === null ? -1 : values.indexOf(from);
    const b = values.indexOf(to);
    if (a < 0 || b < 0) return new Set([to]);
    return new Set(values.slice(Math.min(a, b), Math.max(a, b) + 1));
  }

  private onOptionClick(side: Side, item: DualListItem, event: MouseEvent): void {
    if (item.disabled || this.disabled) return;
    let marks: Set<string>;
    if (event.shiftKey) {
      marks = this.range(side, this.anchor[side], item.value);
    } else {
      marks = new Set(event.ctrlKey || event.metaKey ? this.marks[side] : []);
      if (marks.has(item.value) && (event.ctrlKey || event.metaKey)) marks.delete(item.value);
      else marks.add(item.value);
      this.anchor[side] = item.value;
    }
    this.setMarks(side, marks, item.value);
    this.renderRoot.querySelector<HTMLElement>(`#${this.uid}-${side}`)?.focus();
  }

  private onKeyDown(side: Side, event: KeyboardEvent): void {
    if (this.disabled) return;
    const items = this.visible(side);
    if (items.length === 0) return;
    const index = Math.max(0, items.findIndex((i) => i.value === this.active[side]));
    const go = (to: number) => {
      const target = items[Math.min(items.length - 1, Math.max(0, to))]!;
      if (event.shiftKey) {
        this.setMarks(side, this.range(side, this.anchor[side] ?? this.active[side], target.value), target.value);
      } else {
        this.active = { ...this.active, [side]: target.value };
      }
      this.updateComplete.then(() =>
        this.renderRoot.querySelector(`[data-value="${CSS.escape(target.value)}"][data-side="${side}"]`)?.scrollIntoView({ block: "nearest" }),
      );
    };
    switch (event.key) {
      case "ArrowDown":
        go(this.active[side] === null ? 0 : index + 1);
        break;
      case "ArrowUp":
        go(index - 1);
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(items.length - 1);
        break;
      case " ": {
        const value = this.active[side] ?? items[0]!.value;
        const item = items.find((i) => i.value === value);
        if (!item || item.disabled) break;
        const marks = new Set(this.marks[side]);
        if (marks.has(value)) marks.delete(value);
        else marks.add(value);
        this.anchor[side] = value;
        this.setMarks(side, marks, value);
        break;
      }
      case "Enter":
        this.move(side, this.marks[side].size ? this.marks[side] : this.active[side] ? [this.active[side]!] : []);
        break;
      case "a":
        if (!(event.ctrlKey || event.metaKey)) return;
        this.setMarks(side, new Set(items.filter((i) => !i.disabled).map((i) => i.value)), this.active[side]);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  private renderPane(side: Side) {
    const label = this.label(side);
    const t = this.localize;
    const items = this.visible(side);
    const total = side === "chosen" ? this.selected.length : this.items.length - this.selected.length;
    const marked = this.marks[side].size;
    const listId = `${this.uid}-${side}`;
    const active = items.some((i) => i.value === this.active[side]) ? this.active[side] : null;
    return html`<div part="pane" class="pane">
      <div class="header">
        <span id="${listId}-label">${label}</span>
        <span class="count" aria-live="polite"
          >${marked ? t.term("dualList.markedCount", "{marked} of {total} marked", { marked, total }) : t.number(total)}</span
        >
      </div>
      ${this.filterable
        ? html`<lit-material-text-field
            variant="outlined"
            label=${t.term("dualList.filter", "Filter {list}", { list: this.lowerLabel(side) })}
            type="search"
            autocomplete="off"
            .value=${this.filters[side]}
            ?disabled=${this.disabled}
            @input=${(e: Event) => (this.filters = { ...this.filters, [side]: (e.target as HTMLInputElement).value })}
          ></lit-material-text-field>`
        : nothing}
      <ul
        part="list"
        class="list"
        id=${listId}
        role="listbox"
        aria-multiselectable="true"
        aria-labelledby="${listId}-label"
        aria-activedescendant=${active ? `${listId}-${this.optionIndex(active)}` : nothing}
        aria-disabled=${this.disabled ? "true" : nothing}
        tabindex=${this.disabled ? "-1" : "0"}
        @keydown=${(e: KeyboardEvent) => this.onKeyDown(side, e)}
        @focus=${() => {
          if (!this.active[side] && items[0]) this.active = { ...this.active, [side]: items[0].value };
        }}
      >
        ${items.length === 0
          ? html`<li class="empty" role="presentation">${this.filters[side]
              ? t.term("dualList.noMatches", "No matches")
              : t.term("dualList.empty", "Nothing here")}</li>`
          : repeat(
              items,
              (item) => item.value,
              (item) => html`<li
                part="option"
                class=${item.value === active ? "option active" : "option"}
                id="${listId}-${this.optionIndex(item.value)}"
                role="option"
                data-side=${side}
                data-value=${item.value}
                aria-selected=${this.marks[side].has(item.value) ? "true" : "false"}
                aria-disabled=${item.disabled ? "true" : nothing}
                @click=${(e: MouseEvent) => this.onOptionClick(side, item, e)}
                @dblclick=${() => !item.disabled && this.move(side, [item.value])}
              >
                <span class="mark" aria-hidden="true"></span>${item.label}
              </li>`,
            )}
      </ul>
    </div>`;
  }

  private optionIndex(value: string): number {
    return this.items.findIndex((i) => i.value === value);
  }

  override render() {
    const movableMarked = (side: Side) => this.movable(side, this.marks[side]).length > 0;
    const movableAll = (side: Side) => this.visible(side).some((i) => !i.disabled);
    const off = this.disabled;
    const t = this.localize;
    const toChosen = this.lowerLabel("chosen");
    const toAvailable = this.lowerLabel("available");
    return html`
      ${this.renderPane("available")}
      <div class="controls" role="group" aria-label=${t.term("dualList.moveItems", "Move items")}>
        <lit-material-icon-button
          aria-label=${t.term("dualList.moveMarked", "Move marked to {list}", { list: toChosen })}
          ?disabled=${off || !movableMarked("available")}
          @click=${() => this.move("available", this.marks.available)}
          ><span slot="icon">${addIcon}</span></lit-material-icon-button
        >
        <lit-material-icon-button
          aria-label=${t.term("dualList.moveAllShown", "Move all shown to {list}", { list: toChosen })}
          ?disabled=${off || !movableAll("available")}
          @click=${() => this.move("available", this.visible("available").map((i) => i.value))}
          ><span slot="icon">${addAllIcon}</span></lit-material-icon-button
        >
        <lit-material-icon-button
          aria-label=${t.term("dualList.moveAllShown", "Move all shown to {list}", { list: toAvailable })}
          ?disabled=${off || !movableAll("chosen")}
          @click=${() => this.move("chosen", this.visible("chosen").map((i) => i.value))}
          ><span slot="icon">${removeAllIcon}</span></lit-material-icon-button
        >
        <lit-material-icon-button
          aria-label=${t.term("dualList.moveMarked", "Move marked to {list}", { list: toAvailable })}
          ?disabled=${off || !movableMarked("chosen")}
          @click=${() => this.move("chosen", this.marks.chosen)}
          ><span slot="icon">${removeIcon}</span></lit-material-icon-button
        >
      </div>
      ${this.renderPane("chosen")}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-dual-list-selector": LitMaterialDualListSelector;
  }
}
