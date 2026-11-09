/** Where a query matched: a score (higher is better) and the matched character positions. */
export interface FuzzyMatch {
  score: number;
  at: number[];
}

const BOUNDARY = /[\s/._:\-?&=>›()[\]]/;

/**
 * How well `query` matches `text` as a subsequence, ignoring case and spaces in the query: `null` when
 * it doesn't match. Characters that follow each other, and characters at the start of a word, score
 * more; a match that starts late scores a little less. Every start of the first character is tried.
 */
export function fuzzyMatch(query: string, text: string): FuzzyMatch | null {
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (!q) return { score: 0, at: [] };
  const lower = text.toLowerCase();
  let best: FuzzyMatch | null = null;
  for (let start = lower.indexOf(q[0]!); start !== -1; start = lower.indexOf(q[0]!, start + 1)) {
    const at = [start];
    let i = start;
    for (let k = 1; k < q.length; k++) {
      i = lower.indexOf(q[k]!, i + 1);
      if (i === -1) break;
      at.push(i);
    }
    if (at.length < q.length) break; // a later start can't match either
    let score = 0;
    for (let k = 0; k < at.length; k++) {
      const p = at[k]!;
      score += 1;
      if (p === 0 || BOUNDARY.test(text[p - 1]!)) score += 3;
      if (k > 0 && p === at[k - 1]! + 1) score += 4;
    }
    score -= start * 0.05;
    if (!best || score > best.score) best = { score, at };
  }
  return best;
}
