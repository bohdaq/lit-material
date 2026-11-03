import { expect, fixture, html } from "@open-wc/testing";
import "./index.js";
import type { LitMaterialChangeList, LitMaterialDiff, LitMaterialMergeView } from "./index.js";

const before = Array.from({ length: 30 }, (_, i) => `line ${i + 1}`).join("\n");
const after = before.replace("line 5\n", "line five\n").replace("line 25", "line 25\nline 25b");
const rows = (el: HTMLElement) => [...el.shadowRoot!.querySelectorAll("tbody tr")] as HTMLTableRowElement[];

describe("lit-material-diff", () => {
  it("says so when nothing changed", async () => {
    const el = await fixture<LitMaterialDiff>(html`<lit-material-diff original="a" modified="a"></lit-material-diff>`);
    expect(el.shadowRoot!.textContent).to.contain("No differences.");
  });

  it("folds unchanged lines down to the context around each change", async () => {
    const el = await fixture<LitMaterialDiff>(html`<lit-material-diff .original=${before} .modified=${after} context="2"></lit-material-diff>`);
    const folds = rows(el).filter((r) => r.classList.contains("fold")).map((r) => r.textContent!.trim());
    expect(folds).to.deep.equal(["2 unchanged lines", "16 unchanged lines", "3 unchanged lines"]);
    expect(rows(el).filter((r) => r.classList.contains("added")).length).to.equal(2);
    expect(el.shadowRoot!.querySelector(".stats")!.textContent).to.contain("+2").and.contain("−1");
  });

  it("shows every line with context -1", async () => {
    const el = await fixture<LitMaterialDiff>(html`<lit-material-diff .original=${before} .modified=${after} context="-1"></lit-material-diff>`);
    expect(rows(el).some((r) => r.classList.contains("fold"))).to.be.false;
    expect(rows(el).length).to.equal(32);
  });

  it("pairs a changed line across the two sides in split mode", async () => {
    const el = await fixture<LitMaterialDiff>(html`<lit-material-diff mode="split" original="a\nb\nc" modified="a\nx\nc"></lit-material-diff>`);
    const changed = rows(el).find((r) => r.classList.contains("changed"))!;
    const text = [...changed.querySelectorAll("td.text")].map((t) => t.textContent);
    expect(text).to.deep.equal(["Removed: b", "Added: x"]);
  });

  it("is accessible", async () => {
    const el = await fixture<LitMaterialDiff>(html`<lit-material-diff original="a\nb" modified="a\nc" label="Changes to notes.txt"></lit-material-diff>`);
    await expect(el).to.be.accessible();
    el.mode = "split";
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});

describe("lit-material-change-list", () => {
  it("lists changes with old and new values", async () => {
    const el = await fixture<LitMaterialChangeList>(html`<lit-material-change-list
      .changes=${[
        { path: "$.id", kind: "changed", before: 1, after: 2 },
        { path: "$.tags", kind: "added", after: ["a"] },
        { path: "$.old", kind: "removed", before: "x" },
      ]}
    ></lit-material-change-list>`);
    const items = [...el.shadowRoot!.querySelectorAll("li")];
    expect(items.map((i) => i.className)).to.deep.equal(["changed", "added", "removed"]);
    expect(items[1]!.querySelector("ins")!.textContent).to.equal('["a"]');
    await expect(el).to.be.accessible();
  });
});

describe("lit-material-merge-view", () => {
  it("marks what each side changed against the base, and slots actions", async () => {
    const el = await fixture<LitMaterialMergeView>(html`<lit-material-merge-view
      base="2"
      .sides=${[
        { label: "Mine", text: "a\nB\nc" },
        { label: "Theirs", text: "a\nb\nc" },
        { label: "Before both changes", text: "a\nb\nc" },
      ]}
      ><button slot="side-0">Keep mine</button></lit-material-merge-view
    >`);
    const sides = [...el.shadowRoot!.querySelectorAll("section")];
    expect(sides.map((s) => s.querySelector(".note")!.textContent)).to.deep.equal(["1 new or changed, 1 dropped", "Same as Before both changes", "Base"]);
    expect(sides[0]!.querySelectorAll("li.added").length).to.equal(1);
    const slot = sides[0]!.querySelector("slot")!;
    expect(slot.assignedElements()[0]!.textContent).to.equal("Keep mine");
    await expect(el).to.be.accessible();
  });
});
