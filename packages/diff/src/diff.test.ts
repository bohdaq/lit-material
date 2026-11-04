import { expect, fixture, html } from "@open-wc/testing";
import { registerTranslation } from "@lit-material/core/localize.js";
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

describe("diff localization", () => {
  registerTranslation({
    $code: "x-diff",
    "diff.noDifferences": "Keine Unterschiede.",
    "diff.changes": "Änderungen",
    "diff.before": "Vorher",
    "diff.after": "Nachher",
    "diff.sideLine": "Zeile {side}",
    "diff.line": "Zeile",
    "diff.unchangedLines": { one: "{count} unveränderte Zeile", other: "{count} unveränderte Zeilen" },
    "diff.addedLine": "Neu:",
    "diff.removedLine": "Entfernt:",
    "diff.addedCount": { one: "{count} hinzugefügt", other: "{count} hinzugefügt" },
    "diff.kindChanged": "geändert",
    "diff.changedTo": "zu",
    "diff.base": "Basis",
    "diff.sameAs": "Wie {side}",
    "diff.newAndDropped": "{added} neu, {dropped} entfernt",
    "diff.sideText": "{side}, Text",
  });

  const inLang = async <T extends HTMLElement>(template: unknown, tag: string) => {
    const wrapper = await fixture<HTMLDivElement>(html`<div lang="x-diff">${template}</div>`);
    const el = wrapper.querySelector<T & { updateComplete: Promise<boolean> }>(tag)!;
    await el.updateComplete;
    return el;
  };

  it("translates the diff's built-in text", async () => {
    const empty = await inLang(html`<lit-material-diff original="a" modified="a"></lit-material-diff>`, "lit-material-diff");
    expect(empty.shadowRoot!.textContent).to.contain("Keine Unterschiede.");

    const el = await inLang<LitMaterialDiff>(html`<lit-material-diff .original=${before} .modified=${after} context="2"></lit-material-diff>`, "lit-material-diff");
    const root = el.shadowRoot!;
    expect(root.querySelector(".region")!.getAttribute("aria-label")).to.equal("Änderungen");
    expect(root.querySelector("thead")!.textContent).to.contain("Zeile Vorher").and.contain("Zeile Nachher");
    expect(rows(el).find((r) => r.classList.contains("fold"))!.textContent!.trim()).to.equal("2 unveränderte Zeilen");
    expect(root.querySelector("tr.added td.text")!.textContent).to.match(/^Neu: /);
    expect(root.querySelector(".stats")!.textContent).to.contain("2 hinzugefügt");

    el.mode = "split";
    await el.updateComplete;
    expect([...root.querySelectorAll("thead th")].map((th) => th.textContent)).to.deep.equal(["Vorher", "Nachher"]);
  });

  it("translates the change list's built-in text", async () => {
    const el = await inLang<LitMaterialChangeList>(
      html`<lit-material-change-list .changes=${[{ path: "$.id", kind: "changed", before: 1, after: 2 }]}></lit-material-change-list>`,
      "lit-material-change-list",
    );
    const root = el.shadowRoot!;
    expect(root.querySelector("ul")!.getAttribute("aria-label")).to.equal("Änderungen");
    expect(root.querySelector(".kind")!.textContent).to.equal("geändert");
    expect(root.querySelector("li .visually-hidden")!.textContent).to.equal("zu");
  });

  it("translates the merge view's notes", async () => {
    const el = await inLang<LitMaterialMergeView>(
      html`<lit-material-merge-view
        base="2"
        .sides=${[
          { label: "Mine", text: "a\nB\nc" },
          { label: "Theirs", text: "a\nb\nc" },
          { label: "Original", text: "a\nb\nc" },
        ]}
      ></lit-material-merge-view>`,
      "lit-material-merge-view",
    );
    const sides = [...el.shadowRoot!.querySelectorAll("section")];
    expect(sides.map((s) => s.querySelector(".note")!.textContent)).to.deep.equal(["1 neu, 1 entfernt", "Wie Original", "Basis"]);
    expect(sides[0]!.querySelector(".region")!.getAttribute("aria-label")).to.equal("Mine, Text");
  });

  it("keeps explicit labels", async () => {
    const el = await inLang<LitMaterialDiff>(
      html`<lit-material-diff original="a" modified="b" label="Edits" original-label="Old" modified-label="New" mode="split"></lit-material-diff>`,
      "lit-material-diff",
    );
    expect(el.shadowRoot!.querySelector(".region")!.getAttribute("aria-label")).to.equal("Edits");
    expect([...el.shadowRoot!.querySelectorAll("thead th")].map((th) => th.textContent)).to.deep.equal(["Old", "New"]);
  });
});
