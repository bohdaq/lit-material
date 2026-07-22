import { expect, fixture, html } from "@open-wc/testing";
import "./description-list.js";
import "./description-list-group.js";
import type { LitMaterialDescriptionList } from "./description-list.js";

describe("lit-material-description-list", () => {
  it("sets role=list on its container", async () => {
    const el = await fixture<LitMaterialDescriptionList>(html`
      <lit-material-description-list>
        <lit-material-description-list-group>
          <span slot="term">Status</span>
          Active
        </lit-material-description-list-group>
      </lit-material-description-list>
    `);
    expect(el.shadowRoot!.querySelector('[role="list"]')).to.exist;
  });

  it("defaults to not horizontal", async () => {
    const el = await fixture<LitMaterialDescriptionList>(html`<lit-material-description-list></lit-material-description-list>`);
    expect(el.hasAttribute("horizontal")).to.be.false;
  });

  it("reflects horizontal", async () => {
    const el = await fixture<LitMaterialDescriptionList>(
      html`<lit-material-description-list horizontal></lit-material-description-list>`,
    );
    expect(el.hasAttribute("horizontal")).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialDescriptionList>(html`
      <lit-material-description-list>
        <lit-material-description-list-group>
          <span slot="term">Status</span>
          Active
        </lit-material-description-list-group>
        <lit-material-description-list-group>
          <span slot="term">Owner</span>
          Jane Doe
        </lit-material-description-list-group>
      </lit-material-description-list>
    `);
    await expect(el).to.be.accessible();
  });
});
