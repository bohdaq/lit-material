import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { setViewport } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./index.js";
import type { LitMaterialStatusBar, LitMaterialStatusBarItem } from "./index.js";

async function bar() {
  return fixture<LitMaterialStatusBar>(html`
    <lit-material-status-bar>
      <lit-material-status-bar-item>shop-api/orders/create-order.yaml</lit-material-status-bar-item>
      <lit-material-status-bar-item tone="warning">Unsaved</lit-material-status-bar-item>
      <lit-material-status-bar-item slot="end" button description="Show keyboard shortcuts">? Shortcuts</lit-material-status-bar-item>
      <lit-material-status-bar-item slot="end" href="#tls">TLS 1.3</lit-material-status-bar-item>
    </lit-material-status-bar>
  `);
}

const items = (el: LitMaterialStatusBar) => [...el.querySelectorAll<LitMaterialStatusBarItem>("lit-material-status-bar-item")];
const inner = (i: LitMaterialStatusBarItem) => i.shadowRoot!.querySelector<HTMLElement>('[part="item"]')!;

describe("lit-material-status-bar", () => {
  after(() => setViewport({ width: 800, height: 600 }));

  it("is a labelled region, 28px tall, items at the start and the end", async () => {
    await setViewport({ width: 1200, height: 600 });
    const el = await bar();
    const region = el.shadowRoot!.querySelector('[part="bar"]')!;
    expect(region.getAttribute("role")).to.equal("region");
    expect(region.getAttribute("aria-label")).to.equal("Status");
    expect(el.getBoundingClientRect().height).to.be.within(28, 30);
    const [file, , , tls] = items(el);
    expect(tls.getBoundingClientRect().left).to.be.greaterThan(file.getBoundingClientRect().right + 200);
    await expect(el).to.be.accessible();
  });

  it("items are text, a button or a link", async () => {
    const el = await bar();
    expect(items(el).map((i) => inner(i).localName)).to.deep.equal(["span", "span", "button", "a"]);
    const shortcuts = items(el)[2];
    expect(inner(shortcuts).title).to.equal("Show keyboard shortcuts");
    setTimeout(() => inner(shortcuts).click());
    await oneEvent(shortcuts, "click");
    expect(inner(items(el)[3]).getAttribute("href")).to.equal("#tls");
  });

  it("tone colours an item", async () => {
    const el = await bar();
    const [file, unsaved] = items(el);
    expect(getComputedStyle(inner(unsaved)).color).not.to.equal(getComputedStyle(inner(file)).color);
  });

  it("wraps on a phone instead of clipping", async () => {
    await setViewport({ width: 320, height: 600 });
    const el = await bar();
    expect(el.getBoundingClientRect().height).to.be.greaterThan(30);
    expect(el.scrollWidth).to.be.at.most(el.clientWidth + 1);
  });

  it("translates its default name", async () => {
    registerTranslation({ $code: "x-status-bar", "statusBar.label": "Statut" });
    const wrapper = await fixture<HTMLDivElement>(html`<div lang="x-status-bar"><lit-material-status-bar></lit-material-status-bar></div>`);
    const el = wrapper.querySelector<LitMaterialStatusBar>("lit-material-status-bar")!;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[part="bar"]')!.getAttribute("aria-label")).to.equal("Statut");
  });
});
