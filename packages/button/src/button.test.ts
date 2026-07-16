import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./button.js";
import type { LitMaterialButton } from "./button.js";

describe("lit-material-button", () => {
  it("renders a native button by default with the slotted label", async () => {
    const el = await fixture<LitMaterialButton>(html`<lit-material-button>Save</lit-material-button>`);
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button).to.exist;
    expect(el.textContent?.trim()).to.equal("Save");
  });

  it("defaults to the filled variant", async () => {
    const el = await fixture<LitMaterialButton>(html`<lit-material-button>Save</lit-material-button>`);
    expect(el.variant).to.equal("filled");
  });

  it("reflects the disabled property to the attribute and disables the inner button", async () => {
    const el = await fixture<LitMaterialButton>(
      html`<lit-material-button disabled>Save</lit-material-button>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.disabled).to.be.true;
  });

  it("dispatches a click event when activated with the mouse", async () => {
    const el = await fixture<LitMaterialButton>(html`<lit-material-button>Save</lit-material-button>`);
    const button = el.shadowRoot!.querySelector("button")!;
    setTimeout(() => button.click());
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  it("does not dispatch a click event when disabled", async () => {
    const el = await fixture<LitMaterialButton>(
      html`<lit-material-button disabled>Save</lit-material-button>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    let clicked = false;
    el.addEventListener("click", () => (clicked = true));
    button.click();
    expect(clicked).to.be.false;
  });

  it("is reachable and activatable via keyboard (Tab + Enter)", async () => {
    const el = await fixture<LitMaterialButton>(html`<lit-material-button>Save</lit-material-button>`);
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("button"));
    setTimeout(() => sendKeys({ press: "Enter" }));
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  it("submits its ancestor form when type is submit", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-button type="submit">Submit</lit-material-button>
      </form>
    `);
    const el = form.querySelector("lit-material-button")! as LitMaterialButton;
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
        <lit-material-button type="reset">Reset</lit-material-button>
      </form>
    `);
    const input = form.querySelector("input")!;
    input.defaultValue = "original";
    const el = form.querySelector("lit-material-button")! as LitMaterialButton;
    const button = el.shadowRoot!.querySelector("button")!;

    button.click();
    expect(input.value).to.equal("original");
  });

  it("renders as a link when href is set", async () => {
    const el = await fixture<LitMaterialButton>(
      html`<lit-material-button href="https://lit.dev">Docs</lit-material-button>`,
    );
    const link = el.shadowRoot!.querySelector("a")!;
    expect(link).to.exist;
    expect(link.getAttribute("href")).to.equal("https://lit.dev");
  });

  it("has an accessible name matching the label text, excluding a leading icon", async () => {
    const el = await fixture<LitMaterialButton>(html`
      <lit-material-button>
        <span slot="icon" aria-hidden="true">★</span>
        Save
      </lit-material-button>
    `);
    const button = el.shadowRoot!.querySelector("button")!;
    const labelledBy = button.getAttribute("aria-labelledby")!;
    const label = el.shadowRoot!.getElementById(labelledBy)!;
    const slot = label.querySelector("slot")!;
    const projectedText = slot
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
    expect(projectedText).to.equal("Save");
  });

  it("sizes slotted icon content to 18x18 (regression: slot.icon::slotted(*) must be a compound selector — a descendant combinator before ::slotted() never matches)", async () => {
    const el = await fixture<LitMaterialButton>(html`
      <lit-material-button>
        <svg slot="icon" aria-hidden="true"><circle /></svg>
        Save
      </lit-material-button>
    `);
    const icon = el.querySelector('[slot="icon"]')!;
    const style = getComputedStyle(icon);
    expect(style.width).to.equal("18px");
    expect(style.height).to.equal("18px");
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialButton>(html`<lit-material-button>Save</lit-material-button>`);
    await expect(el).to.be.accessible();
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialButton>(html`<lit-material-button>Save</lit-material-button>`);
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
