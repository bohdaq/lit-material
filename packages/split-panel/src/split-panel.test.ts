import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./split-panel.js";
import type { LitMaterialSplitPanel } from "./split-panel.js";

const panel = (attrs = html``) =>
  fixture<LitMaterialSplitPanel>(html`<lit-material-split-panel style="width: 1000px; height: 300px" label="Request">
    <div slot="start">Request</div><div slot="end">Response</div>${attrs}
  </lit-material-split-panel>`);
const divider = (el: LitMaterialSplitPanel) => el.shadowRoot!.querySelector<HTMLElement>("[role=separator]")!;
const startWidth = (el: LitMaterialSplitPanel) => el.shadowRoot!.querySelector<HTMLElement>(".pane")!.getBoundingClientRect().width;

describe("lit-material-split-panel", () => {
  it("splits by position and is a labelled separator", async () => {
    const el = await panel();
    expect(Math.round(startWidth(el))).to.equal(496); // (1000 - 8) / 2
    const d = divider(el);
    expect(d.getAttribute("aria-label")).to.equal("Request");
    expect(d.getAttribute("aria-valuenow")).to.equal("50");
    expect(d.getAttribute("aria-orientation")).to.equal("vertical");
  });

  it("moves with the arrow keys, Shift for ten", async () => {
    const el = await panel();
    divider(el).focus();
    await sendKeys({ press: "ArrowRight" });
    expect(el.position).to.equal(51);
    const listener = oneEvent(el, "change");
    await sendKeys({ press: "Shift+ArrowLeft" });
    expect((await listener).detail.position).to.equal(41);
  });

  it("stays within min and max; Home and End go there", async () => {
    const el = await panel();
    el.min = 20;
    el.max = 70;
    divider(el).focus();
    await sendKeys({ press: "End" });
    expect(el.position).to.equal(70);
    await sendKeys({ press: "Shift+ArrowRight" });
    expect(el.position).to.equal(70);
    await sendKeys({ press: "Home" });
    expect(el.position).to.equal(20);
  });

  it("collapses and restores with Enter", async () => {
    const el = await panel();
    el.position = 60;
    await el.updateComplete;
    divider(el).focus();
    await sendKeys({ press: "Enter" });
    expect(el.position).to.equal(10);
    await sendKeys({ press: "Enter" });
    expect(el.position).to.equal(60);
  });

  it("follows a pointer drag", async () => {
    const el = await panel();
    const d = divider(el);
    const box = el.getBoundingClientRect();
    const fire = (type: string, x: number) =>
      d.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, clientX: x, clientY: box.top + 10, pointerId: 1, button: 0 }));
    const listener = oneEvent(el, "change");
    fire("pointerdown", box.left + 500);
    fire("pointermove", box.left + 300);
    fire("pointerup", box.left + 300);
    expect((await listener).detail.position).to.equal(30);
  });

  it("stacks when vertical", async () => {
    const el = await panel();
    el.orientation = "vertical";
    await el.updateComplete;
    expect(divider(el).getAttribute("aria-orientation")).to.equal("horizontal");
    divider(el).focus();
    await sendKeys({ press: "ArrowDown" });
    expect(el.position).to.equal(51);
  });

  it("translates its default label, and an explicit label wins", async () => {
    registerTranslation({ $code: "x-split", "splitPanel.resizePanes": "Redimensionner" });
    const wrap = await fixture<HTMLElement>(html`<div lang="x-split"><lit-material-split-panel></lit-material-split-panel></div>`);
    const el = wrap.querySelector<LitMaterialSplitPanel>("lit-material-split-panel")!;
    await el.updateComplete;
    expect(divider(el).getAttribute("aria-label")).to.equal("Redimensionner");
    el.label = "Request";
    await el.updateComplete;
    expect(divider(el).getAttribute("aria-label")).to.equal("Request");
  });

  it("mirrors arrow keys and dragging right to left", async () => {
    const wrap = await fixture<HTMLElement>(html`<div dir="rtl"><lit-material-split-panel style="width: 1000px; height: 300px">
      <div slot="start">A</div><div slot="end">B</div>
    </lit-material-split-panel></div>`);
    const el = wrap.querySelector<LitMaterialSplitPanel>("lit-material-split-panel")!;
    divider(el).focus();
    await sendKeys({ press: "ArrowLeft" });
    expect(el.position).to.equal(51);
    const d = divider(el);
    const box = el.getBoundingClientRect();
    const fire = (type: string, x: number) =>
      d.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, clientX: x, clientY: box.top + 10, pointerId: 1, button: 0 }));
    fire("pointerdown", box.right - 500);
    fire("pointermove", box.right - 300);
    fire("pointerup", box.right - 300);
    expect(el.position).to.equal(30);
  });
});
