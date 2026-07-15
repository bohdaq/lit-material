import { expect, fixture, html } from "@open-wc/testing";
import "./data-table-cell.js";
import type { LitMaterialDataTableCell } from "./data-table-cell.js";

describe("lit-material-data-table-cell", () => {
  it("renders role=cell by default", async () => {
    const el = await fixture<LitMaterialDataTableCell>(html`<lit-material-data-table-cell>Ada</lit-material-data-table-cell>`);
    expect(el.getAttribute("role")).to.equal("cell");
    expect(el.shadowRoot!.querySelector("button")).to.not.exist;
  });

  it("renders role=columnheader when header is set", async () => {
    const el = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header>Name</lit-material-data-table-cell>`,
    );
    expect(el.getAttribute("role")).to.equal("columnheader");
  });

  it("updates role reactively when header changes", async () => {
    const el = await fixture<LitMaterialDataTableCell>(html`<lit-material-data-table-cell>Ada</lit-material-data-table-cell>`);
    expect(el.getAttribute("role")).to.equal("cell");
    el.header = true;
    await el.updateComplete;
    expect(el.getAttribute("role")).to.equal("columnheader");
  });

  it("only renders a sort button when header and sort-key are both set", async () => {
    const headerOnly = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header>Name</lit-material-data-table-cell>`,
    );
    expect(headerOnly.shadowRoot!.querySelector("button")).to.not.exist;

    const sortKeyOnly = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell sort-key="name">Name</lit-material-data-table-cell>`,
    );
    expect(sortKeyOnly.shadowRoot!.querySelector("button")).to.not.exist;

    const both = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header sort-key="name">Name</lit-material-data-table-cell>`,
    );
    expect(both.shadowRoot!.querySelector("button")).to.exist;
  });

  it("dispatches a composed, bubbling sort-request event with the sort key on click", async () => {
    const el = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header sort-key="name">Name</lit-material-data-table-cell>`,
    );
    let detail: { sortKey?: string } | undefined;
    el.addEventListener("sort-request", (event) => {
      detail = (event as CustomEvent<{ sortKey?: string }>).detail;
    });
    el.shadowRoot!.querySelector("button")!.click();
    expect(detail).to.deep.equal({ sortKey: "name" });
  });

  it("right-aligns content when numeric is set", async () => {
    const el = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell numeric>42</lit-material-data-table-cell>`,
    );
    expect(getComputedStyle(el).textAlign).to.equal("end");
  });

  it("only renders a resize handle when resizable is set", async () => {
    const plain = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header>Name</lit-material-data-table-cell>`,
    );
    expect(plain.shadowRoot!.querySelector(".resize-handle")).to.not.exist;

    const resizable = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header resizable>Name</lit-material-data-table-cell>`,
    );
    expect(resizable.shadowRoot!.querySelector(".resize-handle")).to.exist;
  });

  it("dispatches column-resize with a wider width when dragging the handle further right", async () => {
    const el = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header resizable style="width: 100px;">Name</lit-material-data-table-cell>`,
    );
    const handle = el.shadowRoot!.querySelector(".resize-handle")!;
    const startWidth = el.getBoundingClientRect().width;
    const detail: { width: number }[] = [];
    el.addEventListener("column-resize", (event) => detail.push((event as CustomEvent<{ width: number }>).detail));

    handle.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, clientX: 0, bubbles: true, composed: true }));
    handle.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: 40, bubbles: true, composed: true }));
    handle.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, clientX: 40, bubbles: true, composed: true }));

    expect(detail).to.have.length(2);
    expect(detail[0].width).to.equal(Math.round(startWidth + 40));
    expect(detail[1].width).to.equal(Math.round(startWidth + 40));
  });

  it("clamps the reported width to min-width when dragging past it", async () => {
    const el = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header resizable min-width="80" style="width: 100px;"
        >Name</lit-material-data-table-cell
      >`,
    );
    const handle = el.shadowRoot!.querySelector(".resize-handle")!;
    let detail: { width: number } | undefined;
    el.addEventListener("column-resize", (event) => {
      detail = (event as CustomEvent<{ width: number }>).detail;
    });

    handle.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, clientX: 0, bubbles: true, composed: true }));
    handle.dispatchEvent(
      new PointerEvent("pointermove", { pointerId: 1, clientX: -500, bubbles: true, composed: true }),
    );

    expect(detail!.width).to.equal(80);
  });

  it("applies its width as an inline flex-basis when flex is set", async () => {
    const el = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell flex width="120px">Ada</lit-material-data-table-cell>`,
    );
    expect(el.style.flex).to.equal("0 0 120px");
  });

  it("falls back to a flex-basis of auto when flex is set without a width", async () => {
    const el = await fixture<LitMaterialDataTableCell>(html`<lit-material-data-table-cell flex>Ada</lit-material-data-table-cell>`);
    expect(el.style.flex).to.equal("0 0 auto");
  });

  it("passes axe accessibility checks inside a table/row ancestor", async () => {
    const wrapper = await fixture<HTMLElement>(html`
      <div role="table"><div role="row"><lit-material-data-table-cell header>Name</lit-material-data-table-cell></div></div>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
