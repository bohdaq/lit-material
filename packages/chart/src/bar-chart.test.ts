import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./bar-chart.js";
import type { LitMaterialBarChart } from "./bar-chart.js";

const data = [
  { name: "nginx", value: 90000 },
  { name: "rws", value: 120000 },
  { name: "caddy", value: 60000 },
];

describe("lit-material-bar-chart", () => {
  it("draws one row per item on a shared scale", async () => {
    const el = await fixture<LitMaterialBarChart>(html`<lit-material-bar-chart label="RPS" unit="req/s" .data=${data}></lit-material-bar-chart>`);
    const rows = el.shadowRoot!.querySelectorAll(".row");
    expect(rows.length).to.equal(3);
    const f = [...rows].map((r) => (r.querySelector(".track") as HTMLElement).style.getPropertyValue("--f"));
    expect(f).to.deep.equal(["0.7500", "1.0000", "0.5000"]);
    expect(el.shadowRoot!.querySelectorAll(".value").length).to.equal(3, "every bar labelled without highlight");
  });

  it("names the chart with every value", async () => {
    const el = await fixture<LitMaterialBarChart>(html`<lit-material-bar-chart label="RPS" unit="req/s" .data=${data}></lit-material-bar-chart>`);
    const label = el.shadowRoot!.querySelector(".chart")!.getAttribute("aria-label")!;
    expect(label).to.equal("RPS. nginx: 90k req/s; rws: 120k req/s; caddy: 60k req/s");
    expect(el.shadowRoot!.querySelectorAll("tbody tr").length).to.equal(3);
  });

  it("emphasises the highlighted item and labels only it", async () => {
    const el = await fixture<LitMaterialBarChart>(html`<lit-material-bar-chart highlight="rws" .data=${data}></lit-material-bar-chart>`);
    const root = el.shadowRoot!;
    expect(root.querySelectorAll(".row.highlight").length).to.equal(1);
    expect(root.querySelectorAll(".row.muted").length).to.equal(2);
    const values = root.querySelectorAll(".value");
    expect(values.length).to.equal(1);
    expect(values[0]!.textContent).to.equal("120k");
  });

  it("ignores a highlight that matches nothing", async () => {
    const el = await fixture<LitMaterialBarChart>(html`<lit-material-bar-chart highlight="iis" .data=${data}></lit-material-bar-chart>`);
    expect(el.shadowRoot!.querySelectorAll(".row.muted").length).to.equal(0);
  });

  it("sorts on request", async () => {
    const el = await fixture<LitMaterialBarChart>(html`<lit-material-bar-chart sort="desc" .data=${data}></lit-material-bar-chart>`);
    const names = [...el.shadowRoot!.querySelectorAll(".name")].map((n) => n.textContent);
    expect(names).to.deep.equal(["rws", "nginx", "caddy"]);
    expect(data[0]!.name).to.equal("nginx", "input left alone");
  });

  it("reads bars with the keyboard", async () => {
    const el = await fixture<LitMaterialBarChart>(html`<lit-material-bar-chart unit="req/s" .data=${data}></lit-material-bar-chart>`);
    (el.shadowRoot!.querySelector(".chart") as HTMLElement).focus();
    await sendKeys({ press: "ArrowDown" });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".tooltip")!.textContent!.replace(/\s+/g, " ").trim()).to.equal("nginx: 90k req/s");
    await sendKeys({ press: "End" });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".tooltip")!.textContent).to.contain("caddy");
    await sendKeys({ press: "Escape" });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".tooltip")).to.be.null;
  });

  it("shows the value on hover", async () => {
    const el = await fixture<LitMaterialBarChart>(html`<lit-material-bar-chart highlight="rws" .data=${data}></lit-material-bar-chart>`);
    el.shadowRoot!.querySelectorAll(".row")[2]!.dispatchEvent(new PointerEvent("pointerenter"));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".tooltip")!.textContent).to.contain("caddy");
  });

  it("skips non-finite values, draws negatives as zero, and handles no data", async () => {
    const el = await fixture<LitMaterialBarChart>(html`<lit-material-bar-chart .data=${[{ name: "a", value: NaN }, { name: "b", value: -3 }, { name: "c", value: 2 }]}></lit-material-bar-chart>`);
    const tracks = [...el.shadowRoot!.querySelectorAll(".track")] as HTMLElement[];
    expect(tracks.map((t) => t.style.getPropertyValue("--f"))).to.deep.equal(["0.0000", "1.0000"]);
    el.data = [];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".empty")).to.not.be.null;
  });

  it("translates its text and formats numbers in the element's language", async () => {
    registerTranslation({
      $code: "x-bar",
      "chart.barChart": "Diagramme",
      "chart.nameValue": "{name} = {value}",
      "chart.listSeparator": " | ",
      "chart.valueInUnit": "Valeur ({unit})",
      "chart.noData": "Aucune donnée",
    });
    const wrap = await fixture<HTMLElement>(html`<div lang="x-bar">
      <lit-material-bar-chart unit="req/s" .data=${[{ name: "a", value: 1.5 }, { name: "b", value: 2 }]}></lit-material-bar-chart>
      <lit-material-bar-chart></lit-material-bar-chart>
    </div>`);
    const [el, empty] = Array.from(wrap.querySelectorAll<LitMaterialBarChart>("lit-material-bar-chart"));
    await el!.updateComplete;
    const chart = el!.shadowRoot!.querySelector(".chart")!;
    expect(chart.getAttribute("aria-label")).to.equal("Diagramme. a = 1.5 req/s | b = 2 req/s");
    expect(el!.shadowRoot!.querySelectorAll("thead th")[1]!.textContent!.trim()).to.equal("Valeur (req/s)");
    expect(empty!.shadowRoot!.querySelector(".empty")!.textContent!.trim()).to.equal("Aucune donnée");
    (chart as HTMLElement).focus();
    await sendKeys({ press: "ArrowDown" });
    await el!.updateComplete;
    const tip = el!.shadowRoot!.querySelector(".tooltip")!;
    expect(tip.textContent!.replace(/\s+/g, " ").trim()).to.equal("a = 1.5 req/s");
    expect(tip.querySelector("strong")!.textContent).to.equal("1.5 req/s");

    wrap.setAttribute("lang", "de-DE");
    el!.requestUpdate();
    await el!.updateComplete;
    expect(el!.shadowRoot!.querySelector(".value")!.textContent).to.equal("1,5 req/s");
  });

  it("grows bars from the right, right to left", async () => {
    const wrap = await fixture<HTMLElement>(html`<div dir="rtl" style="width: 400px">
      <lit-material-bar-chart .data=${[{ name: "a", value: 1 }, { name: "b", value: 2 }]}></lit-material-bar-chart>
    </div>`);
    const el = wrap.querySelector<LitMaterialBarChart>("lit-material-bar-chart")!;
    await el.updateComplete;
    const row = el.shadowRoot!.querySelector(".row")!;
    const name = row.querySelector(".name")!.getBoundingClientRect();
    const track = row.querySelector(".track")!.getBoundingClientRect();
    const bar = row.querySelector(".bar")!.getBoundingClientRect();
    const value = row.querySelector(".value")!.getBoundingClientRect();
    expect(name.left).to.be.at.least(track.right); // the name column is on the right
    expect(bar.right).to.be.closeTo(track.right, 1);
    expect(value.right).to.be.at.most(bar.left);
  });
});
