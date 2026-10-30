import { expect, fixture, html } from "@open-wc/testing";
import "./empty-state.js";
import type { LitMaterialEmptyState } from "./empty-state.js";

describe("lit-material-empty-state", () => {
  it("renders the headline as a heading and slots guidance and actions", async () => {
    const el = await fixture<LitMaterialEmptyState>(html`
      <lit-material-empty-state headline="No upstreams yet">
        Add an [[upstream]] to rws.config.toml.
        <button slot="actions">Reload</button>
      </lit-material-empty-state>
    `);
    const heading = el.shadowRoot!.querySelector('[role="heading"]')!;
    expect(heading.textContent).to.equal("No upstreams yet");
    expect(heading.getAttribute("aria-level")).to.equal("2");
    const actions = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="actions"]')!;
    expect(actions.assignedElements()[0].textContent).to.equal("Reload");
  });

  it("clamps the heading level", async () => {
    const el = await fixture<LitMaterialEmptyState>(html`<lit-material-empty-state headline="x" level="9"></lit-material-empty-state>`);
    expect(el.shadowRoot!.querySelector('[role="heading"]')!.getAttribute("aria-level")).to.equal("6");
  });

  it("has no heading without a headline", async () => {
    const el = await fixture<LitMaterialEmptyState>(html`<lit-material-empty-state>Nothing here</lit-material-empty-state>`);
    expect(el.shadowRoot!.querySelector('[role="heading"]')).to.be.null;
  });

  it("hides the icon and action areas when nothing is slotted", async () => {
    const el = await fixture<LitMaterialEmptyState>(html`<lit-material-empty-state headline="x"></lit-material-empty-state>`);
    expect(getComputedStyle(el.shadowRoot!.querySelector(".actions")!).display).to.equal("none");
  });

  it("compact is start-aligned with a dashed border", async () => {
    const el = await fixture<LitMaterialEmptyState>(html`<lit-material-empty-state size="compact" headline="x"></lit-material-empty-state>`);
    const box = getComputedStyle(el.shadowRoot!.querySelector(".empty-state")!);
    expect(box.borderTopStyle).to.equal("dashed");
    expect(box.alignItems).to.equal("flex-start");
  });
});
