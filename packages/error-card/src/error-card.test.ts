import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./error-card.js";
import type { LitMaterialErrorCard } from "./error-card.js";

const RAW = "error trying to connect: tcp connect error: Connection refused (os error 111)";

async function card(markup = html`
  <lit-material-error-card headline="Connection refused" details=${RAW}>
    Nothing answered on that port: is the server running?
    <button slot="actions">Retry</button>
  </lit-material-error-card>
`) {
  const el = await fixture<LitMaterialErrorCard>(markup);
  await el.updateComplete;
  return el;
}

const toggle = (el: LitMaterialErrorCard) => el.shadowRoot!.querySelector(".toggle") as HTMLButtonElement;
const details = (el: LitMaterialErrorCard) => el.shadowRoot!.querySelector(".details") as HTMLElement;

describe("lit-material-error-card", () => {
  it("shows the headline, next step and actions, with the details closed", async () => {
    const el = await card();
    expect(el.shadowRoot!.querySelector(".headline")!.textContent).to.contain("Connection refused");
    expect(toggle(el).getAttribute("aria-expanded")).to.equal("false");
    expect(details(el).hidden).to.be.true;
    expect(details(el).textContent).to.equal(RAW);
    expect(toggle(el).getAttribute("aria-controls")).to.equal(details(el).id);
    expect(el.shadowRoot!.querySelector(".actions")!.classList.contains("empty")).to.be.false;
    expect(el.hasAttribute("role")).to.be.false;
  });

  it("opens the details from the keyboard, fires toggle and offers a copy button", async () => {
    const el = await card();
    const events: boolean[] = [];
    el.addEventListener("toggle", (e) => events.push((e as CustomEvent).detail.open));
    toggle(el).focus();
    await sendKeys({ press: "Enter" });
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(details(el).hidden).to.be.false;
    expect(toggle(el).getAttribute("aria-expanded")).to.equal("true");
    const copy = el.shadowRoot!.querySelector(".copy") as HTMLButtonElement;
    expect(copy.textContent!.trim()).to.equal("Copy details");
    let copied = "";
    const original = navigator.clipboard?.writeText;
    Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: async (t: string) => void (copied = t) });
    try {
      expect(await el.copyDetails()).to.be.true;
    } finally {
      Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: original });
    }
    expect(copied).to.equal(RAW);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("[role=status]")!.textContent).to.equal("Copied");
    toggle(el).focus();
    await sendKeys({ press: "Space" });
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(events).to.deep.equal([true, false]);
  });

  it("has no Details without details text, and collapses an empty actions slot", async () => {
    const el = await card(html`<lit-material-error-card headline="Request failed"></lit-material-error-card>`);
    expect(toggle(el)).to.be.null;
    expect(el.shadowRoot!.querySelector(".actions")!.classList.contains("empty")).to.be.true;
    expect(el.shadowRoot!.querySelector(".body")!.classList.contains("empty")).to.be.true;
  });

  it("is an alert only when asked", async () => {
    const el = await card(html`<lit-material-error-card alert headline="Saved partly" variant="warning"></lit-material-error-card>`);
    expect(el.getAttribute("role")).to.equal("alert");
    expect(el.shadowRoot!.querySelector(".visually-hidden")!.textContent).to.equal("Warning: ");
    el.alert = false;
    await el.updateComplete;
    expect(el.hasAttribute("role")).to.be.false;
  });

  it("mirrors the chevron right to left", async () => {
    const wrap = await fixture<HTMLElement>(html`<div dir="rtl"><lit-material-error-card headline="x" details="y"></lit-material-error-card></div>`);
    const el = wrap.firstElementChild as LitMaterialErrorCard;
    await el.updateComplete;
    expect(getComputedStyle(el.shadowRoot!.querySelector(".chevron")!).scale).to.equal("-1 1");
    const card = el.shadowRoot!.querySelector(".card")!;
    expect(getComputedStyle(card).borderRightWidth).to.equal("4px");
  });

  it("translates its words", async () => {
    registerTranslation({ $code: "x-error-card", "errorCard.details": "Einzelheiten", "errorCard.error": "Fehler", "errorCard.copyDetails": "Kopieren" });
    const el = await card(html`<lit-material-error-card lang="x-error-card" open headline="x" details="y"></lit-material-error-card>`);
    expect(toggle(el).textContent!.trim()).to.equal("Einzelheiten");
    expect(el.shadowRoot!.querySelector(".visually-hidden")!.textContent).to.equal("Fehler: ");
    expect(el.shadowRoot!.querySelector(".copy")!.textContent!.trim()).to.equal("Kopieren");
  });

  it("is accessible, open and closed, in both variants", async () => {
    const el = await card();
    await expect(el).to.be.accessible();
    el.open = true;
    el.variant = "warning";
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
