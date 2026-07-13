import { expect, fixture, html } from "@open-wc/testing";
import "./list.js";
import "./list-item.js";
import type { LitMaterialList } from "./list.js";

describe("lit-material-list", () => {
  it("renders a container with role=list containing its slotted items", async () => {
    const el = await fixture<LitMaterialList>(html`
      <lit-material-list>
        <lit-material-list-item>One</lit-material-list-item>
        <lit-material-list-item>Two</lit-material-list-item>
      </lit-material-list>
    `);
    expect(el.shadowRoot!.querySelector('[role="list"]')).to.exist;
    expect(el.querySelectorAll("lit-material-list-item")).to.have.lengthOf(2);
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialList>(html`
      <lit-material-list>
        <lit-material-list-item>One</lit-material-list-item>
      </lit-material-list>
    `);
    await expect(el).to.be.accessible();
  });
});
