import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialCalendar } from "./calendar.js";

const renderToString = (template: ReturnType<typeof html>): Promise<string> => collectResult(render(template));

const events = JSON.stringify([
  { id: 1, title: "Standup", start: "2026-06-15T09:00", end: "2026-06-15T09:30" },
  { id: 2, title: "Offsite", start: "2026-06-16", end: "2026-06-18" },
]);

describe("lit-material-calendar (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialCalendar());
  });

  it("renders the month grid with events from the JSON attribute", async () => {
    const out = await renderToString(html`<lit-material-calendar date="2026-06-15" first-day-of-week="1" events=${events}></lit-material-calendar>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="grid"/);
    assert.match(out, />\s*June 2026\s*</);
    assert.match(out, /data-date="2026-06-01"/);
    assert.match(out, /Standup/);
    assert.match(out, /Offsite/);
    // The roving tab stop is on the focused day, and runtime positions are style attributes on the server.
    assert.match(out, /data-date="2026-06-15"\s+tabindex="0"/);
    assert.match(out, /style="--lane: 0; --span: 2"/);
    assert.match(out, /lit-material-segmented-button/);
  });

  it("renders the week time grid with an all-day row and hour rows", async () => {
    const out = await renderToString(
      html`<lit-material-calendar view="week" date="2026-06-15" first-day-of-week="0" events=${events}></lit-material-calendar>`,
    );
    assert.match(out, /Jun 14\s–\s20, 2026/);
    assert.match(out, /All day/);
    assert.match(out, /data-date="2026-06-14"\s+data-slot="-1"/);
    assert.match(out, /data-row="47"/);
    assert.match(out, /--offset: 0; --length: 1; --col: 0; --cols: 1/);
  });

  it("renders the day view and the agenda", async () => {
    const day = await renderToString(html`<lit-material-calendar view="day" date="2026-06-15" events=${events}></lit-material-calendar>`);
    assert.match(day, /Monday, June 15, 2026/);
    assert.doesNotMatch(day, /data-date="2026-06-16"/);
    const agenda = await renderToString(html`<lit-material-calendar view="agenda" date="2026-06-15" events=${events}></lit-material-calendar>`);
    assert.match(agenda, /class="event agenda-event"/);
    assert.match(agenda, /Standup, Monday, June 15/);
    // The current-time line waits for the browser, so earlier server markup still hydrates.
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    assert.doesNotMatch(await renderToString(html`<lit-material-calendar view="day" date=${today}></lit-material-calendar>`), /class="now"/);
    const empty = await renderToString(html`<lit-material-calendar view="agenda" date="2030-01-01"></lit-material-calendar>`);
    assert.match(empty, /No events/);
  });

  it("formats in the element's language", async () => {
    const out = await renderToString(html`<lit-material-calendar lang="de" date="2026-06-15"></lit-material-calendar>`);
    assert.match(out, /Juni 2026/);
  });
});
