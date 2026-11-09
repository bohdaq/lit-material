import { expect, fixture, html } from "@open-wc/testing";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./status-strip.js";
import type { LitMaterialStatusStrip, StatusStripItem } from "./status-strip.js";

const runs: StatusStripItem[] = [
  ...Array.from({ length: 21 }, () => ({ status: "pass" as const })),
  { status: "fail", label: "09 Nov 10:12 · 500" },
  { status: "warn", label: "09 Nov 10:27 · 1.9 s" },
  { status: "fail", label: "09 Nov 10:42 · 500" },
];

const strip = (el: LitMaterialStatusStrip) => el.shadowRoot!.querySelector<HTMLElement>('[part="strip"]')!;
const bars = (el: LitMaterialStatusStrip) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('[part="bar"]')];

describe("lit-material-status-strip", () => {
  it("one bar per run, oldest first, with its label as a tooltip", async () => {
    const el = await fixture<LitMaterialStatusStrip>(html`<lit-material-status-strip .items=${runs}></lit-material-status-strip>`);
    expect(bars(el).length).to.equal(24);
    expect(bars(el).slice(-3).map((b) => [b.classList[1], b.title])).to.deep.equal([
      ["fail", "09 Nov 10:12 · 500"],
      ["warn", "09 Nov 10:27 · 1.9 s"],
      ["fail", "09 Nov 10:42 · 500"],
    ]);
  });

  it("is one image named with the counts and the latest result", async () => {
    const el = await fixture<LitMaterialStatusStrip>(html`<lit-material-status-strip label="Payments smoke" .items=${runs}></lit-material-status-strip>`);
    expect(strip(el).getAttribute("role")).to.equal("img");
    expect(strip(el).getAttribute("aria-label")).to.equal("Payments smoke: 21 of 24 passed, 2 failed, latest failed");
    await expect(el).to.be.accessible();
  });

  it("failed bars differ from passed ones by more than colour", async () => {
    const el = await fixture<LitMaterialStatusStrip>(html`<lit-material-status-strip .items=${runs}></lit-material-status-strip>`);
    const [pass] = bars(el);
    const fail = bars(el)[21];
    expect(getComputedStyle(pass).backgroundImage).to.equal("none");
    expect(getComputedStyle(fail).backgroundImage).to.contain("repeating-linear-gradient");
  });

  it("says no data when there are no runs, and treats unknown statuses as none", async () => {
    const el = await fixture<LitMaterialStatusStrip>(html`<lit-material-status-strip .items=${[{ status: "none" }]}></lit-material-status-strip>`);
    expect(strip(el).getAttribute("aria-label")).to.equal("Runs: no data");
    el.items = [{ status: "odd" as never }];
    await el.updateComplete;
    expect(bars(el)[0].classList.contains("none")).to.be.true;
  });

  it("translates its summary", async () => {
    registerTranslation({
      $code: "x-strip",
      "chart.runs": "Läufe",
      "chart.runPassed": "bestanden",
      "chart.statusStripSummary": "{name}: {passed}/{total} ok, {failed} Fehler, zuletzt {latest}",
    });
    const wrapper = await fixture<HTMLDivElement>(html`<div lang="x-strip"><lit-material-status-strip .items=${[{ status: "pass" }]}></lit-material-status-strip></div>`);
    const el = wrapper.querySelector<LitMaterialStatusStrip>("lit-material-status-strip")!;
    await el.updateComplete;
    expect(strip(el).getAttribute("aria-label")).to.equal("Läufe: 1/1 ok, 0 Fehler, zuletzt bestanden");
  });
});
