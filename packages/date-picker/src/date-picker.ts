import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  type CalendarDate,
  addDays,
  addMonths,
  compareDate,
  daysInMonth,
  firstWeekdayOffset,
  formatISODate,
  fullDateLabel,
  headlineDateLabel,
  isInRange,
  isMonthFullyOutOfRange,
  monthYearLabel,
  parseISODate,
  today,
  weekdayLabels,
} from "./date-utils.js";
import { styles } from "./date-picker-styles.js";

type PickerMode = "calendar" | "year";
export type DatePickerVariant = "modal" | "docked";

/**
 * Material Design 3 date picker — a single-date calendar, either `modal`
 * (the default: a dialog built on the native `<dialog>` element, like
 * `lit-material-dialog` — scrim, Escape-to-close, focus trap all come from
 * the browser) or `docked` (the same header/calendar/actions, rendered
 * plainly in-flow with no dialog, scrim, or `open`/`show()`/`close()`
 * gating — meant to be embedded in your own layout, a card, or a popover you
 * position yourself, the same way `lit-material-navigation-drawer`'s
 * `standard` variant is the same content as `modal` minus the dialog shell).
 *
 * Tapping a day highlights it immediately but doesn't commit it — the same
 * two-step "pick, then confirm" flow the MD3 spec calls for. `change` only
 * fires once "OK" is clicked; "Cancel" (or, for `modal`, Escape or a
 * backdrop click) discards the in-progress selection and leaves `value`
 * untouched — for `docked`, "Cancel" resets the visible calendar back to
 * `value` right away, since there's no dialog to hide the discarded pick
 * behind.
 *
 * Deliberately out of scope for this first pass: the manual keyboard-entry
 * text field mode MD3 lets you toggle to (calendar-only here), and date
 * *range* selection — both reasonable follow-ups, not silently missing.
 * Values are ISO `"YYYY-MM-DD"` strings, parsed and formatted with plain
 * year/month/day arithmetic rather than `new Date(isoString)` — the latter
 * parses as UTC and is a classic source of off-by-one-day bugs in
 * negative-UTC-offset timezones.
 *
 * @element lit-material-date-picker
 *
 * @csspart dialog - The native `<dialog>` element. Only rendered for `modal`.
 * @csspart container - The visible card.
 * @csspart header - The label + selected-date headline.
 * @csspart nav - The month navigation row (or the year-range label, in year mode).
 * @csspart calendar - The `<table role="grid">` of day cells.
 * @csspart year-grid - The scrollable grid of years, in year mode.
 * @csspart actions - The Cancel/OK row.
 *
 * @fires change - Fires when a date is confirmed via "OK" and `value` actually changed.
 * @fires cancel - `modal` only: re-dispatched from the native `cancel` event. Cancelable:
 *   calling `preventDefault()` stops the dialog from closing.
 * @fires close - `modal` only: re-dispatched from the native `close` event, after the dialog
 *   has closed.
 */
@customElement("lit-material-date-picker")
export class LitMaterialDatePicker extends LitElement {
  static override styles = styles;

  @property() variant: DatePickerVariant = "modal";

  /** Whether a `modal` picker is open. Ignored for `docked`, which is always visible in-flow. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** The confirmed date, as an ISO `"YYYY-MM-DD"` string. */
  @property() value?: string;
  /** Inclusive lower bound, as an ISO `"YYYY-MM-DD"` string. */
  @property() min?: string;
  /** Inclusive upper bound, as an ISO `"YYYY-MM-DD"` string. */
  @property() max?: string;
  @property() label = "Select date";
  /** 0 = Sunday (default), 1 = Monday, ... */
  @property({ type: Number, attribute: "first-day-of-week" }) firstDayOfWeek = 0;

  @state() private mode: PickerMode = "calendar";
  @state() private viewYear: number;
  @state() private viewMonth: number;
  @state() private pendingValue?: string;
  @state() private focusedDate: CalendarDate;

  @query("dialog") private readonly dialogElement?: HTMLDialogElement;
  private reopenOnClose = false;
  private hasInitializedFromValue = false;

  constructor() {
    super();
    // Placeholder defaults only — attribute-derived initial property values
    // (e.g. value="2026-06-15") aren't applied until after the constructor
    // runs, so the real sync to `value` happens in willUpdate() below.
    const now = today();
    this.viewYear = now.year;
    this.viewMonth = now.month;
    this.focusedDate = now;
  }

  private get minDate(): CalendarDate | undefined {
    return this.min ? parseISODate(this.min) : undefined;
  }

  private get maxDate(): CalendarDate | undefined {
    return this.max ? parseISODate(this.max) : undefined;
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    // Sync the view/pending selection from `value` on first render —
    // including SSR, which willUpdate() runs during but connectedCallback()
    // and updated() do not usefully affect — and again whenever `value`
    // changes externally while closed (a controlled-component pattern).
    // Skipped while `open`, so an in-progress pick isn't yanked out from
    // under the user; show() handles resetting state for a fresh open.
    if (this.hasInitializedFromValue && (!changed.has("value") || this.open)) return;
    this.hasInitializedFromValue = true;
    const initial = (this.value && parseISODate(this.value)) || today();
    this.pendingValue = this.value;
    this.viewYear = initial.year;
    this.viewMonth = initial.month;
    this.focusedDate = initial;
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open") || this.variant !== "modal" || !this.dialogElement) return;
    if (this.open && !this.dialogElement.open) {
      this.dialogElement.showModal();
    } else if (!this.open && this.dialogElement.open) {
      this.dialogElement.close();
    }
  }

  /** Resets the pending selection, view, and mode back to `value` (or today). */
  private resetPendingToValue(): void {
    const initial = (this.value && parseISODate(this.value)) || today();
    this.pendingValue = this.value;
    this.viewYear = initial.year;
    this.viewMonth = initial.month;
    this.mode = "calendar";
    this.focusedDate = initial;
  }

  /**
   * Resets the view to `value` (or today) and, for `modal`, opens the picker
   * (equivalent to resetting state then setting `.open = true`). For
   * `docked`, which is always visible, only the reset happens — useful to
   * call after reassigning `value` to also snap the visible calendar to it.
   */
  show(): void {
    this.resetPendingToValue();
    this.open = true;
  }

  /** Closes a `modal` picker without confirming a selection. Equivalent to setting `.open = false`. No visible effect for `docked`. */
  close(returnValue?: string): void {
    this.open = false;
    if (returnValue !== undefined && this.dialogElement) {
      this.dialogElement.returnValue = returnValue;
    }
  }

  private nextEnabledFrom(candidate: CalendarDate, direction: 1 | -1): CalendarDate {
    let next = candidate;
    let guard = 0;
    while (!isInRange(next, this.minDate, this.maxDate) && guard < 2000) {
      next = addDays(next, direction);
      guard++;
    }
    return next;
  }

  private focusDate(date: CalendarDate): void {
    this.focusedDate = date;
    if (date.year !== this.viewYear || date.month !== this.viewMonth) {
      this.viewYear = date.year;
      this.viewMonth = date.month;
    }
    const iso = formatISODate(date);
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLButtonElement>(`.day[data-iso="${iso}"]`)?.focus();
    });
  }

  private isPrevMonthDisabled(): boolean {
    const prev = addMonths({ year: this.viewYear, month: this.viewMonth, day: 1 }, -1);
    return isMonthFullyOutOfRange(prev.year, prev.month, this.minDate, this.maxDate);
  }

  private isNextMonthDisabled(): boolean {
    const next = addMonths({ year: this.viewYear, month: this.viewMonth, day: 1 }, 1);
    return isMonthFullyOutOfRange(next.year, next.month, this.minDate, this.maxDate);
  }

  private isYearDisabled(year: number): boolean {
    if (this.minDate && year < this.minDate.year) return true;
    if (this.maxDate && year > this.maxDate.year) return true;
    return false;
  }

  private getYearRange(): number[] {
    const start = this.minDate?.year ?? this.viewYear - 100;
    const end = this.maxDate?.year ?? this.viewYear + 25;
    const years: number[] = [];
    for (let y = start; y <= end; y++) years.push(y);
    return years;
  }

  private getGridCells(): (CalendarDate | null)[] {
    const offset = firstWeekdayOffset(this.viewYear, this.viewMonth, this.firstDayOfWeek);
    const total = daysInMonth(this.viewYear, this.viewMonth);
    const cells: (CalendarDate | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let day = 1; day <= total; day++) cells.push({ year: this.viewYear, month: this.viewMonth, day });
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  override render() {
    const container = this.renderContainer();
    if (this.variant !== "modal") return container;

    return html`
      <dialog
        class="dialog"
        part="dialog"
        aria-labelledby="headline"
        @close=${this.handleClose}
        @cancel=${this.handleCancel}
        @click=${this.handleBackdropClick}
      >
        ${container}
      </dialog>
    `;
  }

  private renderContainer() {
    // For `modal`, showModal() auto-focuses the first focusable descendant
    // when nothing has autofocus — without this, that's the Cancel button,
    // showing its focus ring on every open even though the user never
    // interacted with it (same fix as lit-material-dialog's `container`).
    // Harmless to skip for `docked`, since it's never the target of
    // showModal() in the first place (there's no dialog at all).
    const isModal = this.variant === "modal";
    const pending = this.pendingValue ? parseISODate(this.pendingValue) : undefined;
    return html`
      <div class="container" part="container" tabindex=${isModal ? "-1" : nothing} ?autofocus=${isModal}>
        <div class="header" part="header">
          <span class="label" part="label">${this.label}</span>
          <span class="headline" id="headline" part="headline">
            ${pending ? headlineDateLabel(pending) : "Enter date"}
          </span>
        </div>
        ${this.mode === "calendar" ? this.renderCalendar(pending) : this.renderYearGrid()}
        <div class="actions" part="actions">
          <button class="text-button" part="cancel-button" type="button" @click=${this.handleCancelClick}>
            Cancel
          </button>
          <button class="text-button" part="ok-button" type="button" @click=${this.handleOkClick}>OK</button>
        </div>
      </div>
    `;
  }

  private renderCalendar(pending: CalendarDate | undefined) {
    const rows: (CalendarDate | null)[][] = [];
    const cells = this.getGridCells();
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    const todayDate = today();

    return html`
      <div class="nav" part="nav">
        <button
          class="nav-button"
          part="prev-button"
          type="button"
          aria-label="Previous month"
          ?disabled=${this.isPrevMonthDisabled()}
          @click=${this.handlePrevMonth}
        >
          ‹
        </button>
        <button
          class="month-year-button"
          part="month-year-button"
          type="button"
          aria-label="Choose month and year"
          @click=${this.handleToggleYearMode}
        >
          ${monthYearLabel(this.viewYear, this.viewMonth)}
        </button>
        <button
          class="nav-button"
          part="next-button"
          type="button"
          aria-label="Next month"
          ?disabled=${this.isNextMonthDisabled()}
          @click=${this.handleNextMonth}
        >
          ›
        </button>
      </div>
      <table
        class="calendar"
        part="calendar"
        role="grid"
        aria-label=${monthYearLabel(this.viewYear, this.viewMonth)}
        @keydown=${this.handleGridKeydown}
      >
        <thead>
          <tr role="row">
            ${weekdayLabels(this.firstDayOfWeek).map((label) => html`<th scope="col">${label}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${rows.map(
            (row) => html`<tr role="row">${row.map((cell) => this.renderDayCell(cell, pending, todayDate))}</tr>`,
          )}
        </tbody>
      </table>
    `;
  }

  private renderDayCell(cell: CalendarDate | null, pending: CalendarDate | undefined, todayDate: CalendarDate) {
    if (!cell) return html`<td class="day-cell empty" part="day-cell"></td>`;

    const iso = formatISODate(cell);
    const disabled = !isInRange(cell, this.minDate, this.maxDate);
    const selected = !!pending && compareDate(cell, pending) === 0;
    const isToday = compareDate(cell, todayDate) === 0;
    const focused = compareDate(cell, this.focusedDate) === 0;

    return html`
      <td class="day-cell" part="day-cell" role="gridcell" aria-selected=${selected ? "true" : "false"}>
        <button
          class="day ${selected ? "selected" : ""} ${isToday ? "today" : ""}"
          part="day"
          type="button"
          data-iso=${iso}
          tabindex=${focused ? "0" : "-1"}
          ?disabled=${disabled}
          aria-label=${fullDateLabel(cell)}
          @click=${() => this.handleSelectDay(cell)}
        >
          ${cell.day}
        </button>
      </td>
    `;
  }

  private renderYearGrid() {
    const years = this.getYearRange();
    return html`
      <div class="nav" part="nav">
        <span class="year-range-label">${years[0]}–${years[years.length - 1]}</span>
      </div>
      <div class="year-grid" part="year-grid" role="listbox" aria-label="Year">
        ${years.map(
          (year) => html`
            <button
              class="year ${year === this.viewYear ? "selected" : ""}"
              part="year"
              type="button"
              role="option"
              aria-selected=${year === this.viewYear ? "true" : "false"}
              ?disabled=${this.isYearDisabled(year)}
              @click=${() => this.handleSelectYear(year)}
            >
              ${year}
            </button>
          `,
        )}
      </div>
    `;
  }

  private readonly handleToggleYearMode = (): void => {
    this.mode = this.mode === "calendar" ? "year" : "calendar";
  };

  private readonly handleSelectYear = (year: number): void => {
    this.viewYear = year;
    this.mode = "calendar";
  };

  private readonly handlePrevMonth = (): void => {
    const prev = addMonths({ year: this.viewYear, month: this.viewMonth, day: 1 }, -1);
    this.viewYear = prev.year;
    this.viewMonth = prev.month;
    this.focusedDate = prev;
  };

  private readonly handleNextMonth = (): void => {
    const next = addMonths({ year: this.viewYear, month: this.viewMonth, day: 1 }, 1);
    this.viewYear = next.year;
    this.viewMonth = next.month;
    this.focusedDate = next;
  };

  private readonly handleSelectDay = (date: CalendarDate): void => {
    this.pendingValue = formatISODate(date);
    this.focusedDate = date;
  };

  private readonly handleGridKeydown = (event: KeyboardEvent): void => {
    let step: number | undefined;
    if (event.key === "ArrowLeft") step = -1;
    else if (event.key === "ArrowRight") step = 1;
    else if (event.key === "ArrowUp") step = -7;
    else if (event.key === "ArrowDown") step = 7;

    if (step !== undefined) {
      event.preventDefault();
      const direction = step > 0 ? 1 : -1;
      this.focusDate(this.nextEnabledFrom(addDays(this.focusedDate, step), direction));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      this.focusDate(this.nextEnabledFrom({ year: this.viewYear, month: this.viewMonth, day: 1 }, 1));
    } else if (event.key === "End") {
      event.preventDefault();
      const lastDay = daysInMonth(this.viewYear, this.viewMonth);
      this.focusDate(this.nextEnabledFrom({ year: this.viewYear, month: this.viewMonth, day: lastDay }, -1));
    }
  };

  private readonly handleCancelClick = (): void => {
    if (this.variant !== "modal") {
      // No dialog to hide the discarded pick behind — visibly snap the
      // calendar back to `value` instead.
      this.resetPendingToValue();
      return;
    }
    this.close("cancel");
  };

  private readonly handleOkClick = (): void => {
    if (this.pendingValue) {
      const changed = this.pendingValue !== this.value;
      this.value = this.pendingValue;
      if (changed) this.dispatchEvent(new Event("change", { bubbles: true }));
    }
    this.close("ok");
  };

  private handleClose(): void {
    if (this.reopenOnClose) {
      // Some browsers don't honor preventDefault() on the native `cancel`
      // event despite documenting it as cancelable — see lit-material-dialog
      // for the same workaround.
      this.reopenOnClose = false;
      this.dialogElement?.showModal();
      return;
    }
    this.open = false;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  }

  private handleCancel(event: Event): void {
    const proceed = this.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true, composed: true }));
    if (!proceed) {
      event.preventDefault();
      this.reopenOnClose = true;
    }
  }

  private handleBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogElement) {
      this.dialogElement?.close();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-date-picker": LitMaterialDatePicker;
  }
}
