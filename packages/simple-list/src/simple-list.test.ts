import { expect, fixture, html } from "@open-wc/testing";
import "./simple-list.js";
import "./simple-list-item.js";
import type { LitMaterialSimpleList } from "./simple-list.js";

describe("lit-material-simple-list", () => {
  it("wraps its items in a ul", async () => {
    const el = await fixture<LitMaterialSimpleList>(html`
      <lit-material-simple-list>
        <lit-material-simple-list-item href="/a">A</lit-material-simple-list-item>
      </lit-material-simple-list>
    `);
    expect(el.shadowRoot!.querySelector("ul")).to.exist;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialSimpleList>(html`
      <lit-material-simple-list>
        <lit-material-simple-list-item href="/a">A</lit-material-simple-list-item>
        <lit-material-simple-list-item href="/b" current>B</lit-material-simple-list-item>
      </lit-material-simple-list>
    `);
    await expect(el).to.be.accessible();
  });
});
