import { expect, fixture, html } from "@open-wc/testing";
import "./tabs.js";
import "./tab.js";
import "./tab-panel.js";
import type { LitMaterialTabs } from "./tabs.js";

async function panelsFixture() {
  const root = await fixture<HTMLDivElement>(html`
    <div>
      <lit-material-tabs>
        <lit-material-tab>One</lit-material-tab>
        <lit-material-tab>Two</lit-material-tab>
      </lit-material-tabs>
      <lit-material-tab-panel selected>First</lit-material-tab-panel>
      <lit-material-tab-panel>Second</lit-material-tab-panel>
    </div>
  `);
  const el = root.querySelector<LitMaterialTabs>("lit-material-tabs")!;
  await el.updateComplete;
  await new Promise((r) => setTimeout(r));
  const tabs = Array.from(root.querySelectorAll("lit-material-tab"));
  const panels = Array.from(root.querySelectorAll("lit-material-tab-panel"));
  return { el, tabs, panels };
}

describe("lit-material-tab-panel", () => {
  it("has role=tabpanel and is a tab stop", async () => {
    const { panels } = await panelsFixture();
    expect(panels[0]!.getAttribute("role")).to.equal("tabpanel");
    expect(panels[0]!.getAttribute("tabindex")).to.equal("0");
  });

  it("shows only the panel of the selected tab", async () => {
    const { panels } = await panelsFixture();
    expect(getComputedStyle(panels[0]!).display).to.equal("block");
    expect(getComputedStyle(panels[1]!).display).to.equal("none");
  });

  it("follows the selection on click", async () => {
    const { el, tabs, panels } = await panelsFixture();
    tabs[1]!.click();
    await el.updateComplete;
    await panels[1]!.updateComplete;
    expect(panels[0]!.selected).to.be.false;
    expect(panels[1]!.selected).to.be.true;
    expect(getComputedStyle(panels[1]!).display).to.equal("block");
  });

  it("wires aria-labelledby and aria-controls", async () => {
    const { tabs, panels } = await panelsFixture();
    expect(tabs[1]!.id).to.not.equal("");
    expect(panels[1]!.getAttribute("aria-labelledby")).to.equal(tabs[1]!.id);
    expect(tabs[1]!.ariaControls).to.equal(panels[1]!.id);
  });

  it("keeps author ids", async () => {
    const root = await fixture<HTMLDivElement>(html`
      <div>
        <lit-material-tabs><lit-material-tab id="t">A</lit-material-tab></lit-material-tabs>
        <lit-material-tab-panel id="p">A</lit-material-tab-panel>
      </div>
    `);
    await root.querySelector<LitMaterialTabs>("lit-material-tabs")!.updateComplete;
    await new Promise((r) => setTimeout(r));
    expect(root.querySelector("#p")!.getAttribute("aria-labelledby")).to.equal("t");
    expect(root.querySelector("lit-material-tab")!.ariaControls).to.equal("p");
  });

  it("leaves panels after a second tabs element to that one", async () => {
    const root = await fixture<HTMLDivElement>(html`
      <div>
        <lit-material-tabs><lit-material-tab>A</lit-material-tab></lit-material-tabs>
        <lit-material-tab-panel>A</lit-material-tab-panel>
        <lit-material-tabs selected="1">
          <lit-material-tab>B</lit-material-tab>
          <lit-material-tab>C</lit-material-tab>
        </lit-material-tabs>
        <lit-material-tab-panel>B</lit-material-tab-panel>
        <lit-material-tab-panel>C</lit-material-tab-panel>
      </div>
    `);
    await new Promise((r) => setTimeout(r, 50));
    const panels = Array.from(root.querySelectorAll("lit-material-tab-panel"));
    expect(panels.map((p) => p.selected)).to.deep.equal([true, false, true]);
  });
});
