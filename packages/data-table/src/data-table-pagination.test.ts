import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./data-table-pagination.js";
import type { LitMaterialDataTablePagination } from "./data-table-pagination.js";

async function paginationFixture() {
  return fixture<LitMaterialDataTablePagination>(
    html`<lit-material-data-table-pagination total="97" page-size="10"></lit-material-data-table-pagination>`,
  );
}

describe("lit-material-data-table-pagination", () => {
  it("has group role and an accessible label", async () => {
    const el = await paginationFixture();
    expect(el.getAttribute("role")).to.equal("group");
    expect(el.getAttribute("aria-label")).to.equal("Pagination");
  });

  it("renders the 1-based range for the current page", async () => {
    const el = await paginationFixture();
    expect(el.shadowRoot!.querySelector(".range")!.textContent).to.include("1–10 of 97");
  });

  it("disables first/previous on the first page and next/last on the last page", async () => {
    const el = await paginationFixture();
    const buttons = el.shadowRoot!.querySelectorAll("button");
    const [first, previous, next, last] = Array.from(buttons) as HTMLButtonElement[];
    expect(first.disabled).to.be.true;
    expect(previous.disabled).to.be.true;
    expect(next.disabled).to.be.false;
    expect(last.disabled).to.be.false;

    el.page = 9; // last page: floor(97/10) => pages 0..9
    await el.updateComplete;
    expect(next.disabled).to.be.true;
    expect(last.disabled).to.be.true;
  });

  it("fires page-change with the next page on next-button click", async () => {
    const el = await paginationFixture();
    const next = el.shadowRoot!.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
    const listener = oneEvent(el, "page-change");
    next.click();
    const { detail } = await listener;
    expect(detail).to.deep.equal({ page: 1, pageSize: 10 });
    expect(el.page).to.equal(1);
  });

  it("fires page-change with the last page on last-button click", async () => {
    const el = await paginationFixture();
    const last = el.shadowRoot!.querySelector('button[aria-label="Last page"]') as HTMLButtonElement;
    const listener = oneEvent(el, "page-change");
    last.click();
    const { detail } = await listener;
    expect(detail).to.deep.equal({ page: 9, pageSize: 10 });
  });

  it("resets to page 0 and fires page-change when the page size changes", async () => {
    const el = await paginationFixture();
    el.page = 5;
    await el.updateComplete;
    const select = el.shadowRoot!.querySelector("select") as HTMLSelectElement;
    const listener = oneEvent(el, "page-change");
    select.value = "25";
    select.dispatchEvent(new Event("change"));
    const { detail } = await listener;
    expect(detail).to.deep.equal({ page: 0, pageSize: 25 });
    expect(el.page).to.equal(0);
  });

  it("clamps a page value beyond the page count instead of showing a negative range", async () => {
    const el = await paginationFixture();
    el.page = 999;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".range")!.textContent).to.include("91–97 of 97");
  });

  it("shows 0–0 of 0 and disables every button when there are no rows", async () => {
    const el = await fixture<LitMaterialDataTablePagination>(
      html`<lit-material-data-table-pagination total="0"></lit-material-data-table-pagination>`,
    );
    expect(el.shadowRoot!.querySelector(".range")!.textContent).to.include("0–0 of 0");
    const buttons = Array.from(el.shadowRoot!.querySelectorAll("button")) as HTMLButtonElement[];
    expect(buttons.every((button) => button.disabled)).to.be.true;
  });

  it("pages by has-more when the total is unknown", async () => {
    const el = await fixture<LitMaterialDataTablePagination>(
      html`<lit-material-data-table-pagination unknown-total has-more page-size="25"></lit-material-data-table-pagination>`,
    );
    const root = el.shadowRoot!;
    expect(root.querySelector(".range")!.textContent).to.equal("Page 1");
    expect(root.querySelector('button[aria-label="Last page"]')).to.be.null;
    const next = root.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
    expect(next.disabled).to.be.false;

    const listener = oneEvent(el, "page-change");
    next.click();
    expect((await listener).detail).to.deep.equal({ page: 1, pageSize: 25 });
    el.hasMore = false;
    await el.updateComplete;
    expect(root.querySelector(".range")!.textContent).to.equal("Page 2");
    expect(next.disabled).to.be.true;
    expect((root.querySelector('button[aria-label="Previous page"]') as HTMLButtonElement).disabled).to.be.false;
  });

  it("disables every control while disabled", async () => {
    const el = await paginationFixture();
    el.page = 3;
    el.disabled = true;
    await el.updateComplete;
    const controls = el.shadowRoot!.querySelectorAll<HTMLButtonElement | HTMLSelectElement>("button, select");
    expect(Array.from(controls).every((c) => c.disabled)).to.be.true;
  });
});
