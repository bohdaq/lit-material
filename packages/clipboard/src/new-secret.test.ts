import { expect, fixture, html } from "@open-wc/testing";
import "./new-secret.js";
import type { LitMaterialNewSecret } from "./new-secret.js";

const secret = () =>
  fixture<LitMaterialNewSecret>(html`<lit-material-new-secret label="Access token ci" value="hitop_pat_abc123">
    <button slot="actions">Done</button>
  </lit-material-new-secret>`);
const copy = (el: LitMaterialNewSecret) => el.shadowRoot!.querySelector("lit-material-clipboard-copy")!;

describe("lit-material-new-secret", () => {
  it("shows the value unmasked, named by the label, with the warning", async () => {
    const el = await secret();
    await copy(el).updateComplete;
    const input = copy(el).shadowRoot!.querySelector("input")!;
    expect(input.type).to.equal("text");
    expect(input.value).to.equal("hitop_pat_abc123");
    expect(input.getAttribute("aria-label")).to.equal("Access token ci");
    // Whitespace around the slotted button must not hide the default warning.
    const warning = el.shadowRoot!.querySelector<HTMLSlotElement>(".warning slot")!;
    expect(warning.assignedNodes()).to.have.length(0);
    expect(el.shadowRoot!.querySelector(".warning")!.textContent).to.contain("won't be shown again");
  });

  it("is a status region and focuses the value when it appears", async () => {
    const el = await secret();
    await new Promise((r) => setTimeout(r, 0));
    expect(el.shadowRoot!.querySelector("[role=status]")).to.exist;
    expect(copy(el).shadowRoot!.activeElement?.tagName).to.equal("INPUT");
    await expect(el).to.be.accessible();
  });

  it("takes its own warning text", async () => {
    const el = await fixture<LitMaterialNewSecret>(html`<lit-material-new-secret value="x"><span slot="warning">Store it in your CI secrets.</span></lit-material-new-secret>`);
    const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('.warning slot[name="warning"]')!;
    expect(slot.assignedElements()[0]!.textContent).to.equal("Store it in your CI secrets.");
  });
});

describe("lit-material-new-secret actions", () => {
  it("hides the actions row when nothing is slotted there", async () => {
    const bare = await fixture<LitMaterialNewSecret>(html`<lit-material-new-secret value="x"></lit-material-new-secret>`);
    expect(bare.shadowRoot!.querySelector<HTMLElement>(".actions")!.hidden).to.be.true;
    const withDone = await secret();
    await withDone.updateComplete;
    expect(withDone.shadowRoot!.querySelector<HTMLElement>(".actions")!.hidden).to.be.false;
  });
});
