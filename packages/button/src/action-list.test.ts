import { expect, fixture, html } from "@open-wc/testing";
import "./action-list.js";
import "./button.js";
import type { LitMaterialActionList } from "./action-list.js";

describe("lit-material-action-list", () => {
  it("spaces actions and aligns them", async () => {
    const el = await fixture<LitMaterialActionList>(html`<lit-material-action-list align="end" style="width: 400px">
      <lit-material-button variant="text">Cancel</lit-material-button>
      <lit-material-button>Save</lit-material-button>
    </lit-material-action-list>`);
    const [cancel, save] = Array.from(el.children).map((c) => c.getBoundingClientRect());
    expect(save!.left - cancel!.right).to.be.closeTo(8, 0.5);
    expect(save!.right).to.be.closeTo(el.getBoundingClientRect().right, 0.5);
  });

  it("spans a column flexbox to align", async () => {
    const host = await fixture<HTMLDivElement>(html`<div style="display: flex; flex-direction: column; align-items: flex-start; width: 400px">
      <lit-material-action-list align="end"><button>Save</button></lit-material-action-list>
    </div>`);
    const save = host.querySelector("button")!.getBoundingClientRect();
    expect(save.right).to.be.closeTo(host.getBoundingClientRect().right, 0.5);
  });

  it("takes the rest of a row flexbox's line to align", async () => {
    const host = await fixture<HTMLDivElement>(html`<div style="display: flex; width: 400px">
      <span style="width: 100px">Title</span>
      <lit-material-action-list align="end"><button>Save</button></lit-material-action-list>
    </div>`);
    const save = host.querySelector("button")!.getBoundingClientRect();
    expect(save.right).to.be.closeTo(host.getBoundingClientRect().right, 0.5);
  });

  it("spaces nested groups wider apart", async () => {
    const el = await fixture<LitMaterialActionList>(html`<lit-material-action-list>
      <lit-material-action-list><button>A</button><button>B</button></lit-material-action-list>
      <lit-material-action-list><button>C</button></lit-material-action-list>
    </lit-material-action-list>`);
    await el.updateComplete;
    expect(el.hasAttribute("grouped")).to.be.true;
    const [first, second] = Array.from(el.children).map((c) => c.getBoundingClientRect());
    expect(second!.left - first!.right).to.be.closeTo(16, 0.5);
  });

  it("is a named group with a label", async () => {
    const el = await fixture<LitMaterialActionList>(html`<lit-material-action-list label="Request actions"><button>Send</button></lit-material-action-list>`);
    expect(el.getAttribute("role")).to.equal("group");
    expect(el.getAttribute("aria-label")).to.equal("Request actions");
    el.label = "";
    await el.updateComplete;
    expect(el.hasAttribute("role")).to.be.false;
  });

  it("wraps when out of room", async () => {
    const el = await fixture<LitMaterialActionList>(html`<lit-material-action-list style="width: 120px">
      <button style="width: 80px">One</button><button style="width: 80px">Two</button>
    </lit-material-action-list>`);
    const [one, two] = Array.from(el.children).map((c) => c.getBoundingClientRect());
    expect(two!.top).to.be.above(one!.top);
  });
});
