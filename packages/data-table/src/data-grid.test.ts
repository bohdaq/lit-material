import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./data-grid.js";
import type { DataGridColumn, LitMaterialDataGrid } from "./data-grid.js";
import type { LitMaterialTextField } from "@lit-material/text-field/text-field.js";
import type { LitMaterialNumberField } from "@lit-material/text-field/number-field.js";
import type { LitMaterialSelect } from "@lit-material/select/select.js";

type Person = { id: number; name: string; dept: string; city: string; salary: number; level?: number };

const people = (): Person[] => [
  { id: 1, name: "Ada", dept: "eng", city: "London", salary: 100, level: 2 },
  { id: 2, name: "Grace", dept: "ops", city: "New York", salary: 80, level: 1 },
  { id: 3, name: "Alan", dept: "eng", city: "London", salary: 120, level: 3 },
  { id: 4, name: "Edsger", dept: "eng", city: "Austin", salary: 90, level: 2 },
];

const columns = (): DataGridColumn<Person>[] => [
  { key: "name", header: "Name", sortable: true, editable: true },
  {
    key: "dept",
    header: "Department",
    sortable: true,
    editable: true,
    editor: "select",
    options: [
      { value: "eng", label: "Engineering" },
      { value: "ops", label: "Operations" },
    ],
  },
  { key: "city", header: "City" },
  { key: "salary", header: "Salary", numeric: true, sortable: true, editable: true, aggregate: "sum" },
  { key: "level", header: "Level", numeric: true, editor: "select", editable: true, options: [1, 2, 3], aggregate: "avg" },
];

async function gridFixture(attrs: Partial<LitMaterialDataGrid<Person>> = {}) {
  const el = await fixture<LitMaterialDataGrid<Person>>(html`<lit-material-data-grid row-key="id" label="People"></lit-material-data-grid>`);
  el.columns = columns();
  el.rows = people();
  Object.assign(el, attrs);
  await el.updateComplete;
  return el;
}

const shadow = (el: LitMaterialDataGrid<Person>) => el.shadowRoot!;
const table = (el: LitMaterialDataGrid<Person>) => shadow(el).querySelector("lit-material-data-table")!;
const bodyRows = (el: LitMaterialDataGrid<Person>) => [...shadow(el).querySelectorAll<HTMLElement>("lit-material-data-table-row:not([header])")];
const dataRows = (el: LitMaterialDataGrid<Person>) => bodyRows(el).filter((row) => !row.classList.contains("group"));
const groupRows = (el: LitMaterialDataGrid<Person>) => bodyRows(el).filter((row) => row.classList.contains("group"));
const cell = (el: LitMaterialDataGrid<Person>, r: number, c: number) =>
  shadow(el).querySelector<HTMLElement>(`lit-material-data-table-cell[data-r="${r}"][data-c="${c}"]`)!;
const text = (node: Element) => (node.textContent ?? "").replace(/\s+/g, " ").trim();
const names = (el: LitMaterialDataGrid<Person>) => dataRows(el).map((row) => text(row.children[0]!));
const active = (el: LitMaterialDataGrid<Person>) => shadow(el).activeElement as HTMLElement | null;
const settle = async (el: LitMaterialDataGrid<Person>) => {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  await el.updateComplete;
};

describe("lit-material-data-grid", () => {
  describe("rendering", () => {
    it("renders a grid of header and data cells with ARIA roles", async () => {
      const el = await gridFixture();
      expect(table(el).getAttribute("role")).to.equal("grid");
      expect(table(el).getAttribute("aria-label")).to.equal("People");
      const headers = [...shadow(el).querySelectorAll("lit-material-data-table-cell[header]")];
      expect(headers.map((h) => h.getAttribute("role"))).to.deep.equal(Array(5).fill("columnheader"));
      expect(headers.map(text)).to.deep.equal(["Name", "Department", "City", "Salary", "Level"]);
      expect(dataRows(el)).to.have.length(4);
      expect(cell(el, 1, 0).getAttribute("role")).to.equal("gridcell");
      // select columns show the option label; numbers are formatted.
      expect(text(cell(el, 1, 1))).to.equal("Engineering");
      expect(cell(el, 1, 3).hasAttribute("numeric")).to.be.true;
      // A read-only column is marked when others are editable.
      expect(cell(el, 1, 2).getAttribute("aria-readonly")).to.equal("true");
      expect(cell(el, 1, 0).hasAttribute("aria-readonly")).to.be.false;
    });

    it("takes columns and rows as JSON attributes", async () => {
      const el = await fixture<LitMaterialDataGrid<Person>>(html`<lit-material-data-grid
        row-key="id"
        columns=${JSON.stringify([{ key: "name", header: "Name" }, { key: "salary", header: "Salary", numeric: true }])}
        rows=${JSON.stringify([{ id: 1, name: "Ada", salary: 1234.5 }])}
      ></lit-material-data-grid>`);
      expect(names(el)).to.deep.equal(["Ada"]);
      expect(text(cell(el, 1, 1))).to.equal("1,234.5");
    });

    it("uses format(value, row) for display", async () => {
      const el = await gridFixture();
      el.columns = [{ key: "salary", header: "Salary", format: (v, row) => `$${v} (${(row as Person).name})` }];
      await el.updateComplete;
      expect(text(cell(el, 1, 0))).to.equal("$100 (Ada)");
    });

    it("shows a message when there are no rows", async () => {
      const el = await gridFixture({ rows: [] });
      expect(text(bodyRows(el)[0]!)).to.equal("No rows");
    });

    it("applies a column width through the CSSOM", async () => {
      const el = await gridFixture();
      el.columns = [{ key: "name", header: "Name", width: 180 }];
      await el.updateComplete;
      expect(cell(el, 0, 0).style.width).to.equal("180px");
    });

    it("passes axe accessibility checks, flat and grouped", async () => {
      const el = await gridFixture({ selectable: true });
      await expect(el).to.be.accessible();
      el.groupBy = ["dept"];
      el.expandAll();
      await settle(el);
      await expect(el).to.be.accessible();
    });
  });

  describe("sorting", () => {
    it("sorts by a sortable header's column, toggling direction, and fires sort-change", async () => {
      const el = await gridFixture();
      const header = cell(el, 0, 0);
      setTimeout(() => header.shadowRoot!.querySelector("button")!.click());
      const event = (await oneEvent(el, "sort-change")) as CustomEvent;
      expect(event.detail).to.deep.equal({ sortKey: "name", sortDirection: "ascending" });
      await settle(el);
      expect(names(el)).to.deep.equal(["Ada", "Alan", "Edsger", "Grace"]);
      expect(header.getAttribute("aria-sort")).to.equal("ascending");
      expect(header.getAttribute("sort-direction")).to.equal("ascending");

      header.shadowRoot!.querySelector("button")!.click();
      await settle(el);
      expect(el.sortDirection).to.equal("descending");
      expect(names(el)).to.deep.equal(["Grace", "Edsger", "Alan", "Ada"]);
      expect(text(shadow(el).querySelector("[role=status]")!)).to.equal("Sorted by Name, descending");
    });

    it("sorts numbers numerically", async () => {
      const el = await gridFixture({ sortKey: "salary", sortDirection: "descending" });
      expect(names(el)).to.deep.equal(["Alan", "Ada", "Edsger", "Grace"]);
    });

    it("does not make a non-sortable header a button, and keeps sort buttons out of the tab order", async () => {
      const el = await gridFixture();
      expect(cell(el, 0, 2).shadowRoot!.querySelector("button")).to.be.null;
      expect(cell(el, 0, 0).shadowRoot!.querySelector("button")!.getAttribute("tabindex")).to.equal("-1");
    });
  });

  describe("keyboard", () => {
    it("has exactly one tab stop (roving tabindex), starting on the first header", async () => {
      const el = await gridFixture({ selectable: true });
      const stops = [...shadow(el).querySelectorAll("[tabindex='0']")];
      expect(stops).to.have.length(1);
      expect(stops[0]!.matches("input[type=checkbox]")).to.be.true;
    });

    it("moves between cells with arrow keys, Home/End and Ctrl+Home/End", async () => {
      const el = await gridFixture();
      cell(el, 0, 0).focus();
      await sendKeys({ press: "ArrowDown" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 1, 0));
      expect(cell(el, 1, 0).getAttribute("tabindex")).to.equal("0");
      expect(cell(el, 0, 0).getAttribute("tabindex")).to.equal("-1");
      await sendKeys({ press: "ArrowRight" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 1, 1));
      await sendKeys({ press: "End" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 1, 4));
      await sendKeys({ press: "ArrowRight" }); // stays at the edge
      await settle(el);
      expect(active(el)).to.equal(cell(el, 1, 4));
      await sendKeys({ press: "Home" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 1, 0));
      await sendKeys({ press: "Control+End" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 4, 4));
      await sendKeys({ press: "Control+Home" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 0, 0));
      await sendKeys({ press: "ArrowUp" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 0, 0));
    });

    it("flips ArrowLeft/ArrowRight in right-to-left layouts", async () => {
      const el = await gridFixture();
      el.setAttribute("dir", "rtl");
      cell(el, 1, 0).focus();
      await sendKeys({ press: "ArrowLeft" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 1, 1));
      await sendKeys({ press: "ArrowRight" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 1, 0));
    });

    it("Enter on a sortable header sorts", async () => {
      const el = await gridFixture();
      cell(el, 0, 3).focus();
      await sendKeys({ press: "Enter" });
      await settle(el);
      expect(el.sortKey).to.equal("salary");
      expect(names(el)).to.deep.equal(["Grace", "Edsger", "Ada", "Alan"]);
    });

    it("clicking a cell makes it the tab stop", async () => {
      const el = await gridFixture();
      cell(el, 2, 2).click();
      cell(el, 2, 2).focus();
      await settle(el);
      expect(cell(el, 2, 2).getAttribute("tabindex")).to.equal("0");
    });
  });

  describe("selection", () => {
    it("selects rows with checkboxes and fires selection-change with row keys", async () => {
      const el = await gridFixture({ selectable: true });
      expect(table(el).getAttribute("aria-multiselectable")).to.equal("true");
      const box = cell(el, 2, 0).querySelector("input")!;
      expect(box.getAttribute("aria-label")).to.equal("Select row Grace");
      setTimeout(() => box.click());
      const event = (await oneEvent(el, "selection-change")) as CustomEvent;
      expect(event.detail.selected).to.deep.equal(["2"]);
      await el.updateComplete;
      expect(dataRows(el)[1]!.getAttribute("aria-selected")).to.equal("true");
      expect(dataRows(el)[0]!.getAttribute("aria-selected")).to.equal("false");
      const all = cell(el, 0, 0).querySelector("input")!;
      expect(all.indeterminate).to.be.true;
      all.click();
      await el.updateComplete;
      expect(el.selected).to.have.members(["1", "2", "3", "4"]);
      expect(all.checked).to.be.true;
      all.click();
      await el.updateComplete;
      expect(el.selected).to.deep.equal([]);
    });
  });

  describe("grouping", () => {
    it("groups rows into a treegrid with group header rows, counts and aggregates", async () => {
      const el = await gridFixture({ groupBy: "dept" });
      expect(table(el).getAttribute("role")).to.equal("treegrid");
      const groups = groupRows(el);
      expect(groups).to.have.length(2);
      expect(dataRows(el)).to.have.length(0); // collapsed by default
      const [eng, ops] = groups;
      expect(eng!.getAttribute("aria-level")).to.equal("1");
      expect(eng!.getAttribute("aria-expanded")).to.equal("false");
      expect(eng!.getAttribute("aria-setsize")).to.equal("2");
      expect(eng!.getAttribute("aria-posinset")).to.equal("1");
      expect(ops!.getAttribute("aria-posinset")).to.equal("2");
      const toggle = eng!.querySelector("button")!;
      expect(toggle.getAttribute("aria-expanded")).to.equal("false");
      expect(text(toggle)).to.equal("Department: Engineering(3 rows)");
      expect(text(ops!.querySelector("button")!)).to.contain("(1 row)");
      expect(text(eng!.children[3]!)).to.equal("Sum: 310");
      expect(text(eng!.children[4]!)).to.equal("Average: 2.333");
      expect(text(ops!.children[3]!)).to.equal("Sum: 80");
    });

    it("supports min, max, count and function aggregates", async () => {
      const el = await gridFixture({ groupBy: ["dept"] });
      el.columns = [
        { key: "name", header: "Name", aggregate: "count" },
        { key: "salary", header: "Salary", aggregate: "min" },
        { key: "level", header: "Level", aggregate: "max" },
        { key: "city", header: "City", aggregate: (values) => new Set(values).size, format: (v) => `${v} cities` },
      ];
      el.groupBy = "dept";
      await el.updateComplete;
      // The group column isn't shown; the first column carries the toggle.
      const eng = groupRows(el)[0]!;
      expect(text(eng.children[0]!)).to.contain("Count: 3");
      expect(text(eng.children[1]!)).to.equal("Min: 90");
      expect(text(eng.children[2]!)).to.equal("Max: 3");
      expect(text(eng.children[3]!)).to.equal("2 cities");
    });

    it("expands and collapses with the button, firing group-toggle", async () => {
      const el = await gridFixture({ groupBy: "dept" });
      const toggle = groupRows(el)[0]!.querySelector("button")!;
      setTimeout(() => toggle.click());
      const event = (await oneEvent(el, "group-toggle")) as CustomEvent;
      expect(event.detail).to.deep.equal({ group: "eng", expanded: true, expandedGroups: ["eng"] });
      await el.updateComplete;
      expect(groupRows(el)[0]!.getAttribute("aria-expanded")).to.equal("true");
      const rows = dataRows(el);
      expect(rows).to.have.length(3);
      expect(rows.map((r) => r.getAttribute("aria-level"))).to.deep.equal(["2", "2", "2"]);
      expect(rows.map((r) => r.getAttribute("aria-posinset"))).to.deep.equal(["1", "2", "3"]);
      expect(rows[0]!.getAttribute("aria-setsize")).to.equal("3");
      toggle.click();
      await el.updateComplete;
      expect(dataRows(el)).to.have.length(0);
      expect(el.expandedGroups).to.deep.equal([]);
    });

    it("takes expanded-groups and nests several group-by keys", async () => {
      const el = await fixture<LitMaterialDataGrid<Person>>(html`<lit-material-data-grid
        row-key="id"
        group-by="dept,city"
        expanded-groups=${JSON.stringify(["eng", "eng/London"])}
      ></lit-material-data-grid>`);
      el.columns = columns().concat([]);
      el.rows = people();
      await el.updateComplete;
      const levels = bodyRows(el).map((row) => `${row.classList.contains("group") ? "g" : "r"}${row.getAttribute("aria-level")}`);
      // eng, eng/Austin (collapsed), eng/London (expanded: Ada, Alan), ops
      expect(levels).to.deep.equal(["g1", "g2", "g2", "r3", "r3", "g1"]);
      expect(names(el)).to.deep.equal(["Ada", "Alan"]);
      el.expandAll();
      await el.updateComplete;
      expect(dataRows(el)).to.have.length(4);
      el.collapseAll();
      await el.updateComplete;
      expect(bodyRows(el)).to.have.length(2);
    });

    it("ArrowRight expands and ArrowLeft collapses a group; ArrowLeft from a row goes to its group", async () => {
      const el = await gridFixture({ groupBy: "dept" });
      const toggle = () => groupRows(el)[0]!.querySelector("button")!;
      toggle().focus();
      await sendKeys({ press: "ArrowRight" });
      await settle(el);
      expect(el.expandedGroups).to.deep.equal(["eng"]);
      await sendKeys({ press: "ArrowDown" });
      await settle(el);
      expect(active(el)).to.equal(cell(el, 2, 0));
      await sendKeys({ press: "ArrowLeft" });
      await settle(el);
      expect(active(el)).to.equal(toggle());
      await sendKeys({ press: "ArrowLeft" });
      await settle(el);
      expect(el.expandedGroups).to.deep.equal([]);
      // Enter/Space on the button toggle it natively.
      await sendKeys({ press: "Enter" });
      await settle(el);
      expect(el.expandedGroups).to.deep.equal(["eng"]);
    });

    it("orders groups by the sort direction when sorting by the grouped column", async () => {
      const el = await gridFixture({ groupBy: "dept", sortKey: "dept", sortDirection: "descending" });
      expect(groupRows(el).map((row) => row.dataset.group)).to.deep.equal(["ops", "eng"]);
    });

    it("labels an empty group value", async () => {
      const el = await gridFixture({ groupBy: "dept" });
      el.rows = [...people(), { id: 5, name: "Nobody", dept: "", city: "", salary: 1 }];
      await el.updateComplete;
      expect(text(groupRows(el)[2]!.querySelector("button")!)).to.contain("(Empty)");
    });
  });

  describe("editing", () => {
    it("Enter opens a text editor, Enter commits: cell-edit, then rows update, then edit-commit", async () => {
      const el = await gridFixture();
      const order: string[] = [];
      el.addEventListener("cell-edit", (e) => {
        const { detail } = e as CustomEvent;
        order.push(`cell-edit ${detail.column} ${detail.oldValue}→${detail.value} ${el.rows[0]!.name}`);
      });
      el.addEventListener("edit-commit", (e) => order.push(`edit-commit ${(e as CustomEvent).detail.row.name}`));
      cell(el, 1, 0).focus();
      await sendKeys({ press: "Enter" });
      await settle(el);
      const field = cell(el, 1, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!;
      expect(field).to.exist;
      expect(field.value).to.equal("Ada");
      expect(field.label).to.equal("Name");
      expect(cell(el, 1, 0).hasAttribute("editing")).to.be.true;
      await sendKeys({ press: "Control+a" });
      await sendKeys({ type: "Ada L." });
      await sendKeys({ press: "Enter" });
      await settle(el);
      expect(order).to.deep.equal(["cell-edit name Ada→Ada L. Ada", "edit-commit Ada L."]);
      expect(el.rows[0]).to.deep.include({ id: 1, name: "Ada L." });
      expect(cell(el, 1, 0).querySelector("lit-material-text-field")).to.be.null;
      expect(text(cell(el, 1, 0))).to.equal("Ada L.");
      expect(active(el)).to.equal(cell(el, 1, 0));
    });

    it("F2 and double-click open the editor; Escape cancels", async () => {
      const el = await gridFixture();
      let fired = false;
      el.addEventListener("cell-edit", () => (fired = true));
      cell(el, 2, 0).focus();
      await sendKeys({ press: "F2" });
      await settle(el);
      const field = cell(el, 2, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!;
      field.value = "Changed";
      await sendKeys({ press: "Escape" });
      await settle(el);
      expect(cell(el, 2, 0).querySelector("lit-material-text-field")).to.be.null;
      expect(el.rows[1]!.name).to.equal("Grace");
      expect(fired).to.be.false;
      expect(active(el)).to.equal(cell(el, 2, 0));

      cell(el, 3, 0).dispatchEvent(new MouseEvent("dblclick", { bubbles: true, composed: true }));
      await settle(el);
      expect(cell(el, 3, 0).querySelector("lit-material-text-field")).to.exist;
    });

    it("does not open an editor on a read-only column", async () => {
      const el = await gridFixture();
      cell(el, 1, 2).focus();
      await sendKeys({ press: "Enter" });
      await settle(el);
      expect(cell(el, 1, 2).querySelector(".editor")).to.be.null;
    });

    it("preventDefault() on cell-edit keeps the editor open with detail.error", async () => {
      const el = await gridFixture();
      el.addEventListener("cell-edit", (e) => {
        const event = e as CustomEvent;
        if (!String(event.detail.value).trim()) {
          event.detail.error = "Name is required";
          event.preventDefault();
        }
      });
      let committed = false;
      el.addEventListener("edit-commit", () => (committed = true));
      await el.startEdit("1", "name");
      const field = cell(el, 1, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!;
      field.value = "";
      await sendKeys({ press: "Enter" });
      await settle(el);
      expect(committed).to.be.false;
      expect(el.rows[0]!.name).to.equal("Ada");
      const still = cell(el, 1, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!;
      expect(still).to.equal(field);
      expect(still.error).to.be.true;
      expect(still.errorText).to.equal("Name is required");
      expect(text(shadow(el).querySelector("[role=status]")!)).to.equal("Name is required");
      // Fix it and commit.
      field.value = "Augusta";
      await sendKeys({ press: "Enter" });
      await settle(el);
      expect(committed).to.be.true;
      expect(el.rows[0]!.name).to.equal("Augusta");
    });

    it("a prevented cell-edit without an error shows a generic message", async () => {
      const el = await gridFixture();
      el.addEventListener("cell-edit", (e) => e.preventDefault());
      await el.startEdit("1", "name");
      cell(el, 1, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!.value = "X";
      expect(el.commitEdit()).to.be.false;
      await el.updateComplete;
      expect(cell(el, 1, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!.errorText).to.equal("Invalid value");
    });

    it("a listener may normalise detail.value", async () => {
      const el = await gridFixture();
      el.addEventListener("cell-edit", (e) => {
        const detail = (e as CustomEvent).detail;
        detail.value = String(detail.value).trim();
      });
      await el.startEdit("1", "name");
      cell(el, 1, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!.value = "  Ada  ";
      el.commitEdit();
      expect(el.rows[0]!.name).to.equal("Ada");
    });

    it("Tab commits and moves to the next editable cell; Shift+Tab to the previous", async () => {
      const el = await gridFixture();
      await el.startEdit("1", "name");
      cell(el, 1, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!.value = "Ada B.";
      await sendKeys({ press: "Tab" });
      await settle(el);
      await settle(el);
      expect(el.rows[0]!.name).to.equal("Ada B.");
      // Department (select) is next.
      expect(cell(el, 1, 1).querySelector("lit-material-select")).to.exist;
      await sendKeys({ press: "Tab" });
      await settle(el);
      await settle(el);
      // City is read-only: skipped to Salary.
      expect(cell(el, 1, 3).querySelector("lit-material-number-field")).to.exist;
      await sendKeys({ press: "Shift+Tab" });
      await settle(el);
      await settle(el);
      expect(cell(el, 1, 1).querySelector("lit-material-select")).to.exist;
    });

    it("the number editor rejects text that isn't a number, and commits numbers", async () => {
      const el = await gridFixture();
      let fired = 0;
      el.addEventListener("cell-edit", () => fired++);
      await el.startEdit("1", "salary");
      const field = cell(el, 1, 3).querySelector<LitMaterialNumberField>("lit-material-number-field")!;
      expect(field.value).to.equal(100);
      await sendKeys({ press: "Control+a" });
      await sendKeys({ type: "abc" });
      await sendKeys({ press: "Enter" });
      await settle(el);
      expect(fired).to.equal(0);
      expect(cell(el, 1, 3).querySelector("lit-material-number-field")).to.equal(field);
      expect(field.validationMessage).to.equal("Enter a number");
      await sendKeys({ press: "Control+a" });
      await sendKeys({ type: "150" });
      await sendKeys({ press: "Enter" });
      await settle(el);
      expect(fired).to.equal(1);
      expect(el.rows[0]!.salary).to.equal(150);
    });

    it("the select editor commits the option's value with its original type", async () => {
      const el = await gridFixture();
      const commits: unknown[] = [];
      el.addEventListener("edit-commit", (e) => commits.push((e as CustomEvent).detail.value));
      await el.startEdit("2", "level");
      const select = cell(el, 2, 4).querySelector<LitMaterialSelect>("lit-material-select")!;
      expect(select.value).to.equal("1");
      select.value = "3";
      expect(el.commitEdit()).to.be.true;
      expect(el.rows[1]!.level).to.equal(3);
      await el.startEdit("2", "dept");
      const dept = cell(el, 2, 1).querySelector<LitMaterialSelect>("lit-material-select")!;
      dept.value = "eng";
      el.commitEdit();
      expect(commits).to.deep.equal([3, "eng"]);
      await el.updateComplete;
      expect(text(cell(el, 2, 1))).to.equal("Engineering");
    });

    it("with the select's listbox open, Enter picks an option and Escape closes only the listbox", async () => {
      const el = await gridFixture();
      await el.startEdit("2", "dept");
      const select = cell(el, 2, 1).querySelector<LitMaterialSelect>("lit-material-select")!;
      await sendKeys({ press: "ArrowDown" }); // opens the listbox on "Operations"
      await select.updateComplete;
      await settle(el);
      expect(select.open).to.be.true;
      await sendKeys({ press: "Escape" });
      await settle(el);
      expect(select.open).to.be.false;
      expect(cell(el, 2, 1).querySelector("lit-material-select")).to.equal(select); // still editing
      await sendKeys({ press: "ArrowDown" });
      await settle(el);
      await sendKeys({ press: "ArrowUp" }); // Engineering
      await sendKeys({ press: "Enter" }); // picks it, editor stays open
      await settle(el);
      expect(select.value).to.equal("eng");
      expect(el.rows[1]!.dept).to.equal("ops");
      await sendKeys({ press: "Enter" }); // commits
      await settle(el);
      expect(el.rows[1]!.dept).to.equal("eng");
      expect(cell(el, 2, 1).querySelector("lit-material-select")).to.be.null;
    });

    it("an unchanged value closes the editor without events", async () => {
      const el = await gridFixture();
      let fired = false;
      el.addEventListener("cell-edit", () => (fired = true));
      await el.startEdit("1", "name");
      expect(el.commitEdit()).to.be.true;
      expect(fired).to.be.false;
    });

    it("commits when focus leaves the editor", async () => {
      const el = await gridFixture();
      await el.startEdit("1", "name");
      cell(el, 1, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!.value = "Blurred";
      cell(el, 2, 2).focus();
      await settle(el);
      expect(el.rows[0]!.name).to.equal("Blurred");
      expect(cell(el, 1, 0).querySelector(".editor")).to.be.null;
    });

    it("keeps focus on the edited row when sorting moves it", async () => {
      const el = await gridFixture({ sortKey: "name" });
      // Ada is first; renaming to Zed sorts it last.
      await el.startEdit("1", "name");
      cell(el, 1, 0).querySelector<LitMaterialTextField>("lit-material-text-field")!.value = "Zed";
      await sendKeys({ press: "Enter" });
      await settle(el);
      expect(names(el)).to.deep.equal(["Alan", "Edsger", "Grace", "Zed"]);
      expect(active(el)).to.equal(cell(el, 4, 0));
    });
  });

  describe("pagination", () => {
    it("renders the pagination footer and pages the rows", async () => {
      const el = await gridFixture({ pageSize: 2, pageSizeOptions: [2, 4] });
      expect(names(el)).to.deep.equal(["Ada", "Grace"]);
      expect(table(el).getAttribute("aria-rowcount")).to.equal("5");
      expect(dataRows(el)[0]!.getAttribute("aria-rowindex")).to.equal("2");
      const pager = shadow(el).querySelector("lit-material-data-table-pagination")!;
      expect(pager.total).to.equal(4);
      const next = pager.shadowRoot!.querySelector<HTMLButtonElement>("button[aria-label='Next page']")!;
      setTimeout(() => next.click());
      const event = (await oneEvent(el, "page-change")) as CustomEvent;
      expect(event.detail).to.deep.equal({ page: 1, pageSize: 2 });
      await el.updateComplete;
      expect(el.page).to.equal(1);
      expect(names(el)).to.deep.equal(["Alan", "Edsger"]);
      expect(dataRows(el)[0]!.getAttribute("aria-rowindex")).to.equal("4");
    });
  });

  describe("CSV", () => {
    it("exports every row in display order with a header record, CRLF line breaks", async () => {
      const el = await gridFixture({ sortKey: "name" });
      el.columns = [
        { key: "name", header: "Name" },
        { key: "salary", header: "Salary", format: (v) => `$${v}` },
      ];
      await el.updateComplete;
      expect(el.toCSV()).to.equal("Name,Salary\r\nAda,$100\r\nAlan,$120\r\nEdsger,$90\r\nGrace,$80");
      expect(el.toCSV({ raw: true, header: false, columns: ["salary"] })).to.equal("100\r\n120\r\n90\r\n80");
    });

    it("quotes delimiters, quotes and line breaks, and neutralises formulas", async () => {
      const el = await gridFixture();
      el.columns = [
        { key: "a", header: "A, with comma" },
        { key: "b", header: "B" },
      ];
      el.rows = [
        { a: 'say "hi"', b: "line\nbreak" },
        { a: "=HYPERLINK(\"x\")", b: "+1+cmd" },
        { a: "-2+3", b: "@SUM(A1)" },
        { a: -5, b: "-1.5" },
        { a: "+1", b: "1e-3" },
        { a: null, b: "\tTab" },
      ] as never;
      await el.updateComplete;
      expect(el.toCSV()).to.equal(
        [
          '"A, with comma",B',
          '"say ""hi""","line\nbreak"',
          `"'=HYPERLINK(""x"")",'+1+cmd`,
          "'-2+3,'@SUM(A1)",
          "-5,-1.5",
          "+1,1e-3",
          ",'\tTab",
        ].join("\r\n"),
      );
      expect(el.toCSV({ escapeFormulas: false, rows: "all" }).split("\r\n")[3]).to.equal("-2+3,@SUM(A1)");
    });

    it("supports a delimiter, a byte order mark, selected and visible rows, and leaves group rows out", async () => {
      const el = await gridFixture({ selectable: true, selected: ["3", "2"], groupBy: "dept", expandedGroups: ["ops"] });
      el.columns = [
        { key: "name", header: "Name" },
        { key: "dept", header: "Dept" },
      ];
      await el.updateComplete;
      // all: grouped order (eng then ops), no group rows.
      expect(el.toCSV({ delimiter: ";" })).to.equal("Name;Dept\r\nAda;eng\r\nAlan;eng\r\nEdsger;eng\r\nGrace;ops");
      expect(el.toCSV({ rows: "visible" })).to.equal("Name,Dept\r\nGrace,ops");
      expect(el.toCSV({ rows: "selected", header: false })).to.equal("Alan,eng\r\nGrace,ops");
      expect(el.toCSV({ bom: true }).startsWith("﻿Name,Dept")).to.be.true;
    });

    it("downloadCSV() saves a file with a byte order mark", async () => {
      const el = await gridFixture();
      el.columns = [{ key: "name", header: "Name" }];
      await el.updateComplete;
      const original = HTMLAnchorElement.prototype.click;
      let saved: { download: string; href: string } | undefined;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        saved = { download: this.download, href: this.href };
      };
      try {
        el.downloadCSV("people.csv");
      } finally {
        HTMLAnchorElement.prototype.click = original;
      }
      expect(saved!.download).to.equal("people.csv");
      const body = await (await fetch(saved!.href)).arrayBuffer();
      const bytes = new Uint8Array(body);
      expect([...bytes.slice(0, 3)]).to.deep.equal([0xef, 0xbb, 0xbf]);
      expect(new TextDecoder().decode(bytes)).to.equal("Name\r\nAda\r\nGrace\r\nAlan\r\nEdsger");
    });
  });

  describe("i18n", () => {
    after(() => registerTranslation({ $code: "xx-grid" }));

    it("translates its texts and formats numbers for the element's language", async () => {
      registerTranslation({
        $code: "xx-grid",
        "dataTable.groupCount": { one: "{count} ligne", other: "{count} lignes" },
        "dataTable.aggregateSum": "Somme : {value}",
        "dataTable.selectAll": "Tout sélectionner",
        "dataTable.noRows": "Aucune ligne",
      });
      const el = await gridFixture({ groupBy: "dept", selectable: true });
      el.setAttribute("lang", "xx-grid");
      el.rows = [...people(), { id: 9, name: "Big", dept: "ops", city: "", salary: 1000000 }];
      await settle(el);
      const ops = groupRows(el)[1]!;
      expect(text(ops.querySelector(".count")!)).to.equal("(2 lignes)");
      expect(text(groupRows(el)[0]!.querySelector(".count")!)).to.equal("(3 lignes)");
      expect(text(ops.children[4]!)).to.equal("Somme : 1,000,080");
      expect(cell(el, 0, 0).querySelector("input")!.getAttribute("aria-label")).to.equal("Tout sélectionner");
      el.rows = [];
      await el.updateComplete;
      expect(text(bodyRows(el)[0]!)).to.equal("Aucune ligne");
    });

    it("formats numbers in German", async () => {
      const el = await gridFixture();
      el.setAttribute("lang", "de");
      el.rows = [{ id: 1, name: "A", dept: "eng", city: "", salary: 1234.5 }];
      await settle(el);
      expect(text(cell(el, 1, 3))).to.equal("1.234,5");
    });
  });
});
