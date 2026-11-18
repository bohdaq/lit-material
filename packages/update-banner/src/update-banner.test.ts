import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./update-banner.js";
import type { LitMaterialUpdateBanner } from "./update-banner.js";

const $ = (el: LitMaterialUpdateBanner, s: string) => el.shadowRoot!.querySelector(s);
const text = (el: LitMaterialUpdateBanner) => $(el, ".message slot")!.textContent!.trim();

describe("lit-material-update-banner", () => {
  it("offers the version with Restart to update and Later, as a status that doesn't take focus", async () => {
    const before = document.activeElement;
    const el = await fixture<LitMaterialUpdateBanner>(html`<lit-material-update-banner version="1.3.0"></lit-material-update-banner>`);
    expect(el.getAttribute("role")).to.equal("status");
    expect(text(el)).to.equal("Version 1.3.0 is available");
    expect($(el, ".update")!.textContent!.trim()).to.equal("Restart to update");
    expect($(el, ".later")!.textContent!.trim()).to.equal("Later");
    expect(document.activeElement).to.equal(before);
  });

  it("names the app when it has a name", async () => {
    const el = await fixture<LitMaterialUpdateBanner>(html`<lit-material-update-banner app-name="HITOP" version="1.3.0"></lit-material-update-banner>`);
    expect(text(el)).to.equal("HITOP 1.3.0 is available");
  });

  it("fires update and later from the keyboard", async () => {
    const el = await fixture<LitMaterialUpdateBanner>(html`<lit-material-update-banner version="2.0.0"></lit-material-update-banner>`);
    const events: string[] = [];
    el.addEventListener("update", () => events.push("update"));
    el.addEventListener("later", () => events.push("later"));
    ($(el, ".update") as HTMLElement).focus();
    await sendKeys({ press: "Enter" });
    ($(el, ".later") as HTMLElement).focus();
    await sendKeys({ press: "Space" });
    expect(events).to.deep.equal(["update", "later"]);
  });

  it("shows progress while downloading, without buttons, and indeterminate with no progress", async () => {
    const el = await fixture<LitMaterialUpdateBanner>(html`<lit-material-update-banner version="1.3.0" state="downloading" progress="0.42"></lit-material-update-banner>`);
    const bar = $(el, "progress") as HTMLProgressElement;
    expect(bar.value).to.be.closeTo(0.42, 0.001);
    expect(bar.getAttribute("aria-label")).to.equal("Update download");
    expect($(el, ".percent")!.textContent).to.equal("42%");
    expect($(el, ".percent")!.getAttribute("aria-hidden")).to.equal("true");
    expect($(el, ".actions")).to.be.null;
    expect(text(el)).to.equal("Downloading version 1.3.0…");
    el.progress = -1;
    await el.updateComplete;
    expect(bar.hasAttribute("value")).to.be.false;
    expect(bar.matches(":indeterminate")).to.be.true;
  });

  it("restarts when ready, and retries after an error", async () => {
    const el = await fixture<LitMaterialUpdateBanner>(html`<lit-material-update-banner version="1.3.0" state="ready"></lit-material-update-banner>`);
    expect(text(el)).to.equal("Version 1.3.0 is ready to install");
    expect($(el, ".update")!.textContent!.trim()).to.equal("Restart");
    el.state = "error";
    await el.updateComplete;
    expect(text(el)).to.equal("The update didn't install");
    expect($(el, ".update")!.textContent!.trim()).to.equal("Try again");
    el.error = "The signature didn't match.";
    await el.updateComplete;
    expect(text(el)).to.equal("The signature didn't match.");
  });

  it("floats at the bottom end corner, mirrored right to left", async () => {
    const wrap = await fixture<HTMLElement>(html`<div dir="rtl"><lit-material-update-banner floating version="1"></lit-material-update-banner></div>`);
    const el = wrap.firstElementChild as LitMaterialUpdateBanner;
    await el.updateComplete;
    const style = getComputedStyle(el);
    expect(style.position).to.equal("fixed");
    expect(style.left).to.equal("16px");
    el.remove();
  });

  it("translates its words", async () => {
    registerTranslation({ $code: "x-update", "updateBanner.available": "Version {version} ist verfügbar", "updateBanner.later": "Später" });
    const el = await fixture<LitMaterialUpdateBanner>(html`<lit-material-update-banner lang="x-update" version="1.3.0"></lit-material-update-banner>`);
    expect(text(el)).to.equal("Version 1.3.0 ist verfügbar");
    expect($(el, ".later")!.textContent!.trim()).to.equal("Später");
  });

  it("is accessible in every state", async () => {
    const el = await fixture<LitMaterialUpdateBanner>(html`<lit-material-update-banner version="1.3.0"></lit-material-update-banner>`);
    for (const state of ["available", "downloading", "ready", "error"] as const) {
      el.state = state;
      el.progress = state === "downloading" ? 0.5 : -1;
      await el.updateComplete;
      await expect(el).to.be.accessible();
    }
  });
});
