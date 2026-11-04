# @lit-material/calendar

A calendar and scheduler web component styled after Material Design 3, built with [Lit](https://lit.dev/): a month
grid, week and day time grids, and an agenda list, with drag-and-drop, resizing and keyboard moves. Part of
[lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/calendar @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/calendar";
</script>

<lit-material-calendar
  view="week"
  date="2026-06-15"
  events='[
    { "id": 1, "title": "Standup", "start": "2026-06-15T09:00", "end": "2026-06-15T09:15" },
    { "id": 2, "title": "Offsite", "start": "2026-06-16", "end": "2026-06-18", "color": "#7d5260" }
  ]'
></lit-material-calendar>

<script type="module">
  const calendar = document.querySelector("lit-material-calendar");

  // Events are controlled: apply the change (or call preventDefault() to refuse it).
  calendar.addEventListener("event-change", (e) => {
    const { event, start, end } = e.detail;
    calendar.events = calendar.events.map((x) => (x === event ? { ...x, start, end } : x));
  });

  // An empty slot or day was clicked, or a time range dragged out.
  calendar.addEventListener("slot-click", (e) => {
    const { start, end, allDay } = e.detail;
    calendar.events = [...calendar.events, { id: crypto.randomUUID(), title: "New event", start, end, allDay }];
  });

  calendar.addEventListener("event-click", (e) => openEditor(e.detail.event));

  // The period on screen changed: load its events.
  calendar.addEventListener("navigate", (e) => load(e.detail.start, e.detail.end));
</script>
```

## Events and time zones

Each event is `{ id, title, start, end?, allDay?, color?, editable?, ...data }`. `id`s should be unique; extra
fields are kept, and `event-click`/`event-change` hand back the object you passed in.

- `start`/`end` are `Date`s or ISO strings. `"2026-06-15"` is a day, `"2026-06-15T09:30"` a local time, and a string
  with `Z` or an offset an instant.
- `end` is exclusive. Without it (or when it isn't after `start`), a timed event lasts an hour and an all-day one a
  day. An all-day event from the 16th to the 17th inclusive is `start: "2026-06-16", end: "2026-06-18"`.
- `allDay` defaults to `true` when `start` is a date-only string. All-day events go in the all-day row of the week
  and day views; timed events that cross midnight are split at each day.
- **Time zone**: everything is shown in the local time zone of the browser (or the server, when rendering there),
  and `slot-click`/`event-change` give local `Date`s. Convert to and from another zone in your app; a `time-zone`
  property isn't supported (see Scope).

## Views

- **Month** (`view="month"`): an ARIA grid of the weeks around the month. All-day and multi-day events are bars
  across the days they cover; timed events show their start time. After `day-max-events` rows a day shows
  "+N more", which opens that day.
- **Week and day** (`view="week"`, `view="day"`): a scrolling time grid with a row per `slot-minutes`, an all-day row,
  and a red line at the current time. Overlapping events share the width of the day in columns. The grid opens
  scrolled to `scroll-to-hour`.
- **Agenda** (`view="agenda"`): the events of `agenda-days` days from `date`, grouped by day.

The toolbar has Today, previous and next, the period's title (formatted in the element's language with `Intl`)
and a view switch (`lit-material-segmented-button-group`). Without `first-day-of-week`, weeks start on the
language's first day (from `Intl.Locale` week info, else Sunday), as in `@lit-material/date-picker`.

## Keyboard

The month view is an ARIA `grid` of days. The week and day views are one `grid` too: a header row of days, then an
"All day" row and a row per time slot, each with a time `rowheader`. Each cell is named by its date (and time) and
how many events it has; each event is a button named by its title and its date and time
("Standup, Monday, June 15, 9:00 – 9:15 AM").

| Key | In the grid |
| --- | --- |
| Arrow keys | Move between days; in the week and day views Up/Down move between time slots and the all-day row. Left/Right swap in right-to-left layouts. |
| Shift+Up/Down | Week and day views: extend a time range from the focused slot. |
| Enter, Space | `slot-click` for the focused day, all-day cell, slot or selected range. |
| Home, End | First or last day of the week (Ctrl+Home/End: first or last slot of the day). |
| PageUp, PageDown | Previous or next month, week or day (Shift: a year, in the month view). |
| T | Today. |
| Tab | From the focused cell to its events (and "+N more"), then out of the grid. |

| Key | On an event |
| --- | --- |
| Enter, Space | `event-click`. |
| Alt+Left/Right | Move it a day earlier or later (mirrored in right-to-left layouts). |
| Alt+Up/Down | Move it a slot (week and day views) or a week (month view, all-day row). |
| Alt+Shift+arrows | Change its end by the same steps. |
| Escape | Back to the cell. |

After an `event-change` the app applies, focus follows the event and its new time is announced. In the agenda, Up/Down,
Home/End move between events, PageUp/PageDown change the period and T goes to today.

With a mouse or pen, drag across empty slots to fire `slot-click` for the range, drag an event to move it, and drag
its bottom edge to resize it (week and day views; in the month view and the all-day row, drag to another day).

## API

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `view` | `view` (reflected) | `"month" \| "week" \| "day" \| "agenda"` | `"month"` |
| `date` | `date` | `string` (ISO `YYYY-MM-DD`, the focused day) | today |
| `events` | `events` (JSON) | `CalendarEvent[]` | `[]` |
| `firstDayOfWeek` | `first-day-of-week` | `number` (0 = Sunday) | the language's first day, else `0` |
| `slotMinutes` | `slot-minutes` | `number` | `30` |
| `scrollToHour` | `scroll-to-hour` | `number` | `8` |
| `dayMaxEvents` | `day-max-events` | `number` | `3` |
| `agendaDays` | `agenda-days` | `number` | `7` |
| `readonly` | `readonly` (reflected) | `boolean` (no drag, resize or keyboard moves) | `false` |
| `visibleRange` | — | `{ start: Date, end: Date }` (read only, `end` exclusive) | |

Methods: `next()`, `previous()`, `goToToday()`. `date` and `view` change as the user navigates.

| Event | `detail` |
| --- | --- |
| `event-click` | `{ event }` |
| `slot-click` | `{ start, end, allDay }` (`end` exclusive) |
| `event-change` | `{ event, start, end, allDay }`. Cancelable; the calendar doesn't move the event itself. |
| `navigate` | `{ view, date, start, end }`, when the toolbar, keyboard or "+N more" changes the view or period |

Parts `toolbar`, `title`, `views`, `grid`, `agenda`, `event`. Custom properties
`--lit-material-calendar-slot-height` (24px) and `--lit-material-calendar-height` (640px, the time grid's maximum
height); an event's `color` is its accent. Strings are in `@lit-material/translations` (`calendar.*`).

`normalizeEvents`, `layoutDay` (overlap columns for one day) and `layoutSpans` (lanes for bars across days) are
exported from `@lit-material/calendar/calendar-utils.js` and work without a DOM.

Positions are set with `cssProps` from `@lit-material/core` (the CSSOM, not style attributes), so the calendar works
under a `style-src 'self'` Content-Security-Policy. It renders on the server from attributes, including `events`.
Set `date` when the markup is rendered ahead of time (a prerendered page): without it the server's "today" picks the
period. The current-time line is drawn only in the browser, after hydration.

## Scope

Left out of this version:

- Time zones other than the local one (`time-zone`): convert in the app.
- Recurring events (expand them in the app for the visible range, from `navigate`), and an event editor or popover.
- Dragging a timed event into the all-day row or back, dragging events between the agenda's days, and resizing in
  the month view with a pointer (Alt+Shift+arrows work there). Drag to create a range is for mouse and pen; on touch,
  tap a slot.
- A multi-day event in the month view is reachable with Tab from the cell where its bar starts in each week.
- Resource (per-person or per-room) columns, week numbers, and hiding weekends.

## License

MIT
