import { expect, fixture, html, nextFrame } from "@open-wc/testing";
import "./top-app-bar.js";
import type { LitMaterialTopAppBar } from "./top-app-bar.js";

describe("lit-material-top-app-bar", () => {
  let spacer: HTMLDivElement | undefined;

  afterEach(() => {
    window.scrollTo(0, 0);
    spacer?.remove();
    spacer = undefined;
  });

  it("defaults to the small variant", async () => {
    const el = await fixture<LitMaterialTopAppBar>(
      html`<lit-material-top-app-bar>Title</lit-material-top-app-bar>`,
    );
    expect(el.variant).to.equal("small");
    const bar = el.shadowRoot!.querySelector(".bar")!;
    expect(bar.classList.contains("small")).to.be.true;
  });

  it("reflects the variant onto the bar element's class", async () => {
    const el = await fixture<LitMaterialTopAppBar>(
      html`<lit-material-top-app-bar variant="large">Title</lit-material-top-app-bar>`,
    );
    const bar = el.shadowRoot!.querySelector(".bar")!;
    expect(bar.classList.contains("large")).to.be.true;
  });

  it("renders leading, headline, and trailing slotted content", async () => {
    const el = await fixture<LitMaterialTopAppBar>(html`
      <lit-material-top-app-bar>
        Title
        <button slot="leading">nav</button>
        <button slot="trailing">action</button>
      </lit-material-top-app-bar>
    `);
    const leadingSlot = el.shadowRoot!.querySelector('slot[name="leading"]') as HTMLSlotElement;
    const trailingSlot = el.shadowRoot!.querySelector('slot[name="trailing"]') as HTMLSlotElement;
    const defaultSlot = el.shadowRoot!.querySelector("slot:not([name])") as HTMLSlotElement;

    expect(leadingSlot.assignedElements()).to.have.lengthOf(1);
    expect(trailingSlot.assignedElements()).to.have.lengthOf(1);
    expect(defaultSlot.assignedNodes({ flatten: true }).map((n) => n.textContent?.trim()).join("")).to.contain(
      "Title",
    );
  });

  it("is not elevated before any scrolling has happened", async () => {
    const el = await fixture<LitMaterialTopAppBar>(
      html`<lit-material-top-app-bar>Title</lit-material-top-app-bar>`,
    );
    expect(el.elevated).to.be.false;
    expect(el.hasAttribute("elevated")).to.be.false;
  });

  it("becomes elevated automatically once the window scrolls past the threshold", async () => {
    spacer = document.createElement("div");
    spacer.style.height = "3000px";
    document.body.appendChild(spacer);

    const el = await fixture<LitMaterialTopAppBar>(
      html`<lit-material-top-app-bar>Title</lit-material-top-app-bar>`,
    );
    expect(el.elevated).to.be.false;

    window.scrollTo(0, 100);
    window.dispatchEvent(new Event("scroll"));
    await nextFrame();

    expect(el.elevated).to.be.true;
    expect(el.hasAttribute("elevated")).to.be.true;

    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("scroll"));
    await nextFrame();

    expect(el.elevated).to.be.false;
  });

  it("tracks a custom scrollTarget instead of the window when one is set", async () => {
    const container = document.createElement("div");
    container.style.height = "100px";
    container.style.overflow = "auto";
    const inner = document.createElement("div");
    inner.style.height = "1000px";
    container.appendChild(inner);
    document.body.appendChild(container);

    const el = await fixture<LitMaterialTopAppBar>(
      html`<lit-material-top-app-bar>Title</lit-material-top-app-bar>`,
    );
    el.scrollTarget = container;
    await el.updateComplete;
    expect(el.elevated).to.be.false;

    container.scrollTop = 50;
    container.dispatchEvent(new Event("scroll"));
    await nextFrame();
    expect(el.elevated).to.be.true;

    // A window scroll shouldn't matter anymore once a scrollTarget is set.
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("scroll"));
    await nextFrame();
    expect(el.elevated).to.be.true;

    container.remove();
  });

  it("passes axe accessibility checks in every variant", async () => {
    for (const variant of ["center-aligned", "small", "medium", "large"] as const) {
      const el = await fixture<LitMaterialTopAppBar>(
        html`<lit-material-top-app-bar variant=${variant}>Title</lit-material-top-app-bar>`,
      );
      // Each iteration's <header> is an implicit ARIA "banner" landmark;
      // axe flags duplicate banners if more than one is in the document at
      // once, so remove the previous fixture before asserting the next.
      await expect(el).to.be.accessible();
      el.remove();
    }
  });
});
