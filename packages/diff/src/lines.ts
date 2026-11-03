/**
 * Line diffs without a DOM: usable in Node, workers and tests.
 *
 * `diffLines` trims the common head and tail, then runs an LCS over what's
 * left. Above `limit` cells (default 4 million, about 16 MB) it gives up on
 * the middle and reports it as removed then added, so a huge body can't
 * stall the page.
 */

export type LineOp = "same" | "removed" | "added";

export interface DiffLine {
  op: LineOp;
  text: string;
  /** 1-based line number in the before text (same, removed). */
  before?: number;
  /** 1-based line number in the after text (same, added). */
  after?: number;
}

export interface SplitRow {
  op: "same" | "changed" | "removed" | "added";
  left?: DiffLine;
  right?: DiffLine;
}

export interface Hunk {
  /** Index of the hunk's first line in the lines it was made from. */
  start: number;
  /** Lines in the hunk, context included. */
  lines: DiffLine[];
  beforeStart: number;
  beforeCount: number;
  afterStart: number;
  afterCount: number;
}

const split = (text: string): string[] => (text === "" ? [] : text.split(/\r?\n/));

export function diffLines(before: string, after: string, limit = 4_000_000): DiffLine[] {
  const x = split(before);
  const y = split(after);
  let start = 0;
  while (start < x.length && start < y.length && x[start] === y[start]) start++;
  let endX = x.length;
  let endY = y.length;
  while (endX > start && endY > start && x[endX - 1] === y[endY - 1]) {
    endX--;
    endY--;
  }
  const ops: LineOp[] = [];
  for (let k = 0; k < start; k++) ops.push("same");
  const mx = x.slice(start, endX);
  const my = y.slice(start, endY);
  const n = mx.length;
  const m = my.length;
  if (n * m > limit) {
    for (let k = 0; k < n; k++) ops.push("removed");
    for (let k = 0; k < m; k++) ops.push("added");
  } else {
    const width = m + 1;
    const table = new Uint32Array((n + 1) * width);
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        table[i * width + j] = mx[i] === my[j] ? table[(i + 1) * width + j + 1]! + 1 : Math.max(table[(i + 1) * width + j]!, table[i * width + j + 1]!);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (mx[i] === my[j]) {
        ops.push("same");
        i++;
        j++;
      } else if (table[(i + 1) * width + j]! >= table[i * width + j + 1]!) {
        ops.push("removed");
        i++;
      } else {
        ops.push("added");
        j++;
      }
    }
    while (i++ < n) ops.push("removed");
    while (j++ < m) ops.push("added");
  }
  for (let k = endX; k < x.length; k++) ops.push("same");

  // Attach text and line numbers.
  const out: DiffLine[] = [];
  let b = 0;
  let a = 0;
  for (const op of ops) {
    if (op === "same") out.push({ op, text: x[b]!, before: ++b, after: ++a });
    else if (op === "removed") out.push({ op, text: x[b]!, before: ++b });
    else out.push({ op, text: y[a]!, after: ++a });
  }
  return out;
}

/** Rows for a side-by-side view: each run of removed lines pairs with the added run after it. */
export function sideBySide(lines: DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  for (let k = 0; k < lines.length; k++) {
    const line = lines[k]!;
    if (line.op === "same") {
      rows.push({ op: "same", left: line, right: line });
    } else if (line.op === "removed") {
      let run = k;
      while (run < lines.length && lines[run]!.op === "removed") run++;
      let add = run;
      while (add < lines.length && lines[add]!.op === "added") add++;
      const removed = lines.slice(k, run);
      const added = lines.slice(run, add);
      for (let i = 0; i < Math.max(removed.length, added.length); i++) {
        const left = removed[i];
        const right = added[i];
        rows.push({ op: left && right ? "changed" : left ? "removed" : "added", left, right });
      }
      k = add - 1;
    } else {
      rows.push({ op: "added", right: line });
    }
  }
  return rows;
}

/** Groups changes into hunks with `context` unchanged lines around each; no hunks when nothing changed. */
export function hunks(lines: DiffLine[], context = 3): Hunk[] {
  const changed = lines.map((l, i) => (l.op === "same" ? -1 : i)).filter((i) => i >= 0);
  const out: Hunk[] = [];
  let k = 0;
  while (k < changed.length) {
    const from = Math.max(0, changed[k]! - context);
    let to = Math.min(lines.length - 1, changed[k]! + context);
    while (k + 1 < changed.length && changed[k + 1]! - context <= to + 1) {
      k++;
      to = Math.min(lines.length - 1, changed[k]! + context);
    }
    const slice = lines.slice(from, to + 1);
    const firstBefore = slice.find((l) => l.before !== undefined)?.before ?? 0;
    const firstAfter = slice.find((l) => l.after !== undefined)?.after ?? 0;
    out.push({
      start: from,
      lines: slice,
      beforeStart: firstBefore,
      beforeCount: slice.filter((l) => l.op !== "added").length,
      afterStart: firstAfter,
      afterCount: slice.filter((l) => l.op !== "removed").length,
    });
    k++;
  }
  return out;
}

/** Counts of added and removed lines. */
export function stats(lines: DiffLine[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const l of lines) {
    if (l.op === "added") added++;
    else if (l.op === "removed") removed++;
  }
  return { added, removed };
}
