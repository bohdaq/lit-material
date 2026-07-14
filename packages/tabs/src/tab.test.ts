import { expect, fixture, html } from "@open-wc/testing";
import "./tab.js";
import type { LitMaterialTab } from "./tab.js";

describe("lit-material-tab", () => {
  it("renders a native button with role=tab", async () => {
    const el = await fixture<LitMaterialTab>(html`<lit-material-tab>One</lit-material-tab>`);
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.getAttribute("role")).to.equal("tab");
  });

  it("defaults to unselected with tabindex=-1", async () => {
    const el = await fixture<LitMaterialTab>(html`<lit-material-tab>One</lit-material-tab>`);
    const button = el.shadowRoot!.querySelector("button")!;
    expect(el.selected).to.be.false;
    expect(button.getAttribute("aria-selected")).to.equal("false");
    expect(button.tabIndex).to.equal(-1);
  });

  it("reflects selected to aria-selected and tabindex=0", async () => {
    const el = await fixture<LitMaterialTab>(html`<lit-material-tab selected>One</lit-material-tab>`);
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.getAttribute("aria-selected")).to.equal("true");
    expect(button.tabIndex).to.equal(0);
  });

  it("reflects the disabled property to the attribute and disables the inner button", async () => {
    const el = await fixture<LitMaterialTab>(html`<lit-material-tab disabled>One</lit-material-tab>`);
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("button")!.disabled).to.be.true;
  });

  it("forwards aria-controls to the inner button", async () => {
    const el = await fixture<LitMaterialTab>(
      html`<lit-material-tab aria-controls="panel-1">One</lit-material-tab>`,
    );
    expect(el.shadowRoot!.querySelector("button")!.getAttribute("aria-controls")).to.equal("panel-1");
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialTab>(html`<lit-material-tab>One</lit-material-tab>`);
    const button = el.shadowRoot!.querySelector("button")!;
    const rect = button.getBoundingClientRect();
    button.dispatchEvent(
      new PointerEvent("pointerdown", {
        button: 0,
        clientX: rect.x + 1,
        clientY: rect.y + 1,
        bubbles: true,
        composed: true,
      }),
    );
    const stateLayer = el.shadowRoot!.querySelector(".state-layer")!;
    expect(stateLayer.hasAttribute("data-pressed")).to.be.true;
  });

  it("passes axe accessibility checks within a role=tablist ancestor", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div role="tablist"><lit-material-tab selected>One</lit-material-tab></div>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
