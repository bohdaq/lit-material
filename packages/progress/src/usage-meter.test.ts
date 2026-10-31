import { expect, fixture, html } from "@open-wc/testing";
import "./usage-meter.js";
import type { LitMaterialUsageMeter } from "./usage-meter.js";

const meter = (value: number, max: number) =>
  fixture<LitMaterialUsageMeter>(
    html`<lit-material-usage-meter label="CPU" unit="cores" .value=${value} .max=${max}></lit-material-usage-meter>`,
  );

describe("lit-material-usage-meter", () => {
  it("shows the value and limit and fills the bar", async () => {
    const el = await meter(1, 4);
    const root = el.shadowRoot!;
    expect(root.querySelector(".value")!.textContent!.trim()).to.equal("1 of 4 cores");
    expect((root.querySelector(".indicator") as HTMLElement).style.width).to.equal("25%");
    expect(el.level).to.equal("");
    expect(el.hasAttribute("level")).to.be.true;
  });

  it("is a labelled meter with value text", async () => {
    const el = await meter(1, 4);
    const bar = el.shadowRoot!.querySelector("[role=meter]")!;
    expect(bar.getAttribute("aria-valuenow")).to.equal("1");
    expect(bar.getAttribute("aria-valuemax")).to.equal("4");
    expect(bar.getAttribute("aria-valuetext")).to.equal("1 of 4 cores, 25%");
    expect(el.shadowRoot!.getElementById(bar.getAttribute("aria-labelledby")!)!.textContent).to.equal("CPU");
  });

  it("warns near the limit in words as well as colour", async () => {
    const el = await meter(3.4, 4);
    expect(el.getAttribute("level")).to.equal("warning");
    expect(el.shadowRoot!.querySelector(".state")!.textContent).to.equal("near limit");
  });

  it("is critical at the critical fraction and over the limit", async () => {
    const el = await meter(3.9, 4);
    expect(el.level).to.equal("critical");
    el.value = 5;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".state")!.textContent).to.equal("over limit");
    expect((el.shadowRoot!.querySelector(".indicator") as HTMLElement).style.width).to.equal("100%");
    expect(el.shadowRoot!.querySelector("[role=meter]")!.getAttribute("aria-valuenow")).to.equal("4");
  });

  it("honours custom thresholds", async () => {
    const el = await meter(2, 4);
    el.warning = 0.5;
    await el.updateComplete;
    expect(el.level).to.equal("warning");
  });

  it("shows no bar without a limit", async () => {
    const el = await meter(7, 0);
    expect(el.shadowRoot!.querySelector("[role=meter]")).to.be.null;
    expect(el.shadowRoot!.querySelector(".value")!.textContent!.trim()).to.equal("7 cores, no limit");
  });

  it("uses a custom format", async () => {
    const el = await meter(1536, 4096);
    el.unit = "";
    el.format = (n) => `${n / 1024} GiB`;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".value")!.textContent!.trim()).to.equal("1.5 GiB of 4 GiB");
  });
});
