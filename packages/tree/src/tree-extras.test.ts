import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./tree.js";
import "./tree-item.js";
import type { LitMaterialTree } from "./tree.js";
import type { LitMaterialTreeItem } from "./tree-item.js";

async function files() {
  const el = await fixture<LitMaterialTree>(html`
    <lit-material-tree reorderable>
      <lit-material-tree-item id="a">
        <span slot="label">create-order.yaml</span>
        <span slot="trailing" id="git">M</span>
        <button slot="actions" id="rename" aria-label="Rename">✎</button>
      </lit-material-tree-item>
      <lit-material-tree-item id="b"><span slot="label">get-order.yaml</span></lit-material-tree-item>
      <lit-material-tree-item id="c"><span slot="label">pay-order.yaml</span></lit-material-tree-item>
    </lit-material-tree>
  `);
  const items = Array.from(el.querySelectorAll("lit-material-tree-item")) as LitMaterialTreeItem[];
  await Promise.all(items.map((i) => i.updateComplete));
  return { el, items };
}

describe("lit-material-tree trailing, actions and reorder", () => {
  it("shows trailing decorations and doesn't select on an action click", async () => {
    const { el, items } = await files();
    const trailing = items[0]!.shadowRoot!.querySelector("slot[name=trailing]") as HTMLSlotElement;
    expect(trailing.assignedElements()[0]!.id).to.equal("git");
    let changed = false;
    el.addEventListener("change", () => (changed = true));
    (el.querySelector("#rename") as HTMLButtonElement).click();
    expect(items[0]!.selected).to.be.false;
    expect(changed).to.be.false;
    (items[0]!.shadowRoot!.querySelector(".row") as HTMLElement).click();
    expect(items[0]!.selected).to.be.true;
  });

  it("moves a node with Alt+Shift+ArrowDown and fires reorder", async () => {
    const { el, items } = await files();
    const events: unknown[] = [];
    el.addEventListener("reorder", (e) => {
      const d = (e as CustomEvent).detail;
      events.push({ id: d.item.id, parent: d.parent, from: d.from, to: d.to });
    });
    items[0]!.focus();
    await sendKeys({ press: "Alt+Shift+ArrowDown" });
    expect(events).to.deep.equal([{ id: "a", parent: null, from: 0, to: 1 }]);
    await sendKeys({ press: "Alt+Shift+ArrowUp" });
    expect(events.length).to.equal(1, "nothing above the first sibling");
  });

  it("fires reorder when a node is dragged below another", async () => {
    const { el, items } = await files();
    let detail: { from: number; to: number } | undefined;
    el.addEventListener("reorder", (e) => (detail = (e as CustomEvent).detail));
    const a = items[0]!.getBoundingClientRect();
    const c = items[2]!.getBoundingClientRect();
    items[0]!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, button: 0, pointerId: 3, clientX: a.left + 10, clientY: a.top + 5 }));
    window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 3, clientX: a.left + 10, clientY: c.bottom - 2 }));
    window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 3, clientX: a.left + 10, clientY: c.bottom - 2 }));
    expect(detail?.from).to.equal(0);
    expect(detail?.to).to.equal(2);
  });

  it("uses the compact row height under density=compact", async () => {
    const wrap = await fixture<HTMLElement>(html`
      <div density="compact" style="--md-sys-density-tree-item-min-height: 28px">
        <lit-material-tree><lit-material-tree-item><span slot="label">x</span></lit-material-tree-item></lit-material-tree>
      </div>
    `);
    const item = wrap.querySelector("lit-material-tree-item") as LitMaterialTreeItem;
    await item.updateComplete;
    const row = item.shadowRoot!.querySelector(".row") as HTMLElement;
    expect(getComputedStyle(row).minHeight).to.equal("28px");
  });
});
