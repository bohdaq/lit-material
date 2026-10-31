import { expect, fixture, html } from "@open-wc/testing";
import "./color-scheme-toggle.js";
import type { LitMaterialColorSchemeToggle } from "./color-scheme-toggle.js";
import {
  colorSchemeBootScript,
  DEFAULT_STORAGE_KEY,
  getColorScheme,
  resolvedColorScheme,
  setColorScheme,
  storedColorScheme,
} from "./color-scheme.js";

const root = document.documentElement;
const reset = () => {
  root.removeAttribute("color-scheme");
  localStorage.clear();
};

function innerButton(el: LitMaterialColorSchemeToggle): HTMLElement {
  const iconButton = el.shadowRoot!.querySelector("lit-material-icon-button")!;
  return iconButton.shadowRoot!.querySelector("button")!;
}

describe("color-scheme functions", () => {
  beforeEach(reset);
  afterEach(reset);

  it("sets, reads, persists and clears the scheme", () => {
    expect(getColorScheme()).to.equal("auto");
    setColorScheme("dark");
    expect(root.getAttribute("color-scheme")).to.equal("dark");
    expect(getColorScheme()).to.equal("dark");
    expect(resolvedColorScheme()).to.equal("dark");
    expect(storedColorScheme()).to.equal("dark");
    setColorScheme("auto");
    expect(root.hasAttribute("color-scheme")).to.be.false;
    expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).to.be.null;
  });

  it("can skip persisting and use another key", () => {
    setColorScheme("light", { persist: false });
    expect(storedColorScheme()).to.equal("auto");
    setColorScheme("dark", { storageKey: "mine" });
    expect(localStorage.getItem("mine")).to.equal("dark");
  });

  it("announces changes on document", () => {
    let seen = "";
    const on = (e: Event) => (seen = (e as CustomEvent).detail.scheme);
    document.addEventListener("lit-material-color-scheme-change", on);
    setColorScheme("light");
    document.removeEventListener("lit-material-color-scheme-change", on);
    expect(seen).to.equal("light");
  });

  it("boot script applies a saved choice and ignores junk", () => {
    localStorage.setItem("k", "dark");
    new Function(colorSchemeBootScript("k"))();
    expect(root.getAttribute("color-scheme")).to.equal("dark");
    root.removeAttribute("color-scheme");
    localStorage.setItem("k", "<script>");
    new Function(colorSchemeBootScript("k"))();
    expect(root.hasAttribute("color-scheme")).to.be.false;
  });
});

describe("lit-material-color-scheme-toggle", () => {
  beforeEach(reset);
  afterEach(reset);

  it("toggles light and dark from what the page shows", async () => {
    setColorScheme("light", { persist: false });
    const el = await fixture<LitMaterialColorSchemeToggle>(html`<lit-material-color-scheme-toggle></lit-material-color-scheme-toggle>`);
    await el.updateComplete;
    const button = innerButton(el);
    expect(button.getAttribute("aria-pressed")).to.equal("false");
    expect(button.getAttribute("aria-label")).to.equal("Switch to dark theme");
    let picked = "";
    el.addEventListener("change", (e) => (picked = (e as CustomEvent).detail?.scheme));
    button.click();
    await el.updateComplete;
    expect(picked).to.equal("dark");
    expect(getColorScheme()).to.equal("dark");
    expect(storedColorScheme()).to.equal("dark");
    const iconButton = el.shadowRoot!.querySelector("lit-material-icon-button")!;
    await iconButton.updateComplete;
    expect(innerButton(el).getAttribute("aria-pressed")).to.equal("true");
    innerButton(el).click();
    await el.updateComplete;
    expect(getColorScheme()).to.equal("light");
  });

  it("emits exactly one change per click", async () => {
    const el = await fixture<LitMaterialColorSchemeToggle>(html`<lit-material-color-scheme-toggle></lit-material-color-scheme-toggle>`);
    let count = 0;
    el.addEventListener("change", () => count++);
    innerButton(el).click();
    expect(count).to.equal(1);
  });

  it("cycles light, dark, system", async () => {
    setColorScheme("light", { persist: false });
    const el = await fixture<LitMaterialColorSchemeToggle>(html`<lit-material-color-scheme-toggle cycle></lit-material-color-scheme-toggle>`);
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      innerButton(el).click();
      await el.updateComplete;
      seen.push(getColorScheme());
    }
    expect(seen).to.deep.equal(["dark", "auto", "light"]);
    const label = el.shadowRoot!.querySelector("lit-material-icon-button")!.getAttribute("aria-label");
    expect(label).to.equal("Colour scheme: light. Switch to dark");
  });

  it("applies a saved choice on connect when no boot script ran", async () => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, "dark");
    await fixture(html`<lit-material-color-scheme-toggle></lit-material-color-scheme-toggle>`);
    expect(getColorScheme()).to.equal("dark");
  });

  it("keeps every toggle in sync", async () => {
    setColorScheme("light", { persist: false });
    const wrap = await fixture<HTMLDivElement>(html`<div>
      <lit-material-color-scheme-toggle></lit-material-color-scheme-toggle>
      <lit-material-color-scheme-toggle></lit-material-color-scheme-toggle>
    </div>`);
    const [a, b] = Array.from(wrap.querySelectorAll("lit-material-color-scheme-toggle"));
    await b!.updateComplete;
    innerButton(a!).click();
    await b!.updateComplete;
    const bIcon = b!.shadowRoot!.querySelector("lit-material-icon-button")!;
    await bIcon.updateComplete;
    expect(innerButton(b!).getAttribute("aria-pressed")).to.equal("true");
  });
});
