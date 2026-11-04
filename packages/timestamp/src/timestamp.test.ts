import { expect, fixture, html } from "@open-wc/testing";
import "./timestamp.js";
import type { LitMaterialTimestamp } from "./timestamp.js";

describe("lit-material-timestamp", () => {
  it("renders a native <time> with a datetime attribute matching the parsed date's ISO string", async () => {
    const el = await fixture<LitMaterialTimestamp>(
      html`<lit-material-timestamp date="2024-01-15T10:30:00.000Z"></lit-material-timestamp>`,
    );
    const time = el.shadowRoot!.querySelector("time")!;
    expect(time.getAttribute("datetime")).to.equal("2024-01-15T10:30:00.000Z");
  });

  it("renders slotted fallback content when date is empty", async () => {
    const el = await fixture<LitMaterialTimestamp>(html`<lit-material-timestamp>Unknown</lit-material-timestamp>`);
    const time = el.shadowRoot!.querySelector("time")!;
    expect(time.hasAttribute("datetime")).to.be.false;
    expect(el.textContent!.trim()).to.equal("Unknown");
  });

  it("renders slotted fallback content when date is unparseable", async () => {
    const el = await fixture<LitMaterialTimestamp>(html`<lit-material-timestamp date="not-a-date">Unknown</lit-material-timestamp>`);
    const time = el.shadowRoot!.querySelector("time")!;
    expect(time.hasAttribute("datetime")).to.be.false;
  });

  it("formats the absolute date using dateFormat/timeFormat", async () => {
    const el = await fixture<LitMaterialTimestamp>(html`
      <lit-material-timestamp date="2024-01-15T10:30:00.000Z" date-format="short" locale="en-US"></lit-material-timestamp>
    `);
    const time = el.shadowRoot!.querySelector("time")!;
    expect(time.textContent!.trim()).to.equal(
      new Intl.DateTimeFormat("en-US", { dateStyle: "short" }).format(new Date("2024-01-15T10:30:00.000Z")),
    );
  });

  it("omits the date portion when dateFormat is none but timeFormat is set", async () => {
    const el = await fixture<LitMaterialTimestamp>(html`
      <lit-material-timestamp
        date="2024-01-15T10:30:00.000Z"
        date-format="none"
        time-format="short"
        locale="en-US"
      ></lit-material-timestamp>
    `);
    const time = el.shadowRoot!.querySelector("time")!;
    expect(time.textContent!.trim()).to.equal(
      new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(new Date("2024-01-15T10:30:00.000Z")),
    );
  });

  it("shows relative time when relative is set, with the absolute date in the title tooltip", async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const el = await fixture<LitMaterialTimestamp>(html`
      <lit-material-timestamp date=${twoHoursAgo.toISOString()} relative locale="en-US"></lit-material-timestamp>
    `);
    const time = el.shadowRoot!.querySelector("time")!;
    expect(time.textContent!.trim()).to.equal("2 hours ago");
    expect(time.getAttribute("title")).to.equal(
      new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(twoHoursAgo),
    );
  });

  it("shows 'now' for a relative time within the same second", async () => {
    const el = await fixture<LitMaterialTimestamp>(html`
      <lit-material-timestamp date=${new Date().toISOString()} relative locale="en-US"></lit-material-timestamp>
    `);
    const time = el.shadowRoot!.querySelector("time")!;
    expect(time.textContent!.trim()).to.equal("now");
  });

  it("does not set a title tooltip when not relative", async () => {
    const el = await fixture<LitMaterialTimestamp>(
      html`<lit-material-timestamp date="2024-01-15T10:30:00.000Z"></lit-material-timestamp>`,
    );
    const time = el.shadowRoot!.querySelector("time")!;
    expect(time.hasAttribute("title")).to.be.false;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialTimestamp>(
      html`<lit-material-timestamp date="2024-01-15T10:30:00.000Z" relative></lit-material-timestamp>`,
    );
    await expect(el).to.be.accessible();
  });

  it("formats in the element's language unless locale is set", async () => {
    const wrap = await fixture<HTMLElement>(html`<div lang="de-DE">
      <lit-material-timestamp date="2024-01-15T10:30:00.000Z" date-format="long"></lit-material-timestamp>
      <lit-material-timestamp date="2024-01-15T10:30:00.000Z" date-format="long" locale="en-US"></lit-material-timestamp>
      <lit-material-timestamp date=${new Date(Date.now() - 2 * 3600_000).toISOString()} relative></lit-material-timestamp>
    </div>`);
    const [german, english, relative] = Array.from(wrap.querySelectorAll<LitMaterialTimestamp>("lit-material-timestamp"));
    await Promise.all([german, english, relative].map((el) => el!.updateComplete));
    const text = (el: LitMaterialTimestamp) => el.shadowRoot!.querySelector("time")!.textContent!.trim();
    const date = new Date("2024-01-15T10:30:00.000Z");
    expect(text(german!)).to.equal(new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(date));
    expect(text(english!)).to.equal(new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date));
    expect(text(relative!)).to.equal(new Intl.RelativeTimeFormat("de-DE", { numeric: "auto" }).format(-2, "hour"));
  });
});
