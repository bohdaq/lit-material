import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./world-map.js";
import type { LitMaterialWorldMap } from "./world-map.js";
import { COUNTRIES } from "./countries.js";

const data = { US: 400, de: 100, FR: 25, SG: 9 };
const root = (el: LitMaterialWorldMap) => el.shadowRoot!;
const path = (el: LitMaterialWorldMap, code: string) => root(el).querySelector<SVGPathElement>(`path[data-code="${code}"]`)!;
const tip = (el: LitMaterialWorldMap) => root(el).querySelector(".tooltip")?.textContent?.trim();
const frame = (el: LitMaterialWorldMap) => root(el).querySelector<HTMLElement>(".frame")!;

async function press(el: LitMaterialWorldMap, key: string) {
  await sendKeys({ press: key });
  await el.updateComplete;
}

describe("lit-material-world-map", () => {
  it("draws every country and shades those with a value on a square-root scale", async () => {
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map .data=${data}></lit-material-world-map>`);
    expect(root(el).querySelectorAll("path").length).to.equal(Object.keys(COUNTRIES).length);
    expect(root(el).querySelectorAll("path.on").length).to.equal(3, "SG has no shape");
    expect(path(el, "US").style.getPropertyValue("--level")).to.equal("90%");
    expect(path(el, "DE").style.getPropertyValue("--level")).to.equal("54%", "lowercase code accepted");
    expect(path(el, "IT").style.getPropertyValue("--level")).to.equal("");
  });

  it("names the map with the top countries and lists every value in a table", async () => {
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map label="Visitors" unit="visitors" .data=${data}></lit-material-world-map>`);
    expect(frame(el).getAttribute("aria-label")).to.equal(
      "Visitors. Highest: United States: 400 visitors; Germany: 100 visitors; France: 25 visitors; Singapore: 9 visitors",
    );
    const rows = [...root(el).querySelectorAll("tbody tr")].map((r) => [...r.children].map((c) => c.textContent).join(" "));
    expect(rows).to.deep.equal(["United States 400", "Germany 100", "France 25", "Singapore 9"]);
  });

  it("lists countries too small to draw instead of dropping them", async () => {
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map .data=${data}></lit-material-world-map>`);
    const places = [...root(el).querySelectorAll(".elsewhere .place")].map((p) => p.textContent);
    expect(places).to.deep.equal(["Singapore: 9"]);
    expect(root(el).querySelector("button.place")).to.be.null;
  });

  it("reads countries with the keyboard, highest first", async () => {
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map .data=${data}></lit-material-world-map>`);
    frame(el).focus();
    await press(el, "ArrowDown");
    expect(tip(el)).to.equal("United States: 400");
    expect(root(el).querySelector('[role="status"]')!.textContent).to.equal("United States: 400");
    expect(path(el, "US").classList.contains("active")).to.be.true;
    await press(el, "ArrowRight");
    expect(tip(el)).to.equal("Germany: 100");
    await press(el, "End");
    expect(tip(el)).to.equal("Singapore: 9");
    expect(root(el).querySelector(".tooltip.corner"), "no shape: readout in the corner").to.not.be.null;
    await press(el, "Home");
    expect(tip(el)).to.equal("United States: 400");
    await press(el, "Escape");
    expect(root(el).querySelector(".tooltip")).to.be.null;
  });

  it("flips the horizontal arrows right to left", async () => {
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map dir="rtl" .data=${data}></lit-material-world-map>`);
    frame(el).focus();
    await press(el, "ArrowLeft");
    expect(tip(el)).to.equal("United States: 400");
    await press(el, "ArrowLeft");
    expect(tip(el)).to.equal("Germany: 100");
    await press(el, "ArrowRight");
    expect(tip(el)).to.equal("United States: 400");
  });

  it("shows any country on hover, with or without a value", async () => {
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map .data=${data}></lit-material-world-map>`);
    path(el, "IT").dispatchEvent(new PointerEvent("pointerenter"));
    await el.updateComplete;
    expect(tip(el)).to.equal("Italy: no data");
    frame(el).dispatchEvent(new PointerEvent("pointerleave"));
    await el.updateComplete;
    expect(root(el).querySelector(".tooltip")).to.be.null;
  });

  it("does nothing on click unless selectable", async () => {
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map .data=${data}></lit-material-world-map>`);
    let fired = false;
    el.addEventListener("change", () => (fired = true));
    path(el, "US").dispatchEvent(new MouseEvent("click"));
    expect(fired).to.be.false;
    expect(el.selected).to.equal("");
  });

  it("selects by click, keyboard and the small-country buttons, and clears on a second pick", async () => {
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map selectable .data=${data}></lit-material-world-map>`);
    setTimeout(() => path(el, "DE").dispatchEvent(new MouseEvent("click")));
    let event = (await oneEvent(el, "change")) as CustomEvent;
    expect(event.detail).to.deep.equal({ code: "DE", value: 100 });
    await el.updateComplete;
    expect(el.selected).to.equal("DE");
    expect(path(el, "DE").classList.contains("selected")).to.be.true;

    path(el, "IT").dispatchEvent(new MouseEvent("click"));
    expect(el.selected).to.equal("DE", "no value, nothing to select");

    frame(el).focus();
    await press(el, "ArrowDown");
    setTimeout(() => sendKeys({ press: "Enter" }));
    event = (await oneEvent(el, "change")) as CustomEvent;
    expect(event.detail).to.deep.equal({ code: "US", value: 400 });
    await el.updateComplete;
    expect(root(el).querySelector('[role="status"]')!.textContent).to.equal("United States: 400, selected");
    setTimeout(() => sendKeys({ press: " " }));
    event = (await oneEvent(el, "change")) as CustomEvent;
    expect(event.detail).to.deep.equal({ code: "", value: null });

    const button = root(el).querySelector<HTMLButtonElement>("button.place")!;
    setTimeout(() => button.click());
    event = (await oneEvent(el, "change")) as CustomEvent;
    expect(event.detail).to.deep.equal({ code: "SG", value: 9 });
    await el.updateComplete;
    expect(button.getAttribute("aria-pressed")).to.equal("true");
  });

  it("skips bad values, adds up duplicate codes, and handles no data", async () => {
    const el = await fixture<LitMaterialWorldMap>(
      html`<lit-material-world-map .data=${{ US: NaN, FR: -1, de: 2, DE: 3 } as Record<string, number>}></lit-material-world-map>`,
    );
    expect(root(el).querySelectorAll("path.on").length).to.equal(1);
    expect([...root(el).querySelectorAll("tbody tr > *")].map((c) => c.textContent)).to.deep.equal(["Germany", "5"]);
    el.data = {};
    await el.updateComplete;
    expect(frame(el).getAttribute("aria-label")).to.equal("World map: no data");
    expect(root(el).querySelector("table")).to.be.null;
    expect(root(el).querySelector(".legend")).to.be.null;
  });

  it("shows the scale's ends in the legend, with a custom format", async () => {
    const el = await fixture<LitMaterialWorldMap>(
      html`<lit-material-world-map unit="req" .format=${(n: number) => `#${n}`} .data=${{ US: 25000, FR: 3 }}></lit-material-world-map>`,
    );
    expect([...root(el).querySelectorAll(".legend span")].map((c) => c.textContent)).to.deep.equal(["#3", "", "#25000 req"]);
  });

  it("formats large values compactly by default", async () => {
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map .data=${{ US: 25000 }}></lit-material-world-map>`);
    expect(root(el).querySelector("tbody td")!.textContent).to.equal("25K");
  });

  it("uses a registered translation and the language's country names", async () => {
    registerTranslation({ $code: "x-test", $name: "Test", $dir: "ltr", "worldMap.worldMap": "Mapa", "worldMap.nameNoData": "{name}: nic" } as never);
    const el = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map lang="x-test" .data=${{}}></lit-material-world-map>`);
    expect(frame(el).getAttribute("aria-label")).to.equal("Mapa: nic");
    const de = await fixture<LitMaterialWorldMap>(html`<lit-material-world-map lang="de" .data=${{ DE: 1 }}></lit-material-world-map>`);
    expect(root(de).querySelector("tbody th")!.textContent).to.equal("Deutschland");
  });
});
