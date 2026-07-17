import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./icon-button.js";
import type { LitMaterialIconButton } from "./icon-button.js";

describe("lit-material-icon-button", () => {
  it("renders a native button by default with the slotted icon", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Search"><span slot="icon">🔍</span></lit-material-icon-button>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button).to.exist;
    expect(button.getAttribute("aria-label")).to.equal("Search");
  });

  it("defaults to the standard variant", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Search"><span slot="icon">🔍</span></lit-material-icon-button>`,
    );
    expect(el.variant).to.equal("standard");
  });

  it("reflects the disabled property to the attribute and disables the inner button", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Search" disabled><span slot="icon">🔍</span></lit-material-icon-button>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.disabled).to.be.true;
  });

  it("dispatches a click event when activated with the mouse", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Search"><span slot="icon">🔍</span></lit-material-icon-button>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    setTimeout(() => button.click());
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  it("does not dispatch a click event when disabled", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Search" disabled><span slot="icon">🔍</span></lit-material-icon-button>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    let clicked = false;
    el.addEventListener("click", () => (clicked = true));
    button.click();
    expect(clicked).to.be.false;
  });

  it("is reachable and activatable via keyboard (Tab + Enter)", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Search"><span slot="icon">🔍</span></lit-material-icon-button>`,
    );
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("button"));
    setTimeout(() => sendKeys({ press: "Enter" }));
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  it("toggles `selected` and emits a change event on click when toggle is set", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button toggle aria-label="Mute"><span slot="icon">🔇</span></lit-material-icon-button>`,
    );
    expect(el.selected).to.be.false;
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.getAttribute("aria-pressed")).to.equal("false");

    let changed = false;
    el.addEventListener("change", () => (changed = true));

    button.click();
    expect(el.selected).to.be.true;
    expect(changed).to.be.true;
    await el.updateComplete;
    expect(button.getAttribute("aria-pressed")).to.equal("true");
  });

  it("does not toggle when disabled", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button toggle disabled aria-label="Mute"><span slot="icon">🔇</span></lit-material-icon-button>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    let changed = false;
    el.addEventListener("change", () => (changed = true));
    button.click();
    expect(el.selected).to.be.false;
    expect(changed).to.be.false;
  });

  it("actually distributes slot=\"icon\" content when off, and slot=\"selected-icon\" when selected", async () => {
    // Regression test: a previous version rendered an *unnamed* default slot for the off state, so
    // content the README/JSDoc document as `slot="icon"` was silently never distributed at all — this
    // asserts real content distribution (assignedElements()), not just that some <slot> element exists,
    // which is what let that bug ship undetected.
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button toggle aria-label="Mute"><span slot="icon">off</span><span slot="selected-icon">on</span></lit-material-icon-button>`,
    );
    expect(el.selected).to.be.false;
    const namedIconSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="icon"]');
    expect(namedIconSlot).to.exist;
    expect(namedIconSlot!.assignedElements().map((e) => e.textContent)).to.include("off");
    expect(el.shadowRoot!.querySelector('slot[name="selected-icon"]')).to.be.null;

    el.selected = true;
    await el.updateComplete;
    const selectedIconSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="selected-icon"]');
    expect(selectedIconSlot).to.exist;
    expect(selectedIconSlot!.assignedElements().map((e) => e.textContent)).to.include("on");
    expect(el.shadowRoot!.querySelector('slot[name="icon"]')).to.be.null;
  });

  it("also distributes off-state icon content with no slot attribute at all (plain non-toggle usage)", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Menu">☰</lit-material-icon-button>`,
    );
    const defaultSlot = el.shadowRoot!.querySelector<HTMLSlotElement>("slot:not([name])");
    expect(defaultSlot).to.exist;
    const text = defaultSlot!
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join("");
    expect(text).to.include("☰");
  });

  it("does not expose aria-pressed when not a toggle", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Search"><span slot="icon">🔍</span></lit-material-icon-button>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.hasAttribute("aria-pressed")).to.be.false;
  });

  it("submits its ancestor form when type is submit", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-icon-button type="submit" aria-label="Search"><span slot="icon">🔍</span></lit-material-icon-button>
      </form>
    `);
    const el = form.querySelector("lit-material-icon-button")! as LitMaterialIconButton;
    const button = el.shadowRoot!.querySelector("button")!;

    let submitted = false;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitted = true;
    });

    button.click();
    expect(submitted).to.be.true;
  });

  it("resets its ancestor form when type is reset", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <input name="field" value="changed" />
        <lit-material-icon-button type="reset" aria-label="Reset"><span slot="icon">↺</span></lit-material-icon-button>
      </form>
    `);
    const input = form.querySelector("input")!;
    input.defaultValue = "original";
    const el = form.querySelector("lit-material-icon-button")! as LitMaterialIconButton;
    const button = el.shadowRoot!.querySelector("button")!;

    button.click();
    expect(input.value).to.equal("original");
  });

  it("renders as a link when href is set", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Docs" href="https://lit.dev"></lit-material-icon-button>`,
    );
    const link = el.shadowRoot!.querySelector("a")!;
    expect(link).to.exist;
    expect(link.getAttribute("href")).to.equal("https://lit.dev");
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Search"><span slot="icon" aria-hidden="true">🔍</span></lit-material-icon-button>`,
    );
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks for toggle", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button toggle aria-label="Mute"><span slot="icon" aria-hidden="true">🔇</span></lit-material-icon-button>`,
    );
    await expect(el).to.be.accessible();
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialIconButton>(
      html`<lit-material-icon-button aria-label="Search"><span slot="icon" aria-hidden="true">🔍</span></lit-material-icon-button>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
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
