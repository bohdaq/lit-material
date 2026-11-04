import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { diffLines, type DiffLine } from "./lines.js";
import { diffColors } from "./styles.js";
import { LocalizeController } from "@lit-material/core/localize.js";

export interface MergeSide {
  label: string;
  text: string;
}

/**
 * Two or more versions of one text side by side, each compared with a
 * common base: lines a version added or changed are highlighted, and lines
 * it dropped are counted. For sync conflicts and three-way merges ("mine",
 * "theirs", "before both changes").
 *
 * `sides` is a property, or a JSON attribute for server rendering; `base`
 * is the index of the side the others are compared with. Put actions for a
 * side (such as "Keep mine") in the slot named `side-<index>`.
 *
 * @element lit-material-merge-view
 *
 * @slot side-0 - Actions under the first side's heading; `side-1`, `side-2` and so on for the others.
 *
 * @csspart side - Each column.
 * @csspart heading - Each column's heading.
 * @csspart lines - Each column's lines.
 *
 * @cssprop --lit-material-diff-max-height - Height after which each column scrolls (default `24rem`).
 */
@customElement("lit-material-merge-view")
export class LitMaterialMergeView extends LitElement {
  static override styles = [
    diffColors,
    css`
      .sides {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
        gap: 12px;
      }
      section {
        display: flex;
        flex-direction: column;
        min-width: 0;
        border: 1px solid var(--diff-outline);
        border-radius: var(--md-sys-shape-corner-small, 8px);
        overflow: hidden;
      }
      header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 12px;
        padding: 8px 12px;
        background: var(--md-sys-color-surface-container, light-dark(#f3edf7, #211f26));
      }
      h3 {
        margin: 0;
        font-family: var(--md-sys-typescale-title-small-font, Roboto, system-ui, sans-serif);
        font-size: var(--md-sys-typescale-title-small-size, 0.875rem);
        font-weight: var(--md-sys-typescale-title-small-weight, 500);
      }
      .note {
        color: var(--diff-muted);
        font-size: var(--md-sys-typescale-label-small-size, 0.75rem);
      }
      slot {
        display: flex;
        gap: 8px;
        margin-inline-start: auto;
      }
      .region {
        flex: 1;
        overflow: auto;
        max-height: var(--lit-material-diff-max-height, 24rem);
      }
      ol {
        margin: 0;
        padding: 4px 0;
        list-style: none;
        font-family: var(--diff-mono);
        font-size: 0.8125rem;
        line-height: 1.25rem;
      }
      li {
        padding-inline: 12px;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      li.added {
        box-shadow: inset 3px 0 var(--diff-added-fg);
      }
      :host(:dir(rtl)) li.added {
        box-shadow: inset -3px 0 var(--diff-added-fg);
      }
    `,
  ];

  /** The versions, each with a label and its text. */
  @property({ type: Array }) sides: MergeSide[] = [];

  /** Index of the side the others are compared with. */
  @property({ type: Number }) base = 0;

  private compared: { lines: DiffLine[]; dropped: number }[] = [];

  private readonly localize = new LocalizeController(this);

  private note(index: number, added: number, dropped: number): string {
    const t = this.localize;
    if (index === this.base) return t.term("diff.base", "Base");
    if (added && dropped) {
      return t.term("diff.newAndDropped", "{added} new or changed, {dropped} dropped", { added, dropped });
    }
    if (added) {
      return t.term("diff.newOrChanged", { one: "{count} new or changed", other: "{count} new or changed" }, { count: added });
    }
    if (dropped) return t.term("diff.dropped", { one: "{count} dropped", other: "{count} dropped" }, { count: dropped });
    const baseLabel = this.sides?.[this.base]?.label;
    if (baseLabel === undefined) return t.term("diff.sameAsBase", "Same as the base");
    return t.term("diff.sameAs", "Same as {side}", { side: baseLabel });
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!changed.has("sides") && !changed.has("base")) return;
    const sides = this.sides ?? [];
    const base = sides[this.base]?.text ?? "";
    this.compared = sides.map((s, i) => {
      if (i === this.base) return { lines: diffLines("", s.text).map((l) => ({ ...l, op: "same" as const })), dropped: 0 };
      const all = diffLines(base, s.text);
      return { lines: all.filter((l) => l.op !== "removed"), dropped: all.length - all.filter((l) => l.op !== "removed").length };
    });
  }

  override render() {
    const sides = this.sides ?? [];
    return html`<div class="sides">
      ${sides.map((s, i) => {
        const c = this.compared[i] ?? { lines: [], dropped: 0 };
        const added = c.lines.filter((l) => l.op === "added").length;
        const note = this.note(i, added, c.dropped);
        return html`<section part="side" aria-labelledby=${`h${i}`}>
          <header>
            <h3 id=${`h${i}`} part="heading">${s.label}</h3>
            <span class="note">${note}</span>
            <slot name=${`side-${i}`}></slot>
          </header>
          <div class="region" tabindex="0" role="region" aria-label=${this.localize.term("diff.sideText", "{side}, text", { side: s.label })}>
            <ol part="lines">
              ${c.lines.map((l) => html`<li class=${l.op}>${l.op === "added" ? html`<span class="visually-hidden">${`${this.localize.term("diff.newLine", "New:")} `}</span>` : ""}${l.text || " "}</li>`)}
            </ol>
          </div>
        </section>`;
      })}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-merge-view": LitMaterialMergeView;
  }
}
