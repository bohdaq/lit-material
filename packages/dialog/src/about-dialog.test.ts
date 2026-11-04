import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./about-dialog.js";
import type { LitMaterialAboutDialog } from "./about-dialog.js";

const inner = (el: LitMaterialAboutDialog) => el.shadowRoot!.querySelector("lit-material-dialog")!;
const native = (el: LitMaterialAboutDialog) => inner(el).shadowRoot!.querySelector("dialog")!;

async function about() {
  const el = await fixture<LitMaterialAboutDialog>(html`<lit-material-about-dialog product-name="rws">
    <svg slot="logo" width="32" height="32" aria-hidden="true"></svg>
    <dl><dt>Version</dt><dd>18.17.0</dd></dl>
    <span slot="legal">© 2026 bohdaq. MIT license.</span>
  </lit-material-about-dialog>`);
  return el;
}

describe("lit-material-about-dialog", () => {
  it("opens with the product name, details and legal text", async () => {
    const el = await about();
    el.show();
    await el.updateComplete;
    await inner(el).updateComplete;
    expect(native(el).open).to.be.true;
    expect(el.shadowRoot!.querySelector(".name")!.textContent).to.include("rws");
    const details = el.shadowRoot!.querySelector<HTMLSlotElement>(".details slot")!.assignedElements();
    expect(details[0]!.textContent).to.include("18.17.0");
    const legal = el.shadowRoot!.querySelector<HTMLSlotElement>("slot.legal")!.assignedElements();
    expect(legal[0]!.textContent).to.include("MIT");
  });

  it("closes from its Close button and fires close once", async () => {
    const el = await about();
    el.show();
    await inner(el).updateComplete;
    let count = 0;
    el.addEventListener("close", () => count++);
    const closed = oneEvent(el, "close");
    el.shadowRoot!.querySelector<HTMLElement>("lit-material-button")!.click();
    await closed;
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(native(el).open).to.be.false;
    expect(count).to.equal(1);
  });

  it("follows Escape", async () => {
    const el = await about();
    el.show();
    await inner(el).updateComplete;
    const closed = oneEvent(el, "close");
    await sendKeys({ press: "Escape" });
    await closed;
    expect(el.open).to.be.false;
  });

  it("translates its Close button, unless close-label is set", async () => {
    registerTranslation({ $code: "x-about-dialog", "dialog.close": "Schließen" });
    const wrapper = await fixture<HTMLDivElement>(html`<div lang="x-about-dialog">
      <lit-material-about-dialog product-name="rws"></lit-material-about-dialog>
      <lit-material-about-dialog product-name="rws" close-label="Done"></lit-material-about-dialog>
    </div>`);
    const [translated, explicit] = wrapper.querySelectorAll<LitMaterialAboutDialog>("lit-material-about-dialog");
    await translated!.updateComplete;
    await explicit!.updateComplete;
    const button = (el: LitMaterialAboutDialog) => el.shadowRoot!.querySelector("lit-material-button")!;
    expect(button(translated!).textContent?.trim()).to.equal("Schließen");
    expect(button(explicit!).textContent?.trim()).to.equal("Done");
  });
});
