import { expect, fixture, html } from "@open-wc/testing";
import "./data-table.js";
import "./data-table-row.js";
import "./data-table-cell.js";
import type { LitMaterialDataTable } from "./data-table.js";
import type { LitMaterialDataTableCell } from "./data-table-cell.js";
import type { LitMaterialDataTableRow } from "./data-table-row.js";

async function tableFixture() {
  const el = await fixture<LitMaterialDataTable>(html`
    <lit-material-data-table>
      <lit-material-data-table-row header>
        <lit-material-data-table-cell header
          ><input type="checkbox" data-select-all aria-label="Select all rows"
        /></lit-material-data-table-cell>
        <lit-material-data-table-cell header sort-key="name">Name</lit-material-data-table-cell>
        <lit-material-data-table-cell header sort-key="age" numeric>Age</lit-material-data-table-cell>
      </lit-material-data-table-row>
      <lit-material-data-table-row data-row-id="1">
        <lit-material-data-table-cell
          ><input type="checkbox" data-row-select aria-label="Select row: Ada"
        /></lit-material-data-table-cell>
        <lit-material-data-table-cell>Ada</lit-material-data-table-cell>
        <lit-material-data-table-cell numeric>32</lit-material-data-table-cell>
      </lit-material-data-table-row>
      <lit-material-data-table-row data-row-id="2">
        <lit-material-data-table-cell
          ><input type="checkbox" data-row-select aria-label="Select row: Grace"
        /></lit-material-data-table-cell>
        <lit-material-data-table-cell>Grace</lit-material-data-table-cell>
        <lit-material-data-table-cell numeric>45</lit-material-data-table-cell>
      </lit-material-data-table-row>
    </lit-material-data-table>
  `);
  const rows = Array.from(el.querySelectorAll<LitMaterialDataTableRow>("lit-material-data-table-row"));
  const headerCells = Array.from(el.querySelectorAll<LitMaterialDataTableCell>("lit-material-data-table-cell[sort-key]"));
  const rowCheckboxes = Array.from(el.querySelectorAll<HTMLInputElement>("[data-row-select]"));
  const selectAll = el.querySelector<HTMLInputElement>("[data-select-all]")!;
  return { el, rows, headerCells, rowCheckboxes, selectAll };
}

describe("lit-material-data-table", () => {
  it("renders role=table", async () => {
    const { el } = await tableFixture();
    expect(el.getAttribute("role")).to.equal("table");
  });

  it("clicking a sortable header cell fires sort-change and syncs the indicator, defaulting to ascending", async () => {
    const { el, headerCells } = await tableFixture();
    let detail: { sortKey?: string; sortDirection?: string } | undefined;
    el.addEventListener("sort-change", (event) => {
      detail = (event as CustomEvent).detail;
    });

    headerCells[0]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(detail).to.deep.equal({ sortKey: "name", sortDirection: "ascending" });
    expect(el.sortKey).to.equal("name");
    expect(el.sortDirection).to.equal("ascending");
    expect(headerCells[0]!.sortDirection).to.equal("ascending");
    expect(headerCells[1]!.sortDirection).to.equal("none");
  });

  it("clicking the same header again toggles direction instead of resetting it", async () => {
    const { el, headerCells } = await tableFixture();
    headerCells[0]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    headerCells[0]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(el.sortDirection).to.equal("descending");
    expect(headerCells[0]!.sortDirection).to.equal("descending");
  });

  it("clicking a different header switches the active column back to ascending", async () => {
    const { el, headerCells } = await tableFixture();
    headerCells[0]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    headerCells[1]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(el.sortKey).to.equal("age");
    expect(el.sortDirection).to.equal("ascending");
    expect(headerCells[0]!.sortDirection).to.equal("none");
    expect(headerCells[1]!.sortDirection).to.equal("ascending");
  });

  it("checking a row checkbox selects that row and fires selection-change with its row id", async () => {
    const { el, rows, rowCheckboxes } = await tableFixture();
    let detail: { selected?: string[] } | undefined;
    el.addEventListener("selection-change", (event) => {
      detail = (event as CustomEvent).detail;
    });

    rowCheckboxes[0]!.click();
    await el.updateComplete;

    expect(rows[1]!.selected).to.be.true;
    expect(detail).to.deep.equal({ selected: ["1"] });
  });

  it("select-all checks every row checkbox and selects every row", async () => {
    const { el, rows, rowCheckboxes, selectAll } = await tableFixture();
    let detail: { selected?: string[] } | undefined;
    el.addEventListener("selection-change", (event) => {
      detail = (event as CustomEvent).detail;
    });

    selectAll.click();
    await el.updateComplete;

    expect(rowCheckboxes.every((box) => box.checked)).to.be.true;
    expect(rows[1]!.selected).to.be.true;
    expect(rows[2]!.selected).to.be.true;
    expect(detail!.selected).to.have.members(["1", "2"]);
  });

  it("select-all becomes indeterminate when only some rows are selected", async () => {
    const { el, rowCheckboxes, selectAll } = await tableFixture();
    rowCheckboxes[0]!.click();
    await el.updateComplete;

    expect(selectAll.indeterminate).to.be.true;
    expect(selectAll.checked).to.be.false;
  });

  it("select-all reflects fully-checked state once every row is individually checked", async () => {
    const { el, rowCheckboxes, selectAll } = await tableFixture();
    rowCheckboxes[0]!.click();
    await el.updateComplete;
    rowCheckboxes[1]!.click();
    await el.updateComplete;

    expect(selectAll.indeterminate).to.be.false;
    expect(selectAll.checked).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await tableFixture();
    await expect(el).to.be.accessible();
  });

  it("applies a column-resize width to every cell in that column, not just the dragged header", async () => {
    const { el, rows, headerCells } = await tableFixture();
    // headerCells[0] is the "Name" column (index 1: index 0 is the select-all checkbox cell).
    headerCells[0]!.dispatchEvent(
      new CustomEvent("column-resize", { bubbles: true, composed: true, detail: { width: 220 } }),
    );

    const headerRow = el.querySelector("lit-material-data-table-row[header]")!;
    const resizedHeaderCell = headerRow.children[1] as HTMLElement;
    expect(resizedHeaderCell).to.equal(headerCells[0]);
    expect(resizedHeaderCell.style.width).to.equal("220px");
    expect((rows[1]!.children[1] as HTMLElement).style.width).to.equal("220px");
    expect((rows[2]!.children[1] as HTMLElement).style.width).to.equal("220px");
    // Untouched column (index 0, the checkbox column) is left alone.
    expect((rows[1]!.children[0] as HTMLElement).style.width).to.equal("");
  });
});
