import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./chip-input.js";
import type { LitMaterialChipInput } from "./chip-input.js";

const chipInput = () => fixture<LitMaterialChipInput>(html`<lit-material-chip-input label="Labels" .values=${["app=web"]}></lit-material-chip-input>`);
const input = (el: LitMaterialChipInput) => el.shadowRoot!.querySelector("input")!;
const chips = (el: LitMaterialChipInput) => Array.from(el.shadowRoot!.querySelectorAll("lit-material-chip")).map((c) => c.textContent!.trim());

describe("lit-material-chip-input", () => {
  it("shows a chip per value with a named remove button", async () => {
    const el = await chipInput();
    expect(chips(el)).to.deep.equal(["app=web"]);
    const chip = el.shadowRoot!.querySelector("lit-material-chip")!;
    await (chip as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(chip.shadowRoot!.querySelector(".remove")!.getAttribute("aria-label")).to.equal("Remove app=web");
    expect(el.shadowRoot!.querySelector(`label[for="${input(el).id}"]`)).to.exist;
  });

  it("adds on Enter and on comma, and fires change", async () => {
    const el = await chipInput();
    input(el).focus();
    await sendKeys({ type: "tier=front" });
    const listener = oneEvent(el, "change");
    await sendKeys({ press: "Enter" });
    expect((await listener).detail.values).to.deep.equal(["app=web", "tier=front"]);
    await sendKeys({ type: "env=prod," });
    expect(el.values).to.deep.equal(["app=web", "tier=front", "env=prod"]);
    expect(input(el).value).to.equal("");
  });

  it("removes the last chip with Backspace in an empty field", async () => {
    const el = await chipInput();
    input(el).focus();
    await sendKeys({ press: "Backspace" });
    expect(el.values).to.deep.equal([]);
  });

  it("removes a chip with its button", async () => {
    const el = await chipInput();
    const chip = el.shadowRoot!.querySelector("lit-material-chip")!;
    await (chip as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    chip.shadowRoot!.querySelector<HTMLElement>(".remove")!.click();
    await el.updateComplete;
    expect(el.values).to.deep.equal([]);
    expect(el.shadowRoot!.querySelector("lit-material-chip")).to.be.null;
  });

  it("refuses duplicates and what the validator rejects, keeping the text", async () => {
    const el = await chipInput();
    el.validator = (v) => (v.includes("=") ? "" : "Use key=value");
    input(el).focus();
    await sendKeys({ type: "app=web" });
    await sendKeys({ press: "Enter" });
    await el.updateComplete;
    expect(el.invalid).to.be.true;
    expect(el.shadowRoot!.querySelector(".supporting")!.textContent).to.equal("app=web is already added");
    input(el).value = "";
    await sendKeys({ type: "oops" });
    await sendKeys({ press: "Enter" });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".supporting")!.textContent).to.equal("Use key=value");
    expect(input(el).value).to.equal("oops");
    expect(input(el).getAttribute("aria-invalid")).to.equal("true");
  });

  it("adds every value of a paste", async () => {
    const el = await chipInput();
    const data = new DataTransfer();
    data.setData("text/plain", "a@x.io, b@x.io\nc@x.io");
    // Firefox drops `clipboardData` from a synthetic ClipboardEvent's init.
    const paste = new ClipboardEvent("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(paste, "clipboardData", { value: data });
    input(el).dispatchEvent(paste);
    expect(el.values).to.deep.equal(["app=web", "a@x.io", "b@x.io", "c@x.io"]);
  });

  it("stops at max", async () => {
    const el = await chipInput();
    el.max = 1;
    expect(el.add("more")).to.equal("At most 1");
  });
});
