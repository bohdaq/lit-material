import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./line-chart.js";
import "./sparkline.js";
import type { LitMaterialLineChart } from "./line-chart.js";
import type { LitMaterialSparkline } from "./sparkline.js";
import { formatNumber, linearTicks, niceTicks, spread } from "./scale.js";

const one = [{ name: "Requests", points: [0, 1, 2, 3, 4].map((x) => ({ x, y: [3, 7, 5, 12, 9][x] })) }];
const three = ["api", "web", "admin"].map((name, k) => ({ name, points: [0, 1, 2].map((x) => ({ x, y: x * (k + 1) + k })) }));

describe("chart scale helpers", () => {
  it("makes nice ticks that cover the data", () => {
    expect(niceTicks(0, 12).ticks).to.deep.equal([0, 5, 10, 15]);
    expect(niceTicks(0, 0.9).ticks).to.deep.equal([0, 0.25, 0.5, 0.75, 1]);
    const flat = niceTicks(5, 5);
    expect(flat.min).to.be.lessThan(5);
    expect(flat.max).to.be.greaterThan(5);
    expect(niceTicks(NaN, 1).ticks).to.deep.equal([0, 1]);
    expect(niceTicks(0, 1e300).ticks.length).to.be.lessThan(20, "bounded");
  });

  it("formats compactly and spreads labels apart", () => {
    expect([formatNumber(1500), formatNumber(12500), formatNumber(3.14159), formatNumber(2_400_000)]).to.deep.equal(["1500", "12.5k", "3.14", "2.4M"]);
    expect(linearTicks(0, 10, 3)).to.deep.equal([0, 5, 10]);
    const ys = spread([50, 52, 51], 14, 0, 200);
    const sorted = [...ys].sort((a, b) => a - b);
    expect(sorted[1] - sorted[0]).to.be.at.least(14);
    expect(sorted[2] - sorted[1]).to.be.at.least(14);
  });
});

describe("lit-material-line-chart", () => {
  it("draws one series without a legend and names the chart", async () => {
    const el = await fixture<LitMaterialLineChart>(html`<lit-material-line-chart label="Requests per second" unit="req/s" .series=${one}></lit-material-line-chart>`);
    const root = el.shadowRoot!;
    expect(root.querySelectorAll("polyline.line").length).to.equal(1);
    expect(root.querySelector(".legend")).to.be.null;
    const label = root.querySelector("svg")!.getAttribute("aria-label")!;
    expect(label).to.contain("Requests per second");
    expect(label).to.contain("latest 9 req/s");
    expect(label).to.contain("range 3 to 12");
  });

  it("starts the y axis at zero by default", async () => {
    const el = await fixture<LitMaterialLineChart>(html`<lit-material-line-chart .series=${[{ name: "a", points: [{ x: 0, y: 80 }, { x: 1, y: 90 }] }]}></lit-material-line-chart>`);
    const labels = [...el.shadowRoot!.querySelectorAll("text.axis")].map((t) => t.textContent);
    expect(labels).to.include("0");
  });

  it("gives several series a legend, direct labels and fixed colour slots", async () => {
    const el = await fixture<LitMaterialLineChart>(html`<lit-material-line-chart .series=${three}></lit-material-line-chart>`);
    const root = el.shadowRoot!;
    expect([...root.querySelectorAll(".legend li")].map((l) => l.textContent!.trim())).to.deep.equal(["api", "web", "admin"]);
    expect([...root.querySelectorAll("text.end-label")].map((t) => t.textContent)).to.deep.equal(["api", "web", "admin"]);
    const strokes = [...root.querySelectorAll("polyline.line")].map((l) => getComputedStyle(l).stroke);
    expect(new Set(strokes).size).to.equal(3);
    expect(root.querySelector("polyline.line")!.classList.contains("s1")).to.be.true;
  });

  it("drops direct labels past four series, keeps the legend", async () => {
    const five = Array.from({ length: 5 }, (_, k) => ({ name: `s${k}`, points: [{ x: 0, y: k }, { x: 1, y: k + 1 }] }));
    const el = await fixture<LitMaterialLineChart>(html`<lit-material-line-chart .series=${five}></lit-material-line-chart>`);
    expect(el.shadowRoot!.querySelectorAll("text.end-label").length).to.equal(0);
    expect(el.shadowRoot!.querySelectorAll(".legend li").length).to.equal(5);
  });

  it("moves a crosshair with the keyboard and reads every series there", async () => {
    const el = await fixture<LitMaterialLineChart>(html`<lit-material-line-chart unit="req/s" .series=${three}></lit-material-line-chart>`);
    el.shadowRoot!.querySelector("svg")!.focus();
    await sendKeys({ press: "Home" });
    await el.updateComplete;
    let tip = el.shadowRoot!.querySelector(".tooltip")!;
    expect(tip.textContent).to.contain("api: 0");
    await sendKeys({ press: "ArrowRight" });
    await el.updateComplete;
    tip = el.shadowRoot!.querySelector(".tooltip")!;
    expect(tip.querySelector(".tip-x")!.textContent).to.equal("1");
    expect(tip.textContent).to.contain("web: 3");
    expect(el.shadowRoot!.querySelectorAll("circle.marker").length).to.equal(3);
    await sendKeys({ press: "Escape" });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".tooltip")).to.be.null;
  });

  it("shows the hovered point", async () => {
    const el = await fixture<LitMaterialLineChart>(html`<lit-material-line-chart style="width: 600px" .series=${one}></lit-material-line-chart>`);
    const svgEl = el.shadowRoot!.querySelector("svg")!;
    const box = svgEl.getBoundingClientRect();
    svgEl.dispatchEvent(new PointerEvent("pointermove", { clientX: box.right - 14, clientY: box.top + 20, bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".tooltip")!.textContent).to.contain("9");
    svgEl.dispatchEvent(new PointerEvent("pointerleave"));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".tooltip")).to.be.null;
  });

  it("has a data table for screen readers", async () => {
    const el = await fixture<LitMaterialLineChart>(html`<lit-material-line-chart label="Load" .series=${three}></lit-material-line-chart>`);
    const table = el.shadowRoot!.querySelector("table")!;
    expect(table.querySelector("caption")!.textContent).to.equal("Load");
    expect([...table.querySelectorAll("thead th")].map((t) => t.textContent)).to.deep.equal(["x", "api", "web", "admin"]);
    expect(table.querySelectorAll("tbody tr").length).to.equal(3);
  });

  it("says when there's no data and ignores non-finite points", async () => {
    const el = await fixture<LitMaterialLineChart>(html`<lit-material-line-chart label="Load" .series=${[{ name: "a", points: [{ x: NaN, y: 1 }] }]}></lit-material-line-chart>`);
    expect(el.shadowRoot!.querySelector(".empty")!.getAttribute("aria-label")).to.equal("Load: no data");
  });

  it("follows its container's width", async () => {
    const el = await fixture<LitMaterialLineChart>(html`<lit-material-line-chart style="width: 320px" .series=${one}></lit-material-line-chart>`);
    const viewBox = () => el.shadowRoot!.querySelector("svg")!.getAttribute("viewBox")!;
    for (let i = 0; i < 30 && !viewBox().startsWith("0 0 320 "); i++) {
      await new Promise((r) => setTimeout(r, 20));
    }
    expect(viewBox()).to.match(/^0 0 320 /);
  });
});

describe("lit-material-sparkline", () => {
  it("draws the values and states its range", async () => {
    const el = await fixture<LitMaterialSparkline>(html`<lit-material-sparkline label="Errors" show-last .values=${[4, 1, 7, 3]}></lit-material-sparkline>`);
    const svgEl = el.shadowRoot!.querySelector("svg")!;
    expect(svgEl.getAttribute("aria-label")).to.equal("Errors: latest 3, from 1 to 7");
    expect(svgEl.querySelector("polyline")!.getAttribute("points")!.split(" ").length).to.equal(4);
    expect(svgEl.querySelector("circle")).to.exist;
  });

  it("handles no data and a single value", async () => {
    const empty = await fixture<LitMaterialSparkline>(html`<lit-material-sparkline label="x" .values=${[]}></lit-material-sparkline>`);
    expect(empty.shadowRoot!.querySelector("svg")!.getAttribute("aria-label")).to.equal("x: no data");
    const single = await fixture<LitMaterialSparkline>(html`<lit-material-sparkline .values=${[5]}></lit-material-sparkline>`);
    expect(single.shadowRoot!.querySelector("circle")).to.exist;
  });
});

describe("chart i18n and right to left", () => {
  it("formats default numbers in a locale", () => {
    expect([formatNumber(1500, "de-DE"), formatNumber(12500, "de-DE"), formatNumber(3.14159, "de-DE")]).to.deep.equal(["1500", "12,5k", "3,14"]);
    expect(formatNumber(12500, "en")).to.equal("12.5k");
  });

  it("translates the line chart's summary and readout", async () => {
    registerTranslation({
      $code: "x-line",
      "chart.lineChart": "Courbe",
      "chart.seriesSummary": "{name} : dernier {latest}, de {min} à {max}",
      "chart.nameValue": "{name} : {value}",
      "chart.nameInUnit": "{name} (en {unit})",
    });
    const wrap = await fixture<HTMLElement>(html`<div lang="x-line">
      <lit-material-line-chart unit="req/s" .series=${three}></lit-material-line-chart>
    </div>`);
    const el = wrap.querySelector<LitMaterialLineChart>("lit-material-line-chart")!;
    await el.updateComplete;
    const svgEl = el.shadowRoot!.querySelector("svg")!;
    expect(svgEl.getAttribute("aria-label")).to.match(/^Courbe\. api : dernier 2 req\/s, de 0 à 2; web/);
    expect([...el.shadowRoot!.querySelectorAll("thead th")].map((t) => t.textContent!.trim())[1]).to.equal("api (en req/s)");
    svgEl.focus();
    await sendKeys({ press: "Home" });
    await el.updateComplete;
    const row = el.shadowRoot!.querySelectorAll(".tip-row")[1]!;
    expect(row.textContent!.replace(/\s+/g, " ").trim()).to.equal("web : 1 req/s");
    expect(row.querySelector("strong")!.textContent).to.equal("1");
  });

  it("keeps the line chart's x axis left to right, right to left", async () => {
    const wrap = await fixture<HTMLElement>(html`<div dir="rtl" style="width: 600px">
      <lit-material-line-chart .series=${three}></lit-material-line-chart>
    </div>`);
    const el = wrap.querySelector<LitMaterialLineChart>("lit-material-line-chart")!;
    await el.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await el.updateComplete;
    const svgEl = el.shadowRoot!.querySelector("svg")!;
    const box = svgEl.getBoundingClientRect();
    const xLabels = [...el.shadowRoot!.querySelectorAll<SVGTextElement>("text.axis")].filter((t) => Number(t.getAttribute("y")) > 100);
    const first = xLabels[0]!.getBoundingClientRect();
    const last = xLabels[xLabels.length - 1]!.getBoundingClientRect();
    expect(xLabels[0]!.textContent).to.equal("0");
    expect(first.left).to.be.at.least(box.left - 1); // anchored at its start, inside the plot
    expect(first.right).to.be.below(last.left);
    expect(last.right).to.be.at.most(box.right + 1);
    // The legend follows the reading direction: the first series is on the right.
    const items = [...el.shadowRoot!.querySelectorAll(".legend li")].map((li) => li.getBoundingClientRect());
    expect(items[0]!.left).to.be.above(items[1]!.left);
    // ArrowRight still moves the crosshair right, to a later x.
    svgEl.focus();
    await sendKeys({ press: "Home" });
    await sendKeys({ press: "ArrowRight" });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".tip-x")!.textContent).to.equal("1");
  });

  it("translates the sparkline's description", async () => {
    registerTranslation({ $code: "x-spark", "chart.trend": "Tendance", "chart.sparklineSummary": "{name} — {latest} ({min}–{max})" });
    const wrap = await fixture<HTMLElement>(html`<div lang="x-spark"><lit-material-sparkline .values=${[1, 7, 3]}></lit-material-sparkline></div>`);
    const el = wrap.querySelector<LitMaterialSparkline>("lit-material-sparkline")!;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("svg")!.getAttribute("aria-label")).to.equal("Tendance — 3 (1–7)");
  });
});
