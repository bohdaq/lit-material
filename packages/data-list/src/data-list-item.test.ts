import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./data-list-item.js";
import type { LitMaterialDataListItem } from "./data-list-item.js";

describe("lit-material-data-list-item", () => {
  it("sets role=listitem on itself", async () => {
    const el = await fixture<LitMaterialDataListItem>(html`<lit-material-data-list-item>Row</lit-material-data-list-item>`);
    expect(el.getAttribute("role")).to.equal("listitem");
  });

  it("renders a plain row when not expandable", async () => {
    const el = await fixture<LitMaterialDataListItem>(html`<lit-material-data-list-item>Row</lit-material-data-list-item>`);
    expect(el.shadowRoot!.querySelector("details")).to.not.exist;
    expect(el.shadowRoot!.querySelector("div.row")).to.exist;
  });

  it("renders a details/summary when expandable", async () => {
    const el = await fixture<LitMaterialDataListItem>(html`
      <lit-material-data-list-item expandable>
        Row
        <span slot="expanded-content">Extra</span>
      </lit-material-data-list-item>
    `);
    const details = el.shadowRoot!.querySelector("details");
    expect(details).to.exist;
    expect(details!.open).to.be.false;
  });

  it("opens the details when open is set, and fires toggle when toggled natively", async () => {
    const el = await fixture<LitMaterialDataListItem>(html`
      <lit-material-data-list-item expandable open>
        Row
        <span slot="expanded-content">Extra</span>
      </lit-material-data-list-item>
    `);
    const details = el.shadowRoot!.querySelector("details")!;
    expect(details.open).to.be.true;

    const toggled = oneEvent(el, "toggle");
    details.open = false;
    details.dispatchEvent(new Event("toggle"));
    await toggled;
    expect(el.open).to.be.false;
  });

  it("reflects selected", async () => {
    const el = await fixture<LitMaterialDataListItem>(html`<lit-material-data-list-item selected>Row</lit-material-data-list-item>`);
    expect(el.hasAttribute("selected")).to.be.true;
  });

  it("passes axe accessibility checks (wrapped in a ul — listitem needs a list ancestor)", async () => {
    const wrapper = await fixture<HTMLUListElement>(html`
      <ul>
        <lit-material-data-list-item>Row 1</lit-material-data-list-item>
        <lit-material-data-list-item expandable>
          Row 2
          <span slot="expanded-content">Extra</span>
        </lit-material-data-list-item>
      </ul>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
