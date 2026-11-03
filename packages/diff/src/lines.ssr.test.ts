import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diffLines, hunks, sideBySide, stats } from "./lines.js";

const ops = (a: string, b: string) => diffLines(a, b).map((l) => `${l.op[0]}${l.text}`);

describe("diffLines", () => {
  it("finds nothing in equal texts", () => {
    assert.deepEqual(stats(diffLines("a\nb", "a\nb")), { added: 0, removed: 0 });
    assert.deepEqual(diffLines("", ""), []);
  });

  it("marks added, removed and kept lines with their numbers", () => {
    assert.deepEqual(ops("a\nb\nc", "a\nx\nc\nd"), ["sa", "rb", "ax", "sc", "ad"]);
    const lines = diffLines("a\nb\nc", "a\nx\nc\nd");
    assert.deepEqual(lines[3], { op: "same", text: "c", before: 3, after: 3 });
    assert.deepEqual(lines[4], { op: "added", text: "d", after: 4 });
  });

  it("treats CRLF like LF", () => {
    assert.deepEqual(ops("a\r\nb", "a\nb"), ["sa", "sb"]);
  });

  it("falls back to removed then added above the limit", () => {
    assert.deepEqual(diffLines("a\nb\nc", "x\nb\ny", 1).map((l) => l.op), ["removed", "removed", "removed", "added", "added", "added"]);
  });
});

describe("sideBySide", () => {
  it("pairs a removed run with the added run after it", () => {
    const rows = sideBySide(diffLines("a\nb\nc\nz", "a\nx\nz"));
    assert.deepEqual(rows.map((r) => r.op), ["same", "changed", "removed", "same"]);
    assert.equal(rows[1]!.left!.text, "b");
    assert.equal(rows[1]!.right!.text, "x");
  });
});

describe("hunks", () => {
  it("keeps context around changes and merges close ones", () => {
    const before = Array.from({ length: 20 }, (_, i) => `l${i + 1}`).join("\n");
    const after = before.replace("l3", "L3").replace("l5", "L5").replace("l18", "L18");
    const h = hunks(diffLines(before, after), 1);
    assert.equal(h.length, 2);
    assert.equal(h[0]!.start, 1);
    assert.deepEqual(h[0]!.lines.map((l) => l.text), ["l2", "l3", "L3", "l4", "l5", "L5", "l6"]);
    assert.equal(h[0]!.beforeStart, 2);
    assert.equal(h[0]!.beforeCount, 5);
    assert.equal(h[0]!.afterCount, 5);
  });
});
