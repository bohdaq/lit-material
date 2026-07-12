import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./chip.js";
import type { LitMaterialChip } from "./chip.js";

describe("lit-material-chip", () => {
  it("renders a native button with the slotted label by default", async () => {
    const el = await fixture<LitMaterialChip>(html`<lit-material-chip>Filter</lit-material-chip>`);
    const button = el.shadowRoot!.querySelector("button.action")!;
    expect(button).to.exist;
    expect(el.textContent).to.equal("Filter");
  });

  it("defaults to the assist variant", async () => {
    const el = await fixture<LitMaterialChip>(html`<lit-material-chip>Filter</lit-material-chip>`);
    expect(el.variant).to.equal("assist");
  });

  it("dispatches a click event when activated with the mouse", async () => {
    const el = await fixture<LitMaterialChip>(html`<lit-material-chip>Filter</lit-material-chip>`);
    const button = el.shadowRoot!.querySelector("button.action")!;
    setTimeout(() => button.click());
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  it("does not dispatch a click event when disabled", async () => {
    const el = await fixture<LitMaterialChip>(html`<lit-material-chip disabled>Filter</lit-material-chip>`);
    const button = el.shadowRoot!.querySelector("button.action")!;
    let clicked = false;
    el.addEventListener("click", () => (clicked = true));
    button.click();
    expect(clicked).to.be.false;
  });

  it("is reachable and activatable via keyboard (Tab + Enter)", async () => {
    const el = await fixture<LitMaterialChip>(html`<lit-material-chip>Filter</lit-material-chip>`);
    const button = el.shadowRoot!.querySelector("button.action")! as HTMLButtonElement;
    button.focus();
    expect(el.shadowRoot!.activeElement).to.equal(button);
    setTimeout(() => sendKeys({ press: "Enter" }));
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  describe("filter variant", () => {
    it("toggles selected and dispatches change on click", async () => {
      const el = await fixture<LitMaterialChip>(
        html`<lit-material-chip variant="filter">Spicy</lit-material-chip>`,
      );
      expect(el.selected).to.be.false;
      const button = el.shadowRoot!.querySelector("button.action")!;
      expect(button.getAttribute("aria-pressed")).to.equal("false");

      let changed = false;
      el.addEventListener("change", () => (changed = true));
      button.click();
      expect(el.selected).to.be.true;
      expect(changed).to.be.true;
      await el.updateComplete;
      expect(button.getAttribute("aria-pressed")).to.equal("true");
    });

    it("shows a checkmark instead of the leading icon when selected", async () => {
      const el = await fixture<LitMaterialChip>(html`
        <lit-material-chip variant="filter">
          <span slot="leading-icon">🌶️</span>
          Spicy
        </lit-material-chip>
      `);
      expect(el.shadowRoot!.querySelector(".checkmark")).to.not.exist;
      expect(el.shadowRoot!.querySelector('slot[name="leading-icon"]')).to.exist;

      el.selected = true;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector(".checkmark")).to.exist;
      expect(el.shadowRoot!.querySelector('slot[name="leading-icon"]')).to.not.exist;
    });

    it("does not toggle selected when disabled", async () => {
      const el = await fixture<LitMaterialChip>(
        html`<lit-material-chip variant="filter" disabled>Spicy</lit-material-chip>`,
      );
      const button = el.shadowRoot!.querySelector("button.action")!;
      button.click();
      expect(el.selected).to.be.false;
    });
  });

  describe("removable", () => {
    it("renders a remove button that dispatches a cancelable remove event and detaches the chip", async () => {
      const wrapper = await fixture<HTMLDivElement>(
        html`<div><lit-material-chip removable>Tag</lit-material-chip></div>`,
      );
      const el = wrapper.querySelector("lit-material-chip")! as LitMaterialChip;
      const removeButton = el.shadowRoot!.querySelector("button.remove")! as HTMLButtonElement;

      setTimeout(() => removeButton.click());
      const event = await oneEvent(el, "remove");
      expect(event).to.exist;
      expect(event.cancelable).to.be.true;
      await new Promise((resolve) => setTimeout(resolve));
      expect(wrapper.contains(el)).to.be.false;
    });

    it("stays in the DOM if the remove event is prevented", async () => {
      const wrapper = await fixture<HTMLDivElement>(
        html`<div><lit-material-chip removable>Tag</lit-material-chip></div>`,
      );
      const el = wrapper.querySelector("lit-material-chip")! as LitMaterialChip;
      el.addEventListener("remove", (event) => event.preventDefault());
      const removeButton = el.shadowRoot!.querySelector("button.remove")! as HTMLButtonElement;
      removeButton.click();
      expect(wrapper.contains(el)).to.be.true;
    });

    it("does not render a remove button by default", async () => {
      const el = await fixture<LitMaterialChip>(html`<lit-material-chip>Tag</lit-material-chip>`);
      expect(el.shadowRoot!.querySelector("button.remove")).to.not.exist;
    });
  });

  describe("link (href)", () => {
    it("renders an anchor when href is set", async () => {
      const el = await fixture<LitMaterialChip>(
        html`<lit-material-chip href="https://lit.dev">Docs</lit-material-chip>`,
      );
      const anchor = el.shadowRoot!.querySelector("a.action")!;
      expect(anchor).to.exist;
      expect(anchor.getAttribute("href")).to.equal("https://lit.dev");
    });

    it("adds rel=noopener when target=_blank", async () => {
      const el = await fixture<LitMaterialChip>(
        html`<lit-material-chip href="https://lit.dev" target="_blank">Docs</lit-material-chip>`,
      );
      const anchor = el.shadowRoot!.querySelector("a.action")!;
      expect(anchor.getAttribute("rel")).to.equal("noopener noreferrer");
    });
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialChip>(html`<lit-material-chip>Filter</lit-material-chip>`);
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks when removable", async () => {
    const el = await fixture<LitMaterialChip>(html`<lit-material-chip removable>Tag</lit-material-chip>`);
    await expect(el).to.be.accessible();
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialChip>(html`<lit-material-chip>Filter</lit-material-chip>`);
    const button = el.shadowRoot!.querySelector("button.action")!;
    const rect = button.getBoundingClientRect();
    button.dispatchEvent(
      new PointerEvent("pointerdown", {
        button: 0,
        clientX: rect.x + 1,
        clientY: rect.y + 1,
        bubbles: true,
        composed: true,
      }),
    );
    const stateLayer = el.shadowRoot!.querySelector(".state-layer")!;
    expect(stateLayer.hasAttribute("data-pressed")).to.be.true;
  });
});
