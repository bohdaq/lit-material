import { expect, fixture, html } from "@open-wc/testing";
import "./method-tag.js";
import { methodKind, type LitMaterialMethodTag } from "./method-tag.js";

const tag = (el: LitMaterialMethodTag) => el.shadowRoot!.querySelector<HTMLElement>(".tag")!;

describe("lit-material-method-tag", () => {
  it("shows the method in capitals", async () => {
    const el = await fixture<LitMaterialMethodTag>(html`<lit-material-method-tag method=" post "></lit-material-method-tag>`);
    expect(tag(el).textContent).to.equal("POST");
    expect(tag(el).classList.contains("post")).to.be.true;
  });

  it("gives each HTTP method its own colour and everything else the primary", async () => {
    const colors = new Set<string>();
    for (const m of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
      const el = await fixture<LitMaterialMethodTag>(html`<lit-material-method-tag method=${m}></lit-material-method-tag>`);
      colors.add(getComputedStyle(tag(el)).color);
    }
    expect(colors.size).to.equal(5);
    const ws = await fixture<LitMaterialMethodTag>(html`<lit-material-method-tag method="ws"></lit-material-method-tag>`);
    expect(tag(ws).classList.contains("other")).to.be.true;
    expect(tag(ws).textContent).to.equal("WS");
  });

  it("follows the colour custom properties", async () => {
    const el = await fixture<LitMaterialMethodTag>(
      html`<lit-material-method-tag method="GET" style="--lit-material-method-tag-get: rgb(1, 2, 3)"></lit-material-method-tag>`,
    );
    expect(getComputedStyle(tag(el)).color).to.equal("rgb(1, 2, 3)");
  });

  it("is monospace and larger at medium size", async () => {
    const small = await fixture<LitMaterialMethodTag>(html`<lit-material-method-tag method="GET"></lit-material-method-tag>`);
    const medium = await fixture<LitMaterialMethodTag>(html`<lit-material-method-tag method="GET" size="medium"></lit-material-method-tag>`);
    expect(getComputedStyle(tag(small)).fontFamily).to.contain("monospace");
    expect(parseFloat(getComputedStyle(tag(medium)).fontSize)).to.be.greaterThan(parseFloat(getComputedStyle(tag(small)).fontSize));
  });

  it("maps methods to colour families", () => {
    expect(methodKind("Delete")).to.equal("delete");
    expect(methodKind("OPTIONS")).to.equal("other");
    expect(methodKind("")).to.equal("other");
  });
});
