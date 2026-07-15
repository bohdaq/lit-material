import { expect, fixture, html } from "@open-wc/testing";
import "./data-table.js";
import "./data-table-row.js";
import "./data-table-cell.js";
import type { LitMaterialDataTable } from "./data-table.js";

interface Person {
  id: number;
  name: string;
}

function makeItems(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({ id: i, name: `Person ${i}` }));
}

async function virtualizedFixture(itemCount = 1000) {
  const el = await fixture<LitMaterialDataTable>(html`
    <lit-material-data-table row-height="40" viewport-height="200">
      <lit-material-data-table-row header flex>
        <lit-material-data-table-cell header flex width="200px">Name</lit-material-data-table-cell>
      </lit-material-data-table-row>
    </lit-material-data-table>
  `);
  el.items = makeItems(itemCount);
  el.rowRenderer = (item, index) => {
    const person = item as Person;
    return html`<lit-material-data-table-row flex data-row-id=${person.id}
      ><lit-material-data-table-cell flex width="200px">${person.name} (#${index})</lit-material-data-table-cell
      ></lit-material-data-table-row>`;
  };
  await el.updateComplete;
  return el;
}

describe("lit-material-data-table virtualization", () => {
  it("does not virtualize when items/rowRenderer are unset (default, backward-compatible mode)", async () => {
    const el = await fixture<LitMaterialDataTable>(html`
      <lit-material-data-table>
        <lit-material-data-table-row header><lit-material-data-table-cell header>Name</lit-material-data-table-cell></lit-material-data-table-row>
      </lit-material-data-table>
    `);
    expect(el.shadowRoot!.querySelector(".viewport")).to.not.exist;
  });

  it("only renders a small window of rows out of a large item count", async () => {
    const el = await virtualizedFixture(1000);
    const rendered = el.shadowRoot!.querySelectorAll("lit-material-data-table-row:not([header])");
    // viewport-height=200 / row-height=40 = 5 visible + 2*4 overscan = 13, never anywhere near 1000.
    expect(rendered.length).to.be.greaterThan(0);
    expect(rendered.length).to.be.lessThan(20);
  });

  it("sets the spacer height to items.length * rowHeight so the scrollbar reflects the full dataset", async () => {
    const el = await virtualizedFixture(1000);
    const spacer = el.shadowRoot!.querySelector(".spacer") as HTMLElement;
    expect(spacer.style.height).to.equal("40000px");
  });

  it("renders a different window of rows after scrolling", async () => {
    const el = await virtualizedFixture(1000);
    const viewport = el.shadowRoot!.querySelector(".viewport") as HTMLElement;
    const firstWindowText = viewport.textContent;

    viewport.scrollTop = 20000; // deep into the dataset
    viewport.dispatchEvent(new Event("scroll"));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await el.updateComplete;

    expect(viewport.textContent).to.not.equal(firstWindowText);
    expect(viewport.textContent).to.include("Person 500");
  });

  it("keeps row selection/sort delegation working for virtualized rows", async () => {
    const el = await virtualizedFixture(5);
    let detail: { selected?: string[] } | undefined;
    el.addEventListener("selection-change", (event) => {
      detail = (event as CustomEvent).detail;
    });
    const checkbox = document.createElement("input");
    // Exercise the delegation path directly: virtualized rows are real
    // lit-material-data-table-row elements in the table's own shadow root,
    // so a row-select checkbox placed in one behaves identically to the
    // slotted (non-virtualized) case.
    const firstRow = el.shadowRoot!.querySelector("lit-material-data-table-row[data-row-id='0']")!;
    checkbox.setAttribute("data-row-select", "");
    firstRow.querySelector("lit-material-data-table-cell")!.appendChild(checkbox);
    await el.updateComplete;

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true, composed: true }));

    expect(detail).to.deep.equal({ selected: ["0"] });
  });
});
