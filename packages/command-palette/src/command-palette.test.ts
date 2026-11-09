import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./command-palette.js";
import type { CommandPaletteItem, LitMaterialCommandPalette } from "./command-palette.js";
import { fuzzyMatch } from "./fuzzy.js";

const items: CommandPaletteItem[] = [
  { id: "run", label: "Run collection", section: "Commands", shortcut: ["⌘", "R"] },
  { id: "new", label: "New request", section: "Commands", keywords: ["create"] },
  { id: "off", label: "Turn off sync", section: "Commands", disabled: true },
  { id: "co", label: "Create order", section: "Requests", hint: "orders" },
  { id: "lo", label: "List orders", section: "Requests", hint: "orders" },
  { id: "stg", label: "Staging", section: "Environments" },
];

const root = (el: LitMaterialCommandPalette) => el.shadowRoot!;
const input = (el: LitMaterialCommandPalette) => root(el).querySelector("input")!;
const options = (el: LitMaterialCommandPalette) => [...root(el).querySelectorAll<HTMLElement>('[role="option"]')];
const activeLabel = (el: LitMaterialCommandPalette) => root(el).querySelector('[aria-selected="true"] .label')!.textContent;
const settle = (el: LitMaterialCommandPalette) => el.updateComplete;

async function opened(): Promise<{ el: LitMaterialCommandPalette; opener: HTMLButtonElement }> {
  const wrap = await fixture<HTMLDivElement>(html`<div>
    <button id="opener">Open</button>
    <lit-material-command-palette .items=${items} .prefixes=${{ ">": "Commands", "@": "Environments" }}></lit-material-command-palette>
  </div>`);
  const opener = wrap.querySelector<HTMLButtonElement>("#opener")!;
  const el = wrap.querySelector<LitMaterialCommandPalette>("lit-material-command-palette")!;
  opener.focus();
  el.show();
  await settle(el);
  return { el, opener };
}

async function type(el: LitMaterialCommandPalette, text: string) {
  await sendKeys({ type: text });
  await settle(el);
}

describe("lit-material-command-palette", () => {
  it("opens as a modal with the field focused and the combobox wired to the listbox", async () => {
    const { el } = await opened();
    const dialog = root(el).querySelector("dialog")!;
    expect(dialog.open).to.be.true;
    expect(el.hasAttribute("open")).to.be.true;
    expect(root(el).activeElement).to.equal(input(el));
    const list = root(el).querySelector('[role="listbox"]')!;
    expect(input(el).getAttribute("role")).to.equal("combobox");
    expect(input(el).getAttribute("aria-controls")).to.equal(list.id);
    expect(input(el).getAttribute("aria-expanded")).to.equal("true");
    expect(input(el).getAttribute("aria-activedescendant")).to.equal(options(el)[0]!.id);
    expect(root(el).querySelectorAll('[role="group"]')).to.have.length(3);
  });

  it("filters fuzzily, best match first, and highlights the matched letters", async () => {
    const { el } = await opened();
    await type(el, "lord");
    expect(options(el).map((o) => o.querySelector(".label")!.textContent)).to.deep.equal(["List orders"]);
    expect(options(el)[0]!.querySelectorAll("mark").length).to.be.greaterThan(0);
    input(el).value = "";
    input(el).dispatchEvent(new Event("input"));
    await settle(el);
    await type(el, "create");
    // "New request" matches its keyword; sections keep their order.
    expect(options(el).map((o) => o.querySelector(".label")!.textContent)).to.deep.equal(["New request", "Create order"]);
  });

  it("limits to a section with a prefix and says when nothing matches", async () => {
    const { el } = await opened();
    await type(el, "@");
    expect(options(el).map((o) => o.querySelector(".label")!.textContent)).to.deep.equal(["Staging"]);
    await type(el, "zzz");
    expect(options(el)).to.have.length(0);
    expect(root(el).querySelector('[role="status"]')!.textContent).to.equal("No results");
    expect(input(el).getAttribute("aria-expanded")).to.equal("false");
  });

  it("moves with the arrows, Home and End, skipping disabled rows", async () => {
    const { el } = await opened();
    expect(activeLabel(el)).to.equal("Run collection");
    await sendKeys({ press: "ArrowDown" });
    await settle(el);
    expect(activeLabel(el)).to.equal("New request");
    await sendKeys({ press: "ArrowDown" });
    await settle(el);
    expect(activeLabel(el)).to.equal("Create order", "Turn off sync is disabled");
    await sendKeys({ press: "End" });
    await settle(el);
    expect(activeLabel(el)).to.equal("Staging");
    await sendKeys({ press: "ArrowDown" });
    await settle(el);
    expect(activeLabel(el)).to.equal("Staging", "stays on the last row");
    await sendKeys({ press: "Home" });
    await settle(el);
    expect(activeLabel(el)).to.equal("Run collection");
    expect(input(el).getAttribute("aria-activedescendant")).to.equal(root(el).querySelector('[aria-selected="true"]')!.id);
  });

  it("chooses with Enter, closes and gives focus back", async () => {
    const { el, opener } = await opened();
    await type(el, "staging");
    setTimeout(() => sendKeys({ press: "Enter" }));
    const ev = (await oneEvent(el, "select")) as CustomEvent;
    expect(ev.detail.item.id).to.equal("stg");
    expect(ev.detail.query).to.equal("staging");
    await settle(el);
    expect(el.open).to.be.false;
    expect(root(el).querySelector("dialog")!.open).to.be.false;
    expect(document.activeElement).to.equal(opener);
  });

  it("chooses with a click", async () => {
    const { el } = await opened();
    setTimeout(() => options(el)[3]!.click());
    const ev = (await oneEvent(el, "select")) as CustomEvent;
    expect(ev.detail.item.id).to.equal("co");
  });

  it("closes on Escape with a close event", async () => {
    const { el, opener } = await opened();
    setTimeout(() => sendKeys({ press: "Escape" }));
    await oneEvent(el, "close");
    await settle(el);
    expect(el.open).to.be.false;
    expect(document.activeElement).to.equal(opener);
  });

  it("closes on a click outside the panel", async () => {
    const { el } = await opened();
    const dialog = root(el).querySelector("dialog")!;
    setTimeout(() => dialog.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await oneEvent(el, "close");
    expect(el.open).to.be.false;
  });

  it("offers Tab to the app and keeps focus in the field", async () => {
    const { el } = await opened();
    await type(el, "why 409");
    setTimeout(() => sendKeys({ press: "Tab" }));
    const ev = (await oneEvent(el, "tab")) as CustomEvent;
    expect(ev.detail.query).to.equal("why 409");
    expect(ev.cancelable).to.be.true;
    await settle(el);
    expect(root(el).activeElement).to.equal(input(el));
    expect(el.open).to.be.true;
  });

  it("starts empty each time it opens and closes quietly with hide()", async () => {
    const { el } = await opened();
    await type(el, "run");
    let closed = false;
    el.addEventListener("close", () => (closed = true));
    el.hide();
    await settle(el);
    el.show();
    await settle(el);
    expect(input(el).value).to.equal("");
    expect(options(el)).to.have.length(items.length);
    expect(closed).to.be.false;
  });
});

describe("fuzzyMatch", () => {
  it("prefers word starts and runs of letters", () => {
    expect(fuzzyMatch("co", "Create order")!.at).to.deep.equal([0, 7]);
    expect(fuzzyMatch("ord", "Create order")!.at).to.deep.equal([7, 8, 9]);
    expect(fuzzyMatch("xyz", "Create order")).to.equal(null);
    expect(fuzzyMatch("", "anything")).to.deep.equal({ score: 0, at: [] });
    expect(fuzzyMatch("lo", "List orders")!.score).to.be.greaterThan(fuzzyMatch("lo", "hello")!.score);
  });
});
