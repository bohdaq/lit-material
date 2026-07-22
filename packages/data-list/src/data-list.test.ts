import { expect, fixture, html } from "@open-wc/testing";
import "./data-list.js";
import "./data-list-item.js";
import "./data-list-cell.js";
import type { LitMaterialDataList } from "./data-list.js";

describe("lit-material-data-list", () => {
  it("wraps its items in a ul", async () => {
    const el = await fixture<LitMaterialDataList>(html`
      <lit-material-data-list>
        <lit-material-data-list-item>
          <lit-material-data-list-cell fill>Row 1</lit-material-data-list-cell>
        </lit-material-data-list-item>
      </lit-material-data-list>
    `);
    expect(el.shadowRoot!.querySelector("ul")).to.exist;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialDataList>(html`
      <lit-material-data-list>
        <lit-material-data-list-item>
          <lit-material-data-list-cell fill>Row 1</lit-material-data-list-cell>
        </lit-material-data-list-item>
        <lit-material-data-list-item>
          <lit-material-data-list-cell fill>Row 2</lit-material-data-list-cell>
        </lit-material-data-list-item>
      </lit-material-data-list>
    `);
    await expect(el).to.be.accessible();
  });
});
