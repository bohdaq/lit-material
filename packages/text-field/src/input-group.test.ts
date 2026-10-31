import { expect, fixture, html } from "@open-wc/testing";
import "./input-group.js";
import "./text-field.js";
import type { LitMaterialInputGroup } from "./input-group.js";

const corners = (el: Element) => {
  const s = getComputedStyle(el.shadowRoot!.querySelector(".container")!);
  return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius];
};

describe("lit-material-input-group", () => {
  it("is a group", async () => {
    const el = await fixture<LitMaterialInputGroup>(html`<lit-material-input-group aria-label="Endpoint"></lit-material-input-group>`);
    expect(el.getAttribute("role")).to.equal("group");
  });

  it("squares the inner corners and keeps the outer ones", async () => {
    const el = await fixture<LitMaterialInputGroup>(html`<lit-material-input-group>
      <lit-material-text-field variant="outlined" label="Host"></lit-material-text-field>
      <lit-material-text-field variant="outlined" label="Port"></lit-material-text-field>
      <lit-material-text-field variant="outlined" label="Path"></lit-material-text-field>
    </lit-material-input-group>`);
    const [first, middle, last] = Array.from(el.querySelectorAll("lit-material-text-field"));
    expect(corners(first!)).to.deep.equal(["4px", "0px", "0px", "4px"]);
    expect(corners(middle!)).to.deep.equal(["0px", "0px", "0px", "0px"]);
    expect(corners(last!)).to.deep.equal(["0px", "4px", "4px", "0px"]);
  });

  it("leaves a field outside a group rounded", async () => {
    const el = await fixture(html`<lit-material-text-field variant="outlined" label="Alone"></lit-material-text-field>`);
    expect(corners(el)).to.deep.equal(["4px", "4px", "4px", "4px"]);
  });
});
