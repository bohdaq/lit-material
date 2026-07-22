import { expect, fixture, html } from "@open-wc/testing";
import "./description-list-group.js";
import type { LitMaterialDescriptionListGroup } from "./description-list-group.js";

describe("lit-material-description-list-group", () => {
  it("sets role=listitem on itself", async () => {
    const el = await fixture<LitMaterialDescriptionListGroup>(html`
      <lit-material-description-list-group>
        <span slot="term">Status</span>
        Active
      </lit-material-description-list-group>
    `);
    expect(el.getAttribute("role")).to.equal("listitem");
  });

  it("renders term/definition roles in its shadow root", async () => {
    const el = await fixture<LitMaterialDescriptionListGroup>(html`
      <lit-material-description-list-group>
        <span slot="term">Status</span>
        Active
      </lit-material-description-list-group>
    `);
    expect(el.shadowRoot!.querySelector('[role="term"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[role="definition"]')).to.exist;
  });

  it("has no box of its own (display: contents)", async () => {
    const el = await fixture<LitMaterialDescriptionListGroup>(html`
      <lit-material-description-list-group>
        <span slot="term">Status</span>
        Active
      </lit-material-description-list-group>
    `);
    expect(getComputedStyle(el).display).to.equal("contents");
  });

  it("passes axe accessibility checks (wrapped in a role=list — listitem needs a list ancestor)", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div role="list">
        <lit-material-description-list-group>
          <span slot="term">Status</span>
          Active
        </lit-material-description-list-group>
      </div>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
