import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { render } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { sendKeys } from "@web/test-runner-commands";
import "./sortable.js";
import type { LitMaterialSortable, SortDetail } from "./sortable.js";

const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));

/** A list that reorders its data on `sort`, as an app would. */
async function list(names = ["Alpha", "Beta", "Gamma", "Delta"], group = "") {
  const host = await fixture<HTMLDivElement>(html`<div style="width: 240px"></div>`);
  const data = [...names];
  const draw = () =>
    render(
      html`<lit-material-sortable group=${group} label="Things" @sort=${(e: CustomEvent<SortDetail>) => {
        if (e.detail.toList !== e.detail.fromList) return;
        const [moved] = data.splice(e.detail.from, 1);
        data.splice(e.detail.to, 0, moved!);
        draw();
      }}>
        ${repeat(data, (n) => n, (n) => html`<div data-sort-id=${n} style="height: 32px; display: flex"><button data-sort-handle aria-label=${`Reorder ${n}`}>⋮</button>${n}</div>`)}
      </lit-material-sortable>`,
      host,
    );
  draw();
  const el = host.querySelector("lit-material-sortable") as LitMaterialSortable;
  await el.updateComplete;
  return { el, order: () => [...data], host };
}
const handle = (el: LitMaterialSortable, name: string) => el.querySelector<HTMLElement>(`[aria-label="Reorder ${name}"]`)!;

function pointer(type: string, target: EventTarget, x: number, y: number) {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, clientX: x, clientY: y, pointerId: 1, button: 0, isPrimary: true }));
}

describe("lit-material-sortable", () => {
  it("prepares handles: touch-action and a hint", async () => {
    const { el } = await list();
    const h = handle(el, "Alpha");
    expect(h.style.touchAction).to.equal("none");
    expect(h.getAttribute("aria-description")).to.equal("Press Space to reorder");
  });

  it("reorders by dragging a handle", async () => {
    const { el, order } = await list();
    const from = handle(el, "Alpha").getBoundingClientRect();
    const gamma = el.querySelector<HTMLElement>('[data-sort-id="Gamma"]')!.getBoundingClientRect();
    const x = from.left + 4;
    pointer("pointerdown", handle(el, "Alpha"), x, from.top + 4);
    pointer("pointermove", document, x, from.top + 20);
    pointer("pointermove", document, x, gamma.bottom - 2); // below Gamma's middle
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".indicator")).to.exist;
    const listener = oneEvent(el, "sort");
    pointer("pointerup", document, x, gamma.bottom - 2);
    const { detail } = await listener;
    expect([detail.id, detail.from, detail.to]).to.deep.equal(["Alpha", 0, 2]);
    expect(order()).to.deep.equal(["Beta", "Gamma", "Alpha", "Delta"]);
  });

  it("ignores a click without movement", async () => {
    const { el, order } = await list();
    let fired = false;
    el.addEventListener("sort", () => (fired = true));
    const box = handle(el, "Beta").getBoundingClientRect();
    pointer("pointerdown", handle(el, "Beta"), box.left + 2, box.top + 2);
    pointer("pointerup", document, box.left + 3, box.top + 3);
    expect(fired).to.be.false;
    expect(order()[1]).to.equal("Beta");
  });

  it("moves between lists of the same group", async () => {
    const a = await list(["A1", "A2"], "g");
    const b = await list(["B1", "B2"], "g");
    const listener = oneEvent(a.el, "sort");
    const from = handle(a.el, "A1").getBoundingClientRect();
    const target = b.el.querySelector<HTMLElement>('[data-sort-id="B1"]')!.getBoundingClientRect();
    pointer("pointerdown", handle(a.el, "A1"), from.left + 4, from.top + 4);
    pointer("pointermove", document, target.left + 40, target.bottom - 2);
    pointer("pointerup", document, target.left + 40, target.bottom - 2);
    const { detail } = await listener;
    expect(detail.toList).to.equal(b.el);
    expect(detail.to).to.equal(1);
  });

  it("reorders from the keyboard and keeps focus on the handle", async () => {
    const { el, order } = await list();
    handle(el, "Alpha").focus();
    await sendKeys({ press: "Space" });
    expect(el.querySelector('[data-sort-id="Alpha"]')!.hasAttribute("data-sort-grabbed")).to.be.true;
    await sendKeys({ press: "ArrowDown" });
    await frames();
    await sendKeys({ press: "ArrowDown" });
    await frames();
    expect(order()).to.deep.equal(["Beta", "Gamma", "Alpha", "Delta"]);
    expect(document.activeElement).to.equal(handle(el, "Alpha"));
    await sendKeys({ press: "Space" });
    expect(el.querySelector("[data-sort-grabbed]")).to.be.null;
    await frames();
    expect(el.shadowRoot!.querySelector("[role=status]")!.textContent).to.include("dropped at position 3");
  });

  it("keeps keys pressed right after a move", async () => {
    const { el, order } = await list();
    handle(el, "Alpha").focus();
    await sendKeys({ press: "Space" });
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "Space" });
    expect(order()).to.deep.equal(["Beta", "Gamma", "Alpha", "Delta"]);
    expect(el.querySelector("[data-sort-grabbed]")).to.be.null;
    expect(document.activeElement).to.equal(handle(el, "Alpha"));
  });

  it("puts the item back on Escape", async () => {
    const { el, order } = await list();
    handle(el, "Beta").focus();
    await sendKeys({ press: "Space" });
    await sendKeys({ press: "ArrowDown" });
    await frames();
    await sendKeys({ press: "Escape" });
    await frames();
    expect(order()).to.deep.equal(["Alpha", "Beta", "Gamma", "Delta"]);
  });

  it("does nothing when disabled", async () => {
    const { el, order } = await list();
    el.disabled = true;
    handle(el, "Alpha").focus();
    await sendKeys({ press: "Space" });
    await sendKeys({ press: "ArrowDown" });
    await frames();
    expect(order()[0]).to.equal("Alpha");
  });

  it("works inside another component's shadow root", async () => {
    const outer = await fixture<HTMLDivElement>(html`<div></div>`);
    const root = outer.attachShadow({ mode: "open" });
    const data = ["One", "Two", "Three"];
    render(
      html`<lit-material-sortable>${data.map((n) => html`<div data-sort-id=${n} style="height: 32px"><button data-sort-handle>${n}</button></div>`)}</lit-material-sortable>`,
      root,
    );
    const el = root.querySelector("lit-material-sortable") as LitMaterialSortable;
    await el.updateComplete;
    const one = root.querySelector<HTMLElement>('[data-sort-id="One"] button')!;
    const three = root.querySelector<HTMLElement>('[data-sort-id="Three"]')!.getBoundingClientRect();
    const box = one.getBoundingClientRect();
    const listener = oneEvent(el, "sort");
    pointer("pointerdown", one, box.left + 2, box.top + 2);
    pointer("pointermove", document, box.left + 2, three.bottom - 2);
    pointer("pointerup", document, box.left + 2, three.bottom - 2);
    expect((await listener).detail.to).to.equal(2);
  });
});
