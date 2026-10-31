import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./dual-list-selector.js";
import type { DualListItem, LitMaterialDualListSelector } from "./dual-list-selector.js";

const ITEMS: DualListItem[] = [
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "delete", label: "Delete" },
  { value: "admin", label: "Admin", disabled: true },
];

const selector = (selected: string[] = []) =>
  fixture<LitMaterialDualListSelector>(
    html`<lit-material-dual-list-selector filterable .items=${ITEMS} .selected=${selected}></lit-material-dual-list-selector>`,
  );
const list = (el: LitMaterialDualListSelector, side: "available" | "chosen") =>
  el.shadowRoot!.querySelector<HTMLElement>(`[role=listbox][id$="-${side}"]`)!;
const labels = (el: LitMaterialDualListSelector, side: "available" | "chosen") =>
  Array.from(list(el, side).querySelectorAll("[role=option]")).map((o) => o.textContent!.trim());
const option = (el: LitMaterialDualListSelector, label: string) =>
  Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>("[role=option]")).find((o) => o.textContent!.trim() === label)!;
const button = (el: LitMaterialDualListSelector, label: string) =>
  el.shadowRoot!.querySelector<HTMLElement & { disabled: boolean }>(`[aria-label="${label}"]`)!;

describe("lit-material-dual-list-selector", () => {
  it("splits items into available and chosen, in item order", async () => {
    const el = await selector(["delete"]);
    expect(labels(el, "available")).to.deep.equal(["Read", "Write", "Admin"]);
    expect(labels(el, "chosen")).to.deep.equal(["Delete"]);
    expect(list(el, "available").getAttribute("aria-multiselectable")).to.equal("true");
  });

  it("moves marked items with the button and fires change", async () => {
    const el = await selector();
    option(el, "Read").click();
    option(el, "Delete").dispatchEvent(new MouseEvent("click", { ctrlKey: true, bubbles: true }));
    await el.updateComplete;
    expect(option(el, "Read").getAttribute("aria-selected")).to.equal("true");
    const listener = oneEvent(el, "change");
    button(el, "Move marked to chosen").click();
    expect((await listener).detail.selected).to.deep.equal(["read", "delete"]);
    await el.updateComplete;
    expect(labels(el, "chosen")).to.deep.equal(["Read", "Delete"]);
  });

  it("marks a range with Shift-click", async () => {
    const el = await selector();
    option(el, "Read").click();
    option(el, "Delete").dispatchEvent(new MouseEvent("click", { shiftKey: true, bubbles: true }));
    await el.updateComplete;
    expect(["Read", "Write", "Delete"].map((l) => option(el, l).getAttribute("aria-selected"))).to.deep.equal(["true", "true", "true"]);
  });

  it("moves a double-clicked item", async () => {
    const el = await selector(["read"]);
    option(el, "Read").dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    await el.updateComplete;
    expect(el.selected).to.deep.equal([]);
  });

  it("never moves a disabled item, even with move all", async () => {
    const el = await selector();
    button(el, "Move all shown to chosen").click();
    await el.updateComplete;
    expect(el.selected).to.deep.equal(["read", "write", "delete"]);
    expect(labels(el, "available")).to.deep.equal(["Admin"]);
    expect(button(el, "Move all shown to chosen").disabled).to.be.true;
  });

  it("works from the keyboard", async () => {
    const el = await selector();
    list(el, "available").focus();
    await el.updateComplete;
    await sendKeys({ press: "ArrowDown" }); // Write (focus made Read active)
    await sendKeys({ press: "Space" });
    await sendKeys({ press: "Shift+ArrowDown" }); // extend to Delete
    await el.updateComplete;
    const active = list(el, "available").getAttribute("aria-activedescendant");
    expect(el.shadowRoot!.getElementById(active!)!.textContent!.trim()).to.equal("Delete");
    await sendKeys({ press: "Enter" });
    await el.updateComplete;
    expect(el.selected).to.deep.equal(["write", "delete"]);
  });

  it("filters each list, and move all takes only what's shown", async () => {
    const el = await selector();
    const filter = el.shadowRoot!.querySelector("lit-material-text-field") as HTMLElement & { value: string };
    filter.value = "wr";
    filter.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(labels(el, "available")).to.deep.equal(["Write"]);
    button(el, "Move all shown to chosen").click();
    expect(el.selected).to.deep.equal(["write"]);
  });

  it("says what's marked", async () => {
    const el = await selector();
    option(el, "Read").click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".count")!.textContent).to.equal("1 of 4 marked");
  });
});
