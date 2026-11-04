import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { diffLines, hunks, sideBySide, stats, type DiffLine, type Hunk } from "./lines.js";
import { diffColors } from "./styles.js";
import { LocalizeController } from "@lit-material/core/localize.js";

export type DiffMode = "unified" | "split";

/**
 * Shows how one text changed into another, line by line: one column with
 * `+` and `-` lines (`unified`), or the two texts side by side (`split`).
 *
 * `original` and `modified` are plain string attributes, so the diff renders on
 * the server too. Unchanged runs fold down to `context` lines around each
 * change; `context="-1"` shows everything. A screen reader hears each line
 * as "added", "removed" or nothing, and the line numbers on both sides.
 *
 * The diff is computed without a DOM; `diffLines`, `sideBySide`, `hunks`
 * and `stats` are exported from `@lit-material/diff/lines.js` too.
 *
 * @element lit-material-diff
 *
 * @csspart table - The table of lines.
 * @csspart stats - The added and removed counts.
 *
 * @cssprop --lit-material-diff-added-background - Background of added lines.
 * @cssprop --lit-material-diff-added-color - Text colour of added lines.
 * @cssprop --lit-material-diff-removed-background - Background of removed lines.
 * @cssprop --lit-material-diff-removed-color - Text colour of removed lines.
 * @cssprop --lit-material-diff-font - Font of the lines (a monospace stack).
 * @cssprop --lit-material-diff-max-height - Height after which the lines scroll (default none).
 */
@customElement("lit-material-diff")
export class LitMaterialDiff extends LitElement {
  static override styles = [
    diffColors,
    css`
      .head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 16px;
        margin-block-end: 8px;
      }
      .region {
        overflow: auto;
        max-height: var(--lit-material-diff-max-height, none);
        border: 1px solid var(--diff-outline);
        border-radius: var(--md-sys-shape-corner-small, 8px);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--diff-mono);
        font-size: 0.8125rem;
        line-height: 1.25rem;
      }
      th[scope="col"] {
        position: sticky;
        top: 0;
        padding: 4px 8px;
        background: var(--md-sys-color-surface-container, light-dark(#f3edf7, #211f26));
        color: var(--diff-muted);
        font-family: var(--md-sys-typescale-label-medium-font, Roboto, system-ui, sans-serif);
        font-weight: 500;
        text-align: start;
      }
      td {
        padding: 0 8px;
        vertical-align: top;
      }
      td.num {
        width: 1%;
        color: var(--diff-muted);
        text-align: end;
        user-select: none;
        white-space: nowrap;
      }
      td.sign {
        width: 1%;
        padding-inline: 0 4px;
        user-select: none;
      }
      td.text {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      tr.added td.num,
      tr.removed td.num {
        color: inherit;
      }
      td.empty-side {
        background: color-mix(in srgb, var(--diff-muted) 6%, transparent);
      }
      td.split-divider {
        border-inline-start: 1px solid var(--diff-outline);
      }
      tr.fold td {
        padding: 2px 8px;
        background: var(--md-sys-color-surface-container-low, light-dark(#f7f2fa, #1d1b20));
        color: var(--diff-muted);
        font-family: var(--md-sys-typescale-label-medium-font, Roboto, system-ui, sans-serif);
      }
    `,
  ];

  /** The text before the change. */
  @property() original = "";

  /** The text after the change. */
  @property() modified = "";

  /** `unified` (one column) or `split` (side by side). */
  @property({ reflect: true }) mode: DiffMode = "unified";

  /** Unchanged lines kept around each change; `-1` keeps every line. */
  @property({ type: Number }) context = 3;

  /** Accessible name of the table, such as "Changes to config.yaml". Default: "Changes", translated. */
  @property() label?: string;

  /** Column heading for the original side. Default: "Before", translated. */
  @property({ attribute: "original-label" }) originalLabel?: string;

  /** Column heading for the modified side. Default: "After", translated. */
  @property({ attribute: "modified-label" }) modifiedLabel?: string;

  /** Hides the added and removed counts. */
  @property({ type: Boolean, attribute: "hide-stats" }) hideStats = false;

  private lines: DiffLine[] = [];

  private readonly localize = new LocalizeController(this);

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("original") || changed.has("modified")) this.lines = diffLines(this.original ?? "", this.modified ?? "");
  }

  /** The diff as lines, for code that wants it without rendering. */
  get diff(): DiffLine[] {
    return this.lines;
  }

  private groups(): Hunk[] {
    if (this.context < 0) return [{ start: 0, lines: this.lines, beforeStart: 1, beforeCount: 0, afterStart: 1, afterCount: 0 }];
    return hunks(this.lines, this.context);
  }

  override render() {
    const { added, removed } = stats(this.lines);
    const t = this.localize;
    if (!added && !removed) return html`<p class="empty">${t.term("diff.noDifferences", "No differences.")}</p>`;
    const groups = this.groups();
    const last = groups[groups.length - 1]!;
    const split = this.mode === "split";
    const label = this.label ?? t.term("diff.changes", "Changes");
    const originalLabel = this.originalLabel ?? t.term("diff.before", "Before");
    const modifiedLabel = this.modifiedLabel ?? t.term("diff.after", "After");
    return html`
      ${this.hideStats
        ? nothing
        : html`<div class="head">
            <span class="stats" part="stats"
              ><span class="plus"
                ><span aria-hidden="true">+${t.number(added)}</span
                ><span class="visually-hidden"
                  >${t.term("diff.addedCount", { one: "{count} added", other: "{count} added" }, {
                    count: added,
                  })}</span
                ></span
              ><span class="minus"
                ><span aria-hidden="true">−${t.number(removed)}</span
                ><span class="visually-hidden"
                  >${t.term("diff.removedCount", { one: "{count} removed", other: "{count} removed" }, {
                    count: removed,
                  })}</span
                ></span
              ></span
            >
          </div>`}
      <div class="region" tabindex="0" role="region" aria-label=${label}>
        <table part="table">
          <caption class="visually-hidden">${label}</caption>
          <thead>
            ${split
              ? html`<tr><th scope="col" colspan="3">${originalLabel}</th><th scope="col" colspan="3" class="split-divider">${modifiedLabel}</th></tr>`
              : html`<tr>
                  <th scope="col">
                    <span class="visually-hidden">${t.term("diff.sideLine", "{side} line", { side: originalLabel })}</span>
                  </th>
                  <th scope="col">
                    <span class="visually-hidden">${t.term("diff.sideLine", "{side} line", { side: modifiedLabel })}</span>
                  </th>
                  <th scope="col"><span class="visually-hidden">${t.term("diff.change", "Change")}</span></th>
                  <th scope="col">${t.term("diff.line", "Line")}</th>
                </tr>`}
          </thead>
          <tbody>
            ${groups.map((g, i) => {
              const prev = groups[i - 1];
              return html`${this.fold(g.start - (prev ? prev.start + prev.lines.length : 0), split)}${split ? this.splitRows(g) : this.unifiedRows(g)}`;
            })}
            ${this.fold(this.lines.length - (last.start + last.lines.length), split)}
          </tbody>
        </table>
      </div>`;
  }

  private fold(hidden: number, split: boolean) {
    if (hidden <= 0) return nothing;
    const text = this.localize.term(
      "diff.unchangedLines",
      { one: "{count} unchanged line", other: "{count} unchanged lines" },
      { count: hidden },
    );
    return html`<tr class="fold"><td colspan=${split ? 6 : 4}>${text}</td></tr>`;
  }

  private unifiedRows(g: Hunk) {
    return g.lines.map(
      (l) => html`<tr class=${l.op}>
        <td class="num">${l.before ?? ""}</td>
        <td class="num">${l.after ?? ""}</td>
        <td class="sign" aria-hidden="true">${l.op === "added" ? "+" : l.op === "removed" ? "−" : ""}</td>
        <td class="text">${this.marker(l.op)}${l.text}</td>
      </tr>`,
    );
  }

  private splitRows(g: Hunk) {
    return sideBySide(g.lines).map(
      (r) => html`<tr class=${r.op}>
        ${this.side(r.left, "removed")}${this.side(r.right, "added", true)}
      </tr>`,
    );
  }

  private side(l: DiffLine | undefined, change: "added" | "removed", divider = false) {
    if (!l) return html`<td class=${`num empty-side${divider ? " split-divider" : ""}`}></td><td class="sign empty-side"></td><td class="text empty-side"></td>`;
    const op = l.op === "same" ? "same" : change;
    const num = change === "removed" ? l.before : l.after;
    return html`<td class=${`num ${op === "same" ? "" : op}${divider ? " split-divider" : ""}`}>${num ?? ""}</td>
      <td class=${`sign ${op === "same" ? "" : op}`} aria-hidden="true">${op === "added" ? "+" : op === "removed" ? "−" : ""}</td>
      <td class=${`text ${op === "same" ? "" : op}`}>${this.marker(op)}${l.text}</td>`;
  }

  private marker(op: string) {
    const t = this.localize;
    if (op === "added") return html`<span class="visually-hidden">${`${t.term("diff.addedLine", "Added:")} `}</span>`;
    if (op === "removed") return html`<span class="visually-hidden">${`${t.term("diff.removedLine", "Removed:")} `}</span>`;
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-diff": LitMaterialDiff;
  }
}
