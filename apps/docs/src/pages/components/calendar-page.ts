import "@lit-material/calendar";
import type { CalendarEvent, CalendarView } from "@lit-material/calendar";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const at = (days: number, time: string) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${iso(d)}T${time}`;
};
const day = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return iso(d);
};

const initialEvents = (): CalendarEvent[] => [
  { id: 1, title: "Standup", start: at(0, "09:00"), end: at(0, "09:15") },
  { id: 2, title: "Design review", start: at(0, "09:00"), end: at(0, "10:30") },
  { id: 3, title: "Deploy window", start: at(0, "13:00"), end: at(0, "14:00"), color: "#386a20" },
  { id: 4, title: "On call", start: day(1), end: day(4), color: "#7d5260" },
  { id: 5, title: "1:1", start: at(2, "15:00"), end: at(2, "15:30") },
  { id: 6, title: "Incident retro", start: at(-1, "11:00"), end: at(-1, "12:00"), color: "#b3261e" },
];

@customElement("docs-calendar-page")
export class DocsCalendarPage extends LitElement {
  static override styles = [pageStyles];

  @state() private events: CalendarEvent[] = initialEvents();
  @state() private log = "";
  @state() private view: CalendarView = "week";
  private nextId = 100;

  private readonly handleChange = (e: CustomEvent<{ event: CalendarEvent; start: Date; end: Date }>): void => {
    const { event, start, end } = e.detail;
    this.events = this.events.map((x) => (x === event ? { ...x, start, end } : x));
    this.log = `Moved "${event.title}" to ${start.toLocaleString()}`;
  };

  private readonly handleSlot = (e: CustomEvent<{ start: Date; end: Date; allDay: boolean }>): void => {
    const { start, end, allDay } = e.detail;
    this.events = [...this.events, { id: this.nextId++, title: "New event", start, end, allDay }];
    this.log = `Added an event at ${start.toLocaleString()}`;
  };

  private readonly handleClick = (e: CustomEvent<{ event: CalendarEvent }>): void => {
    this.log = `Clicked "${e.detail.event.title}"`;
  };

  private readonly handleNavigate = (e: CustomEvent<{ view: CalendarView; start: Date; end: Date }>): void => {
    this.view = e.detail.view;
  };

  override render() {
    return html`
      <h1>Calendar</h1>
      <p>
        Month, week, day and agenda views of your events. Events are controlled: dragging, resizing or Alt+arrow keys fire
        <code>event-change</code>, and the page updates <code>events</code>. Click or drag across empty time to add one here.
      </p>
      <section>
        <lit-material-calendar
          .view=${this.view}
          .events=${this.events}
          @event-change=${this.handleChange}
          @slot-click=${this.handleSlot}
          @event-click=${this.handleClick}
          @navigate=${this.handleNavigate}
        ></lit-material-calendar>
        <p role="status">${this.log}</p>
      </section>
      <section>
        <h2>Keyboard</h2>
        <p>
          Arrows move between days (and time slots in the week and day views), PageUp/PageDown go to the previous or next period,
          Home/End to the start or end of the week, T to today. Tab moves into the events of the focused cell; Enter opens one,
          Alt+arrows move it and Alt+Shift+arrows change its end.
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-calendar-page": DocsCalendarPage;
  }
}
