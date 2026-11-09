import { expect, fixture, html } from "@open-wc/testing";
import "./kbd.js";
import type { LitMaterialKbd } from "./kbd.js";

const keys = (el: LitMaterialKbd) => Array.from(el.shadowRoot!.querySelectorAll(".key")).map((k) => k.textContent);

describe("lit-material-kbd", () => {
  it("draws Ctrl+K off Apple platforms, with a spoken label", async () => {
    const el = await fixture<LitMaterialKbd>(html`<lit-material-kbd keys="Mod+K" platform="other"></lit-material-kbd>`);
    expect(keys(el)).to.deep.equal(["Ctrl", "K"]);
    expect(el.shadowRoot!.querySelector(".plus")).to.exist;
    expect(el.shadowRoot!.querySelector(".keys")!.getAttribute("aria-hidden")).to.equal("true");
    expect(el.shadowRoot!.querySelector(".label")!.textContent).to.equal("Control K");
  });

  it("draws ⌘⇧P on Apple platforms, with no plus signs", async () => {
    const el = await fixture<LitMaterialKbd>(html`<lit-material-kbd keys="Mod+Shift+P" platform="apple"></lit-material-kbd>`);
    expect(keys(el)).to.deep.equal(["⌘", "⇧", "P"]);
    expect(el.shadowRoot!.querySelector(".plus")).to.not.exist;
    expect(el.spokenText).to.equal("Command Shift P");
  });

  it("reads a sequence with 'then'", async () => {
    const el = await fixture<LitMaterialKbd>(html`<lit-material-kbd keys="G I" platform="other"></lit-material-kbd>`);
    expect(keys(el)).to.deep.equal(["G", "I"]);
    expect(el.spokenText).to.equal("G, then I");
  });

  it("detects the platform after the first render", async () => {
    const el = await fixture<LitMaterialKbd>(html`<lit-material-kbd keys="Mod+K"></lit-material-kbd>`);
    await el.updateComplete;
    const apple = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
    expect(keys(el)[0]).to.equal(apple ? "⌘" : "Ctrl");
  });

  it("is accessible", async () => {
    const el = await fixture<LitMaterialKbd>(html`<p>Press <lit-material-kbd keys="Mod+Enter"></lit-material-kbd> to send</p>`);
    await expect(el).to.be.accessible();
  });
});
