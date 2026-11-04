import { html, isServer, LitElement, nothing, svg, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { cssProps } from "@lit-material/core/css-props.js";
import { LocalizeController, isRtl } from "@lit-material/core/localize.js";
import "@lit-material/segmented-button";
import {
  type CalendarDate,
  type CalendarEvent,
  type NormalizedEvent,
  type TimedSegment,
  DAY_MINUTES,
  MINUTE,
  addDays,
  addMonths,
  coversDay,
  daysBetween,
  formatISODate,
  fromDate,
  lastDay,
  layoutDay,
  layoutSpans,
  localeFirstDayOfWeek,
  minutesInto,
  normalizeEvents,
  parseISODate,
  sameDate,
  startOfWeek,
  toDate,
  today,
} from "./calendar-utils.js";
import { dayNumber, format, range } from "./calendar-format.js";
import { styles } from "./calendar-styles.js";

export type CalendarView = "month" | "week" | "day" | "agenda";
export type { CalendarEvent } from "./calendar-utils.js";

/** `slot-click`: an empty day, all-day cell or time range was activated. `end` is exclusive. */
export interface SlotClickDetail {
  start: Date;
  end: Date;
  allDay: boolean;
}

/** `event-click`: the app's own event object. */
export interface EventClickDetail {
  event: CalendarEvent;
}

/** `event-change`: where the user wants an event to be. `end` is exclusive (midnight after the last day for all-day events). */
export interface EventChangeDetail {
  event: CalendarEvent;
  start: Date;
  end: Date;
  allDay: boolean;
}

/** `navigate`: the view or the period on screen changed. `end` is exclusive. */
export interface NavigateDetail {
  view: CalendarView;
  date: string;
  start: Date;
  end: Date;
}

const VIEWS: CalendarView[] = ["month", "week", "day", "agenda"];

// Material icons chevron_left / chevron_right (Apache 2.0); mirrored in right-to-left layouts by CSS.
const icon = (d: string) => html`<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${d}></path>`}</svg>`;
const previousIcon = icon("M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z");
const nextIcon = icon("M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z");

interface CellInfo {
  date: CalendarDate;
  /** Slot index in the time grid; `-1` for the all-day row; `null` for a month-view day. */
  slot: number | null;
}

interface DragState {
  mode: "move" | "resize" | "create";
  pointerId: number;
  x: number;
  y: number;
  origin: CellInfo;
  event?: NormalizedEvent;
  moved: boolean;
}

interface Selection {
  date: string;
  from: number;
  to: number;
  anchor: number;
}

const closest = (path: EventTarget[], selector: string, stop: Element): HTMLElement | undefined => {
  for (const node of path) {
    if (node === stop) return undefined;
    if (node instanceof HTMLElement && node.matches(selector)) return node;
  }
  return undefined;
};

const shift = (date: Date, days: number, minutes: number): Date => {
  const next = new Date(date.getTime());
  if (days) next.setDate(next.getDate() + days);
  return new Date(next.getTime() + minutes * MINUTE);
};

/**
 * Material Design 3 styled calendar and scheduler: a month grid, week and day time grids, and an agenda
 * list, with a toolbar (previous / today / next, the period's title, and a view switch).
 *
 * Events are controlled: the element never moves an event itself. Dragging, resizing or Alt+arrow keys
 * fire a cancelable `event-change` with the new times; update `events` to accept it.
 *
 * Times are in the browser's (or server's) local time zone. ISO strings without an offset are read as
 * local wall-clock time; date-only strings are local days. `slot-click` and `event-change` hand back
 * local `Date`s.
 *
 * The month view is an ARIA grid of days. The week and day views are one ARIA grid too: a header row of
 * days, an "All day" row, then a row per time slot, each with a time row header. One cell is in the tab
 * order (arrow keys move it); Tab goes on to the events in that cell, each a button named by its title
 * and time.
 *
 * @element lit-material-calendar
 *
 * @fires event-click - `detail: { event }` when an event is clicked or activated with Enter/Space.
 * @fires slot-click - `detail: { start, end, allDay }` when an empty day, all-day cell or time slot is
 *   clicked or activated, or a time range is dragged out (pointer) or extended with Shift+arrows.
 * @fires event-change - Cancelable. `detail: { event, start, end, allDay }` when an event is dragged,
 *   resized or moved with the keyboard. The app updates `events`.
 * @fires navigate - `detail: { view, date, start, end }` when the toolbar, keyboard or a "+N more" link
 *   changes the view or the period shown.
 *
 * @csspart toolbar - The row with the navigation buttons, title and view switch.
 * @csspart title - The period's title.
 * @csspart views - The view switch (a segmented button group).
 * @csspart grid - The month grid or the time grid.
 * @csspart agenda - The agenda list.
 * @csspart event - Each event chip.
 *
 * @cssprop --lit-material-calendar-slot-height - Height of one time slot in the week and day views. Default 24px.
 * @cssprop --lit-material-calendar-height - Maximum height of the scrolling time grid. Default 640px.
 */
@customElement("lit-material-calendar")
export class LitMaterialCalendar extends LitElement {
  static override styles = styles;

  /** Which view is shown. */
  @property({ reflect: true }) view: CalendarView = "month";

  /** The day in focus, as an ISO `"YYYY-MM-DD"` string; the view shows the month, week or day around it. Default: today. */
  @property() date?: string;

  /** The events: `{ id, title, start, end?, allDay?, color?, editable?, ...data }`. Property or JSON attribute. */
  @property({ type: Array }) events: CalendarEvent[] = [];

  /** 0 = Sunday, 1 = Monday, ... Default: the first day of the week in the element's language, else Sunday. */
  @property({ type: Number, attribute: "first-day-of-week" }) firstDayOfWeek?: number;

  /** Minutes per row of the week and day views; also the step for keyboard moves. */
  @property({ type: Number, attribute: "slot-minutes" }) slotMinutes = 30;

  /** The hour the week and day views scroll to when they open. */
  @property({ type: Number, attribute: "scroll-to-hour" }) scrollToHour = 8;

  /** Event rows per day in the month view before "+N more". */
  @property({ type: Number, attribute: "day-max-events" }) dayMaxEvents = 3;

  /** Days the agenda view lists, from `date`. */
  @property({ type: Number, attribute: "agenda-days" }) agendaDays = 7;

  /** No dragging, resizing or keyboard moves (clicks still fire). */
  @property({ type: Boolean, reflect: true }) readonly = false;

  /** Slot in focus in the time grid (`-1`: the all-day row). */
  @state() private focusSlot = -1;
  @state() private selection: Selection | null = null;
  @state() private preview: { key: string; start: Date; end: Date } | null = null;
  @state() private agendaIndex = 0;
  @state() private announcement = "";
  /** The current time, for the line in the time grid. Unset on the server and in the first (hydrating) render, so a page rendered earlier still hydrates. */
  @state() private now?: Date;

  private readonly localize = new LocalizeController(this);
  private normalized: NormalizedEvent[] = [];
  private byKey = new Map<string, NormalizedEvent>();
  private focusAfterUpdate: "cell" | "agenda" | { key: string } | null = null;
  private pendingEventFocus: string | null = null;
  private drag: DragState | null = null;
  private suppressClick = false;
  private scrolledView: CalendarView | null = null;
  private timer?: ReturnType<typeof setInterval>;

  override connectedCallback(): void {
    super.connectedCallback();
    // After the first render, which on a server-rendered page has to match the server's markup.
    if (!isServer) void this.updateComplete.then(() => this.isConnected && this.startClock());
  }

  private startClock(): void {
    clearInterval(this.timer);
    this.now = new Date();
    this.timer = setInterval(() => (this.now = new Date()), 60_000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.timer);
    this.endDrag();
  }

  // ---- derived values ----

  private get slotLength(): number {
    const value = Number(this.slotMinutes);
    return Number.isFinite(value) && value >= 5 ? Math.min(240, Math.round(value)) : 30;
  }

  private get slotCount(): number {
    return Math.ceil(DAY_MINUTES / this.slotLength);
  }

  private get anchor(): CalendarDate {
    return parseISODate(this.date) ?? today();
  }

  private get weekStart(): number {
    const value = this.firstDayOfWeek;
    return typeof value === "number" && Number.isFinite(value) ? ((Math.round(value) % 7) + 7) % 7 : localeFirstDayOfWeek(this.localize.lang);
  }

  private get agendaLength(): number {
    const value = Math.round(Number(this.agendaDays));
    return Number.isFinite(value) && value > 0 ? Math.min(value, 366) : 7;
  }

  /** The first day shown and how many days, for a view around `anchor`. */
  private rangeOf(view: CalendarView, anchor: CalendarDate): { first: CalendarDate; days: number } {
    if (view === "week") return { first: startOfWeek(anchor, this.weekStart), days: 7 };
    if (view === "day") return { first: anchor, days: 1 };
    if (view === "agenda") return { first: anchor, days: this.agendaLength };
    const first = startOfWeek({ year: anchor.year, month: anchor.month, day: 1 }, this.weekStart);
    const last = { year: anchor.year, month: anchor.month, day: new Date(anchor.year, anchor.month + 1, 0).getDate() };
    return { first, days: Math.ceil((daysBetween(first, last) + 1) / 7) * 7 };
  }

  /** The first and (exclusive) last instant on screen. */
  get visibleRange(): { start: Date; end: Date } {
    const { first, days } = this.rangeOf(this.view, this.anchor);
    return { start: toDate(first), end: toDate(addDays(first, days)) };
  }

  private inPeriod(date: CalendarDate): boolean {
    if (this.view === "month") return date.year === this.anchor.year && date.month === this.anchor.month;
    const { first, days } = this.rangeOf(this.view, this.anchor);
    const offset = daysBetween(first, date);
    return offset >= 0 && offset < days;
  }

  private get timeGrid(): boolean {
    return this.view === "week" || this.view === "day";
  }

  // ---- lifecycle ----

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("events") || changed.has("readonly") || !this.hasUpdated) {
      this.normalized = normalizeEvents(this.events, this.readonly);
      this.byKey = new Map();
      for (const event of this.normalized) if (!this.byKey.has(event.key)) this.byKey.set(event.key, event);
      if (this.pendingEventFocus) this.followMovedEvent(this.pendingEventFocus);
    }
    if (!this.hasUpdated || changed.has("slotMinutes")) {
      if (this.focusSlot >= this.slotCount || !this.hasUpdated) this.focusSlot = this.defaultSlot();
    }
  }

  private defaultSlot(): number {
    const hour = Math.max(0, Math.min(23, Math.round(Number(this.scrollToHour) || 0)));
    return Math.min(this.slotCount - 1, Math.floor((hour * 60) / this.slotLength));
  }

  protected override updated(): void {
    if (this.timeGrid && this.scrolledView !== this.view) {
      this.scrolledView = this.view;
      this.scrollToDefaultHour();
    } else if (!this.timeGrid) {
      this.scrolledView = null;
    }
    const target = this.focusAfterUpdate;
    this.focusAfterUpdate = null;
    if (!target) return;
    if (target === "cell") this.renderRoot.querySelector<HTMLElement>('[data-cell][tabindex="0"]')?.focus();
    else if (target === "agenda") this.renderRoot.querySelector<HTMLElement>('.agenda-event[tabindex="0"]')?.focus();
    else {
      const chips = [...this.renderRoot.querySelectorAll<HTMLElement>(".event")].filter((chip) => chip.dataset.key === target.key);
      (chips.find((chip) => chip.tabIndex === 0) ?? chips[0])?.focus();
    }
  }

  private scrollToDefaultHour(): void {
    const grid = this.renderRoot.querySelector<HTMLElement>(".time-grid");
    const row = this.renderRoot.querySelector<HTMLElement>(`[data-row="${this.defaultSlot()}"]`);
    const head = this.renderRoot.querySelector<HTMLElement>(".head");
    if (grid && row) grid.scrollTop = row.offsetTop - (head?.offsetHeight ?? 0) - 8;
  }

  /** After an `event-change` the app accepted: focus and announce the event where it is now. */
  private followMovedEvent(key: string): void {
    this.pendingEventFocus = null;
    const event = this.byKey.get(key);
    if (!event) return;
    const day = fromDate(event.start);
    this.focusSlot = event.allDay ? -1 : Math.floor(minutesInto(day, event.start) / this.slotLength);
    this.setDate(day);
    this.announcement = this.eventLabel(event);
    this.focusAfterUpdate = { key };
  }

  // ---- public methods ----

  /** Shows the next month, week, day or agenda period. */
  next(): void {
    this.step(1);
  }

  /** Shows the previous period. */
  previous(): void {
    this.step(-1);
  }

  /** Shows the period with today in it. */
  goToToday(): void {
    this.setDate(today());
  }

  private step(direction: 1 | -1): void {
    const anchor = this.anchor;
    if (this.view === "month") this.setDate(addMonths(anchor, direction));
    else this.setDate(addDays(anchor, direction * (this.view === "week" ? 7 : this.view === "day" ? 1 : this.agendaLength)));
  }

  /** Moves the focused day, firing `navigate` when the period on screen changes. */
  private setDate(date: CalendarDate, view: CalendarView = this.view): void {
    const before = this.visibleRange;
    const viewChanged = view !== this.view;
    this.view = view;
    this.date = formatISODate(date);
    this.agendaIndex = 0;
    const after = this.visibleRange;
    if (viewChanged || before.start.getTime() !== after.start.getTime() || before.end.getTime() !== after.end.getTime()) {
      this.dispatchEvent(
        new CustomEvent<NavigateDetail>("navigate", {
          detail: { view, date: this.date, ...after },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  // ---- labels ----

  private periodTitle(): string {
    const lang = this.localize.lang;
    const { first, days } = this.rangeOf(this.view, this.anchor);
    if (this.view === "month") return format(lang, "monthTitle", this.anchor);
    if (this.view === "day") return format(lang, "dayTitle", first);
    return range(lang, "rangeTitle", first, addDays(first, days - 1));
  }

  private eventTime(event: NormalizedEvent): string {
    const lang = this.localize.lang;
    if (event.allDay) {
      const dates = range(lang, "eventDate", event.start, toDate(lastDay(event)));
      return this.localize.term("calendar.allDayRange", "{dates}, all day", { dates });
    }
    return range(lang, "eventDateTime", event.start, event.end);
  }

  private eventLabel(event: NormalizedEvent): string {
    const title = event.title || this.localize.term("calendar.untitled", "(No title)");
    return this.localize.term("calendar.eventLabel", "{title}, {time}", { title, time: this.eventTime(event) });
  }

  private dayLabel(date: string, count: number): string {
    if (!count) return date;
    return this.localize.term("calendar.dayWithEvents", { one: "{date}, {count} event", other: "{date}, {count} events" }, { date, count });
  }

  private navLabel(direction: "previous" | "next"): string {
    const t = this.localize;
    const previous = direction === "previous";
    switch (this.view) {
      case "week":
        return previous ? t.term("calendar.previousWeek", "Previous week") : t.term("calendar.nextWeek", "Next week");
      case "day":
        return previous ? t.term("calendar.previousDay", "Previous day") : t.term("calendar.nextDay", "Next day");
      case "agenda":
        return previous ? t.term("calendar.previousPeriod", "Previous period") : t.term("calendar.nextPeriod", "Next period");
      default:
        return previous ? t.term("calendar.previousMonth", "Previous month") : t.term("calendar.nextMonth", "Next month");
    }
  }

  private viewLabel(view: CalendarView): string {
    const t = this.localize;
    if (view === "week") return t.term("calendar.week", "Week");
    if (view === "day") return t.term("calendar.day", "Day");
    if (view === "agenda") return t.term("calendar.agenda", "Agenda");
    return t.term("calendar.month", "Month");
  }

  // ---- rendering ----

  override render() {
    const title = this.periodTitle();
    let body: TemplateResult;
    if (this.view === "agenda") body = this.renderAgenda(title);
    else if (this.timeGrid) body = this.renderTimeGrid(title);
    else body = this.renderMonth(title);
    return html`
      ${this.renderToolbar(title)} ${body}
      <div class="visually-hidden" role="status">${this.announcement}</div>
    `;
  }

  private renderToolbar(title: string) {
    const t = this.localize;
    return html`
      <div class="toolbar" part="toolbar">
        <div class="nav">
          <button class="today-button" type="button" @click=${this.handleToday}>${t.term("calendar.today", "Today")}</button>
          <button class="icon-button" type="button" data-nav="previous" aria-label=${this.navLabel("previous")} @click=${this.handlePrevious}>
            ${previousIcon}
          </button>
          <button class="icon-button" type="button" data-nav="next" aria-label=${this.navLabel("next")} @click=${this.handleNext}>${nextIcon}</button>
        </div>
        <h2 class="title" part="title" aria-live="polite">${title}</h2>
        <lit-material-segmented-button-group class="views" part="views" aria-label=${t.term("calendar.view", "Calendar view")} @change=${this.handleViewChange}>
          ${VIEWS.map(
            (view) => html`<lit-material-segmented-button data-view=${view} ?selected=${view === this.view}>${this.viewLabel(view)}</lit-material-segmented-button>`,
          )}
        </lit-material-segmented-button-group>
      </div>
    `;
  }

  /** The events to lay out, with a drag preview in place of the event being dragged. */
  private get displayed(): NormalizedEvent[] {
    const preview = this.preview;
    if (!preview) return this.normalized;
    return this.normalized.map((event) => (event.key === preview.key ? { ...event, start: preview.start, end: preview.end } : event));
  }

  private renderChip(event: NormalizedEvent, focusable: boolean, classes: string, props: Record<string, string | number>, content: unknown) {
    const dragging = this.preview?.key === event.key;
    return html`<button
      class="event ${classes} ${dragging ? "dragging" : ""} ${event.editable ? "editable" : ""}"
      part="event"
      type="button"
      data-key=${event.key}
      tabindex=${focusable ? "0" : "-1"}
      aria-label=${this.eventLabel(event)}
      style=${cssProps({ ...props, "--event-color": event.color })}
    >
      ${content}
    </button>`;
  }

  private renderMonth(title: string) {
    const lang = this.localize.lang;
    const anchor = this.anchor;
    const { first, days } = this.rangeOf("month", anchor);
    const now = today();
    const maxLanes = Math.max(1, Math.round(Number(this.dayMaxEvents)) || 3);
    const events = this.displayed;
    const weeks: CalendarDate[][] = [];
    for (let i = 0; i < days; i += 7) weeks.push(Array.from({ length: 7 }, (_, d) => addDays(first, i + d)));
    const header = weeks[0]!;

    return html`
      <div
        class="month"
        part="grid"
        role="grid"
        aria-label=${title}
        style=${cssProps({ "--max-lanes": maxLanes })}
        @keydown=${this.handleGridKeydown}
        @click=${this.handleGridClick}
        @pointerdown=${this.handlePointerDown}
        @focusin=${this.handleFocusIn}
      >
        <div class="row weekdays" role="row">
          ${header.map(
            (day) => html`<div class="weekday" role="columnheader" aria-label=${format(lang, "weekdayLong", day)}>${format(lang, "weekdayShort", day)}</div>`,
          )}
        </div>
        ${weeks.map((week) => {
          const segments = layoutSpans(events, week[0]!, 7);
          return html`<div class="row week" role="row">
            ${week.map((day, column) => {
              const iso = formatISODate(day);
              const focused = sameDate(day, anchor);
              const covering = segments.filter((s) => s.startColumn <= column && s.endColumn >= column);
              const hidden = covering.filter((s) => s.lane >= maxLanes).length;
              const label = this.dayLabel(format(lang, "fullDate", day), covering.length);
              const outside = day.month !== anchor.month;
              return html`<div
                class="day ${outside ? "outside" : ""} ${sameDate(day, now) ? "today" : ""}"
                role="gridcell"
                data-cell
                data-date=${iso}
                tabindex=${focused ? "0" : "-1"}
                aria-label=${label}
                aria-current=${sameDate(day, now) ? "date" : nothing}
              >
                <span class="day-number" aria-hidden="true">${dayNumber(lang, day.day)}</span>
                ${segments
                  .filter((s) => s.startColumn === column && s.lane < maxLanes)
                  .map((s) => {
                    const bar = s.item.allDay || s.endColumn > s.startColumn || s.continuesAfter;
                    const classes = `${bar ? "bar" : "timed"} ${s.continuesBefore ? "continues-before" : ""} ${s.continuesAfter ? "continues-after" : ""}`;
                    return this.renderChip(
                      s.item,
                      focused,
                      classes,
                      { "--lane": s.lane, "--span": s.endColumn - s.startColumn + 1 },
                      html`${bar || s.item.allDay ? nothing : html`<span class="time">${format(lang, "time", s.item.start)}</span>`}<span class="event-title"
                          >${s.item.title || this.localize.term("calendar.untitled", "(No title)")}</span
                        >`,
                    );
                  })}
                ${hidden
                  ? html`<button
                      class="more"
                      type="button"
                      data-date=${iso}
                      tabindex=${focused ? "0" : "-1"}
                      aria-label=${this.localize.term(
                        "calendar.moreLabel",
                        { one: "{count} more event, {date}", other: "{count} more events, {date}" },
                        { count: hidden, date: format(lang, "fullDate", day) },
                      )}
                    >
                      ${this.localize.term("calendar.more", { one: "+{count} more", other: "+{count} more" }, { count: hidden })}
                    </button>`
                  : nothing}
              </div>`;
            })}
          </div>`;
        })}
      </div>
    `;
  }

  private renderTimeGrid(title: string) {
    const lang = this.localize.lang;
    const t = this.localize;
    const anchor = this.anchor;
    const { first, days } = this.rangeOf(this.view, anchor);
    const dayList = Array.from({ length: days }, (_, i) => addDays(first, i));
    const now = today();
    const slot = this.slotLength;
    const events = this.displayed;
    const allDayEvents = events.filter((e) => e.allDay);
    const timedEvents = events.filter((e) => !e.allDay);
    const spans = layoutSpans(allDayEvents, first, days);
    const lanes = spans.reduce((max, s) => Math.max(max, s.lane + 1), 1);
    // Timed segments by "day:slot" of the slot each starts in.
    const bySlot = new Map<string, TimedSegment<NormalizedEvent>[]>();
    const countBySlot = new Map<string, number>();
    dayList.forEach((day, d) => {
      for (const segment of layoutDay(timedEvents, day)) {
        const index = Math.min(this.slotCount - 1, Math.floor(segment.top / slot));
        const key = `${d}:${index}`;
        bySlot.set(key, [...(bySlot.get(key) ?? []), segment]);
        const last = Math.min(this.slotCount - 1, Math.ceil(segment.bottom / slot) - 1);
        for (let s = index; s <= last; s++) countBySlot.set(`${d}:${s}`, (countBySlot.get(`${d}:${s}`) ?? 0) + 1);
      }
    });
    const nowMinutes = this.now ? this.now.getHours() * 60 + this.now.getMinutes() : -1;
    const nowDay = this.now ? fromDate(this.now) : undefined;
    const selection = this.selection;
    const fullDates = dayList.map((day) => format(lang, "fullDate", day));
    const allDayLabel = t.term("calendar.allDay", "All day");
    const slots = Array.from({ length: this.slotCount }, (_, s) => s);

    return html`
      <div
        class="time-grid"
        part="grid"
        role="grid"
        aria-label=${title}
        style=${cssProps({ "--days": days })}
        @keydown=${this.handleGridKeydown}
        @click=${this.handleGridClick}
        @pointerdown=${this.handlePointerDown}
        @focusin=${this.handleFocusIn}
      >
        <div class="head" role="rowgroup">
          <div class="row day-headers" role="row">
            <div class="corner" role="columnheader"><span class="visually-hidden">${t.term("calendar.time", "Time")}</span></div>
            ${dayList.map(
              (day, d) => html`<div class="day-header ${sameDate(day, now) ? "today" : ""}" role="columnheader" aria-label=${fullDates[d]!}>
                <span class="weekday" aria-hidden="true">${format(lang, "weekdayShort", day)}</span>
                <span class="date-number" aria-hidden="true">${dayNumber(lang, day.day)}</span>
              </div>`,
            )}
          </div>
          <div class="row all-day" role="row" style=${cssProps({ "--lanes": lanes })}>
            <div class="time-label all-day-label" role="rowheader">${allDayLabel}</div>
            ${dayList.map((day, d) => {
              const focused = sameDate(day, anchor) && this.focusSlot === -1;
              const covering = spans.filter((s) => s.startColumn <= d && s.endColumn >= d).length;
              return html`<div
                class="cell all-day-cell ${sameDate(day, now) ? "today" : ""}"
                role="gridcell"
                data-cell
                data-date=${formatISODate(day)}
                data-slot="-1"
                tabindex=${focused ? "0" : "-1"}
                aria-label=${this.dayLabel(t.term("calendar.dateTime", "{date}, {time}", { date: fullDates[d]!, time: allDayLabel }), covering)}
              >
                ${spans
                  .filter((s) => s.startColumn === d)
                  .map((s) =>
                    this.renderChip(
                      s.item,
                      focused,
                      `bar ${s.continuesBefore ? "continues-before" : ""} ${s.continuesAfter ? "continues-after" : ""}`,
                      { "--lane": s.lane, "--span": s.endColumn - s.startColumn + 1 },
                      html`<span class="event-title">${s.item.title || t.term("calendar.untitled", "(No title)")}</span>`,
                    ),
                  )}
              </div>`;
            })}
          </div>
        </div>
        <div class="body" role="rowgroup">
          ${slots.map((s) => {
            const minutes = s * slot;
            const hourStart = minutes % 60 === 0;
            const time = format(lang, "time", toDate(first, minutes));
            return html`<div class="row slot-row ${hourStart ? "hour" : ""}" role="row" data-row=${s}>
              <div class="time-label" role="rowheader">
                ${hourStart ? html`<span aria-hidden="true">${format(lang, "hour", toDate(first, minutes))}</span>` : nothing}
                <span class="visually-hidden">${time}</span>
              </div>
              ${dayList.map((day, d) => {
                const iso = formatISODate(day);
                const focused = sameDate(day, anchor) && this.focusSlot === s;
                const selected = !!selection && selection.date === iso && s >= selection.from && s <= selection.to;
                const segments = bySlot.get(`${d}:${s}`) ?? [];
                const showNow = !!nowDay && sameDate(day, nowDay) && nowMinutes >= minutes && nowMinutes < minutes + slot;
                return html`<div
                  class="cell slot ${selected ? "selected" : ""} ${sameDate(day, now) ? "today" : ""}"
                  role="gridcell"
                  data-cell
                  data-date=${iso}
                  data-slot=${s}
                  tabindex=${focused ? "0" : "-1"}
                  aria-selected=${selected ? "true" : nothing}
                  aria-label=${this.dayLabel(t.term("calendar.dateTime", "{date}, {time}", { date: fullDates[d]!, time }), countBySlot.get(`${d}:${s}`) ?? 0)}
                >
                  ${segments.map((segment) =>
                    this.renderChip(
                      segment.item,
                      focused,
                      `timed-block ${segment.continuesBefore ? "continues-before" : ""} ${segment.continuesAfter ? "continues-after" : ""} ${segment.bottom - segment.top <= slot ? "short" : ""}`,
                      {
                        "--offset": (segment.top - s * slot) / slot,
                        "--length": (segment.bottom - segment.top) / slot,
                        "--col": segment.column,
                        "--cols": segment.columns,
                      },
                      html`<span class="event-title">${segment.item.title || t.term("calendar.untitled", "(No title)")}</span>
                        <span class="time">${range(lang, "time", segment.item.start, segment.item.end)}</span>
                        ${segment.item.editable && !segment.continuesAfter ? html`<span class="resize" data-resize aria-hidden="true"></span>` : nothing}`,
                    ),
                  )}
                  ${showNow ? html`<div class="now" aria-hidden="true" style=${cssProps({ "--offset": (nowMinutes - minutes) / slot })}></div>` : nothing}
                </div>`;
              })}
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  private agendaItems(): { day: CalendarDate; event: NormalizedEvent }[] {
    const { first, days } = this.rangeOf("agenda", this.anchor);
    const items: { day: CalendarDate; event: NormalizedEvent }[] = [];
    for (let i = 0; i < days; i++) {
      const day = addDays(first, i);
      const onDay = this.normalized.filter((event) => coversDay(event, day));
      onDay.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime());
      for (const event of onDay) items.push({ day, event });
    }
    return items;
  }

  private renderAgenda(title: string) {
    const lang = this.localize.lang;
    const t = this.localize;
    const items = this.agendaItems();
    const active = Math.min(this.agendaIndex, items.length - 1);
    const groups: { day: CalendarDate; entries: { event: NormalizedEvent; index: number }[] }[] = [];
    items.forEach(({ day, event }, index) => {
      const last = groups[groups.length - 1];
      if (last && sameDate(last.day, day)) last.entries.push({ event, index });
      else groups.push({ day, entries: [{ event, index }] });
    });
    const now = today();
    return html`
      <section class="agenda" part="agenda" aria-label=${title} @keydown=${this.handleAgendaKeydown} @click=${this.handleAgendaClick}>
        ${items.length
          ? groups.map(({ day, entries }) => {
              const id = `agenda-${formatISODate(day)}`;
              return html`<div class="agenda-day ${sameDate(day, now) ? "today" : ""}">
                <h3 class="agenda-date" id=${id} aria-label=${format(lang, "fullDate", day)}>${format(lang, "agendaDate", day)}</h3>
                <ul aria-labelledby=${id}>
                  ${entries.map(
                    ({ event, index }) => html`<li>
                      <button
                        class="event agenda-event"
                        part="event"
                        type="button"
                        data-key=${event.key}
                        data-index=${index}
                        tabindex=${index === active ? "0" : "-1"}
                        aria-label=${this.eventLabel(event)}
                        style=${cssProps({ "--event-color": event.color })}
                      >
                        <span class="agenda-time">${event.allDay ? t.term("calendar.allDay", "All day") : range(lang, "time", event.start, event.end)}</span>
                        <span class="dot" aria-hidden="true"></span>
                        <span class="event-title">${event.title || t.term("calendar.untitled", "(No title)")}</span>
                      </button>
                    </li>`,
                  )}
                </ul>
              </div>`;
            })
          : html`<p class="empty">${t.term("calendar.noEvents", "No events")}</p>`}
      </section>
    `;
  }

  // ---- toolbar ----

  private readonly handleToday = (): void => this.goToToday();
  private readonly handlePrevious = (): void => this.previous();
  private readonly handleNext = (): void => this.next();

  private readonly handleViewChange = (event: Event): void => {
    event.stopPropagation();
    const buttons = [...this.renderRoot.querySelectorAll<HTMLElement & { selected: boolean }>("lit-material-segmented-button")];
    const selected = buttons.find((button) => button.selected);
    const view = selected?.dataset.view as CalendarView | undefined;
    if (view && VIEWS.includes(view) && view !== this.view) this.setDate(this.anchor, view);
  };

  // ---- grid interaction ----

  private cellInfo(cell: HTMLElement): CellInfo | undefined {
    const date = parseISODate(cell.dataset.date);
    if (!date) return undefined;
    return { date, slot: cell.dataset.slot === undefined ? null : Number(cell.dataset.slot) };
  }

  private slotTimes(info: CellInfo, toSlot = info.slot): SlotClickDetail {
    if (info.slot === null || info.slot < 0) return { start: toDate(info.date), end: toDate(addDays(info.date, 1)), allDay: true };
    const from = Math.min(info.slot, toSlot ?? info.slot);
    const to = Math.max(info.slot, toSlot ?? info.slot);
    return {
      start: toDate(info.date, from * this.slotLength),
      end: toDate(info.date, Math.min(DAY_MINUTES, (to + 1) * this.slotLength)),
      allDay: false,
    };
  }

  private emitSlot(detail: SlotClickDetail): void {
    this.dispatchEvent(new CustomEvent<SlotClickDetail>("slot-click", { detail, bubbles: true, composed: true }));
  }

  private emitEventClick(event: NormalizedEvent): void {
    this.dispatchEvent(new CustomEvent<EventClickDetail>("event-click", { detail: { event: event.source }, bubbles: true, composed: true }));
  }

  private readonly handleGridClick = (e: MouseEvent): void => {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    const grid = e.currentTarget as HTMLElement;
    const path = e.composedPath();
    const chip = closest(path, ".event", grid);
    if (chip) {
      const event = this.byKey.get(chip.dataset.key ?? "");
      if (event) this.emitEventClick(event);
      return;
    }
    const more = closest(path, ".more", grid);
    if (more) {
      const date = parseISODate(more.dataset.date);
      if (date) this.setDate(date, "day");
      return;
    }
    const cell = closest(path, "[data-cell]", grid);
    const info = cell && this.cellInfo(cell);
    if (!info) return;
    if (this.inPeriod(info.date)) {
      if (info.slot !== null) this.focusSlot = info.slot;
      this.date = formatISODate(info.date);
    }
    this.selection = null;
    this.emitSlot(this.slotTimes(info));
  };

  /** Focus that lands on a cell (a click, or a chip's cell) makes it the roving tab stop. */
  private readonly handleFocusIn = (e: FocusEvent): void => {
    const grid = e.currentTarget as HTMLElement;
    const cell = closest(e.composedPath(), "[data-cell]", grid);
    const info = cell && this.cellInfo(cell);
    if (!info || !this.inPeriod(info.date)) return;
    if (info.slot !== null) this.focusSlot = info.slot;
    if (!sameDate(info.date, this.anchor)) this.date = formatISODate(info.date);
  };

  private focusCellLater(): void {
    this.focusAfterUpdate = "cell";
  }

  private readonly handleGridKeydown = (e: KeyboardEvent): void => {
    const grid = e.currentTarget as HTMLElement;
    const path = e.composedPath();
    const chip = closest(path, ".event", grid);
    const more = closest(path, ".more", grid);
    this.pendingEventFocus = null;
    if (chip) {
      if (this.handleEventKeydown(e, chip)) return;
      if (e.key === "Enter" || e.key === " ") return; // the button's own click
      if (e.key === "Escape") {
        e.preventDefault();
        this.renderRoot.querySelector<HTMLElement>('[data-cell][tabindex="0"]')?.focus();
        return;
      }
    }
    if (more && (e.key === "Enter" || e.key === " ")) return;
    if (e.altKey || e.metaKey) return;

    const rtl = isRtl(this);
    const forward = rtl ? -1 : 1;
    const anchor = this.anchor;
    const time = this.timeGrid;
    const ctrl = e.ctrlKey;
    let date: CalendarDate | undefined;
    let slot = this.focusSlot;

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowRight": {
        if (ctrl) return;
        date = addDays(anchor, e.key === "ArrowRight" ? forward : -forward);
        this.selection = null;
        break;
      }
      case "ArrowUp":
      case "ArrowDown": {
        if (ctrl) return;
        const down = e.key === "ArrowDown";
        if (!time) {
          date = addDays(anchor, down ? 7 : -7);
          break;
        }
        slot = Math.max(-1, Math.min(this.slotCount - 1, slot + (down ? 1 : -1)));
        date = anchor;
        if (e.shiftKey && slot >= 0 && this.focusSlot >= 0) {
          const iso = formatISODate(anchor);
          const base = this.selection?.date === iso ? this.selection.anchor : this.focusSlot;
          this.selection = { date: iso, anchor: base, from: Math.min(base, slot), to: Math.max(base, slot) };
        } else {
          this.selection = null;
        }
        break;
      }
      case "Home":
      case "End": {
        const end = e.key === "End";
        if (time && ctrl) {
          slot = end ? this.slotCount - 1 : 0;
          date = anchor;
        } else if (time) {
          const { first, days } = this.rangeOf(this.view, anchor);
          date = end ? addDays(first, days - 1) : first;
        } else {
          const first = startOfWeek(anchor, this.weekStart);
          date = end ? addDays(first, 6) : first;
        }
        this.selection = null;
        break;
      }
      case "PageUp":
      case "PageDown": {
        const direction = e.key === "PageDown" ? 1 : -1;
        if (this.view === "month") date = addMonths(anchor, e.shiftKey ? direction * 12 : direction);
        else date = addDays(anchor, direction * (this.view === "week" ? 7 : 1));
        this.selection = null;
        break;
      }
      case "t":
      case "T":
        if (ctrl) return;
        date = today();
        this.selection = null;
        break;
      case "Enter":
      case " ": {
        const cell = closest(path, "[data-cell]", grid);
        const info = cell && this.cellInfo(cell);
        if (!info) return;
        e.preventDefault();
        const sel = this.selection;
        if (sel && sel.date === formatISODate(info.date) && info.slot !== null && info.slot >= sel.from && info.slot <= sel.to) {
          this.emitSlot(this.slotTimes({ date: info.date, slot: sel.from }, sel.to));
        } else {
          this.emitSlot(this.slotTimes(info));
        }
        return;
      }
      default:
        return;
    }
    e.preventDefault();
    this.focusSlot = slot;
    this.setDate(date);
    this.focusCellLater();
  };

  /** Alt+arrows move an event, Alt+Shift+arrows change its end. Returns whether the key was handled. */
  private handleEventKeydown(e: KeyboardEvent, chip: HTMLElement): boolean {
    if (!e.altKey || e.ctrlKey || e.metaKey) return false;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return false;
    e.preventDefault();
    const event = this.byKey.get(chip.dataset.key ?? "");
    if (!event || !event.editable) return true;
    const forward = isRtl(this) ? -1 : 1;
    let days = 0;
    let minutes = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") days = e.key === "ArrowRight" ? forward : -forward;
    else {
      const down = e.key === "ArrowDown" ? 1 : -1;
      if (this.timeGrid && !event.allDay) minutes = down * this.slotLength;
      else days = down * 7;
    }
    let { start, end } = event;
    if (e.shiftKey) {
      end = shift(end, days, minutes);
      const min = event.allDay ? toDate(addDays(fromDate(start), 1)) : new Date(start.getTime() + Math.min(this.slotLength, 15) * MINUTE);
      if (end.getTime() < min.getTime()) end = min;
    } else {
      start = shift(start, days, minutes);
      end = shift(end, days, minutes);
    }
    this.requestChange(event, start, end, true);
    return true;
  }

  private requestChange(event: NormalizedEvent, start: Date, end: Date, keyboard: boolean): boolean {
    if (start.getTime() === event.start.getTime() && end.getTime() === event.end.getTime()) return false;
    const accepted = this.dispatchEvent(
      new CustomEvent<EventChangeDetail>("event-change", {
        detail: { event: event.source, start, end, allDay: event.allDay },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (accepted && keyboard) this.pendingEventFocus = event.key;
    return accepted;
  }

  // ---- pointer: drag to create, move and resize ----

  private cellAt(x: number, y: number): CellInfo | undefined {
    const root = this.renderRoot as ShadowRoot;
    const elements = typeof root.elementsFromPoint === "function" ? root.elementsFromPoint(x, y) : [];
    const cell = elements.find((el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute("data-cell"));
    return cell ? this.cellInfo(cell) : undefined;
  }

  private readonly handlePointerDown = (e: PointerEvent): void => {
    if (e.button !== 0 || this.drag) return;
    const grid = e.currentTarget as HTMLElement;
    const path = e.composedPath();
    const chip = closest(path, ".event", grid);
    const origin = this.cellAt(e.clientX, e.clientY) ?? (() => {
      const cell = closest(path, "[data-cell]", grid);
      return cell ? this.cellInfo(cell) : undefined;
    })();
    if (!origin) return;
    let drag: DragState | null = null;
    if (chip) {
      const event = this.byKey.get(chip.dataset.key ?? "");
      if (!event?.editable) return;
      const resize = !!closest(path, "[data-resize]", grid);
      drag = { mode: resize ? "resize" : "move", pointerId: e.pointerId, x: e.clientX, y: e.clientY, origin, event, moved: false };
    } else if (this.timeGrid && origin.slot !== null && origin.slot >= 0 && e.pointerType !== "touch") {
      drag = { mode: "create", pointerId: e.pointerId, x: e.clientX, y: e.clientY, origin, moved: false };
    }
    if (!drag) return;
    this.drag = drag;
    this.suppressClick = false;
    try {
      grid.setPointerCapture(e.pointerId);
    } catch {
      // a synthetic pointer: listeners on the host still see its events
    }
    this.addEventListener("pointermove", this.handlePointerMove);
    this.addEventListener("pointerup", this.handlePointerUp);
    this.addEventListener("pointercancel", this.handlePointerCancel);
  };

  private readonly handlePointerMove = (e: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4) return;
    drag.moved = true;
    const cell = this.cellAt(e.clientX, e.clientY);
    if (!cell) return;
    if (drag.mode === "create") {
      if (!sameDate(cell.date, drag.origin.date) || cell.slot === null || cell.slot < 0) return;
      const from = drag.origin.slot!;
      this.selection = { date: formatISODate(cell.date), anchor: from, from: Math.min(from, cell.slot), to: Math.max(from, cell.slot) };
      return;
    }
    const event = drag.event!;
    const days = daysBetween(drag.origin.date, cell.date);
    const timed = !event.allDay && drag.origin.slot !== null && drag.origin.slot >= 0;
    // A timed event stays in the time rows and an all-day one in the all-day row (or the month grid).
    if (timed && (cell.slot === null || cell.slot < 0)) return;
    if (!timed && cell.slot !== null && cell.slot >= 0) return;
    const minutes = timed ? (cell.slot! - drag.origin.slot!) * this.slotLength : 0;
    if (drag.mode === "move") {
      this.preview = { key: event.key, start: shift(event.start, days, minutes), end: shift(event.end, days, minutes) };
    } else {
      let end = shift(event.end, days, minutes);
      const min = event.allDay ? toDate(addDays(fromDate(event.start), 1)) : new Date(event.start.getTime() + this.slotLength * MINUTE);
      if (end.getTime() < min.getTime()) end = min;
      this.preview = { key: event.key, start: event.start, end };
    }
  };

  private readonly handlePointerUp = (e: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || e.pointerId !== drag.pointerId) return;
    const preview = this.preview;
    this.endDrag();
    if (!drag.moved) return;
    this.suppressClick = true;
    setTimeout(() => (this.suppressClick = false));
    if (drag.mode === "create") {
      const selection = this.selection;
      this.selection = null;
      if (selection) this.emitSlot(this.slotTimes({ date: drag.origin.date, slot: selection.from }, selection.to));
      return;
    }
    if (preview && drag.event) this.requestChange(drag.event, preview.start, preview.end, false);
  };

  private readonly handlePointerCancel = (): void => {
    if (this.drag?.mode === "create") this.selection = null;
    this.endDrag();
  };

  private endDrag(): void {
    this.drag = null;
    this.preview = null;
    this.removeEventListener("pointermove", this.handlePointerMove);
    this.removeEventListener("pointerup", this.handlePointerUp);
    this.removeEventListener("pointercancel", this.handlePointerCancel);
  }

  // ---- agenda ----

  private readonly handleAgendaClick = (e: MouseEvent): void => {
    const chip = closest(e.composedPath(), ".agenda-event", e.currentTarget as HTMLElement);
    if (!chip) return;
    this.agendaIndex = Number(chip.dataset.index) || 0;
    const event = this.byKey.get(chip.dataset.key ?? "");
    if (event) this.emitEventClick(event);
  };

  private readonly handleAgendaKeydown = (e: KeyboardEvent): void => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const count = this.agendaItems().length;
    const index = Math.min(this.agendaIndex, Math.max(0, count - 1));
    let next: number | undefined;
    switch (e.key) {
      case "ArrowDown":
        next = Math.min(count - 1, index + 1);
        break;
      case "ArrowUp":
        next = Math.max(0, index - 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      case "PageUp":
      case "PageDown":
        e.preventDefault();
        this.step(e.key === "PageDown" ? 1 : -1);
        this.focusAfterUpdate = "agenda";
        return;
      case "t":
      case "T":
        e.preventDefault();
        this.goToToday();
        this.focusAfterUpdate = "agenda";
        return;
      default:
        return;
    }
    e.preventDefault();
    if (next === undefined || next < 0) return;
    this.agendaIndex = next;
    this.focusAfterUpdate = "agenda";
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-calendar": LitMaterialCalendar;
  }
}
