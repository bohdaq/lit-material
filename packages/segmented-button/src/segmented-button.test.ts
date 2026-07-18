import { expect, fixture, html } from "@open-wc/testing";
import "./segmented-button.js";
import type { LitMaterialSegmentedButton } from "./segmented-button.js";

describe("lit-material-segmented-button", () => {
  it("renders a native button with aria-pressed reflecting selected", async () => {
    const el = await fixture<LitMaterialSegmentedButton>(
      html`<lit-material-segmented-button>Day</lit-material-segmented-button>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    expect(el.selected).to.be.false;
    expect(button.getAttribute("aria-pressed")).to.equal("false");
  });

  it("reflects selected to aria-pressed and shows a checkmark instead of the icon slot", async () => {
    const el = await fixture<LitMaterialSegmentedButton>(
      html`<lit-material-segmented-button selected>Day</lit-material-segmented-button>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.getAttribute("aria-pressed")).to.equal("true");
    expect(el.shadowRoot!.querySelector(".checkmark")).to.exist;
    expect(el.shadowRoot!.querySelector("slot[name='icon']")).to.not.exist;
  });

  it("reflects the disabled property to the attribute and disables the inner button", async () => {
    const el = await fixture<LitMaterialSegmentedButton>(
      html`<lit-material-segmented-button disabled>Day</lit-material-segmented-button>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("button")!.disabled).to.be.true;
  });

  it("gives the inner button tabindex=0 only when active", async () => {
    const el = await fixture<LitMaterialSegmentedButton>(
      html`<lit-material-segmented-button>Day</lit-material-segmented-button>`,
    );
    expect(el.shadowRoot!.querySelector("button")!.tabIndex).to.equal(-1);

    el.active = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("button")!.tabIndex).to.equal(0);
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialSegmentedButton>(
      html`<lit-material-segmented-button>Day</lit-material-segmented-button>`,
    );
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

  it("passes axe accessibility checks within a role=group ancestor", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div role="group"><lit-material-segmented-button selected active>Day</lit-material-segmented-button></div>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
