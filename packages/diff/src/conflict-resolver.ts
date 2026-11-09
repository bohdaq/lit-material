import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { diffLines, type DiffLine } from "./lines.js";
import { diffColors } from "./styles.js";
import { LocalizeController } from "@lit-material/core/localize.js";

export type ConflictChoice = "yours" | "theirs" | "both";

/** Both versions merged line by line: shared lines once, each side's own lines in order. */
export function keepBoth(yours: string, theirs: string): string {
  return diffLines(yours, theirs)
    .map((l) => l.text)
    .join("\n");
}

/** The result text for a choice. */
export function resolveText(choice: ConflictChoice, yours: string, theirs: string): string {
  if (choice === "yours") return yours;
  if (choice === "theirs") return theirs;
  return keepBoth(yours, theirs);
}

/**
 * One conflict between two versions of a text (a sync conflict, a merge
 * conflict in a YAML or JSON file), resolved by keeping yours, theirs or
 * both. Three panes: yours and theirs, each with the lines only it has
 * marked, and the result, which starts from the choice and can be edited.
 * "Use result" fires `resolve`.
 *
 * The choice is a radio group; each pane is a labelled region, so screen
 * reader users can move between them. `value` is the result text.
 *
 * @element lit-material-conflict-resolver
 *
 * @fires resolve - "Use result" was pressed; `detail` is `{ text, choice, edited }`.
 * @fires change - The choice changed; `detail` is `{ choice }`.
 *
 * @csspart pane - Each of the three panes.
 * @csspart heading - Each pane's heading.
 * @csspart lines - The yours and theirs line lists.
 * @csspart result - The result text area.
 * @csspart choices - The radio group.
 * @csspart resolve - The "Use result" button.
 *
 * @cssprop --lit-material-diff-max-height - Height after which each pane scrolls (default `24rem`).
 * @cssprop --lit-material-conflict-resolver-yours-color - Lines only yours has (default the diff's added colour).
 * @cssprop --lit-material-conflict-resolver-theirs-color - Lines only theirs has (default `--md-sys-color-tertiary`).
 */
@customElement("lit-material-conflict-resolver")
export class LitMaterialConflictResolver extends LitElement {
  static override styles = [
    diffColors,
    css`
      :host {
        --yours: var(--lit-material-conflict-resolver-yours-color, var(--diff-added-fg));
        --theirs: var(--lit-material-conflict-resolver-theirs-color, var(--md-sys-color-tertiary, light-dark(#7d5260, #efb8c8)));
      }
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
      section.result {
        margin-block-start: 12px;
      }
      header {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 12px;
        padding: 8px 12px;
        background: var(--md-sys-color-surface-container, light-dark(#f3edf7, #211f26));
      }
      h3 {
        margin: 0;
        font-size: var(--md-sys-typescale-title-small-size, 0.875rem);
        font-weight: var(--md-sys-typescale-title-small-weight, 500);
      }
      .note {
        color: var(--diff-muted);
        font-size: var(--md-sys-typescale-label-small-size, 0.75rem);
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
      li.own-yours {
        color: var(--yours);
        box-shadow: inset 3px 0 var(--yours);
      }
      li.own-theirs {
        color: var(--theirs);
        box-shadow: inset 3px 0 var(--theirs);
      }
      :host(:dir(rtl)) li.own-yours {
        box-shadow: inset -3px 0 var(--yours);
      }
      :host(:dir(rtl)) li.own-theirs {
        box-shadow: inset -3px 0 var(--theirs);
      }
      textarea {
        box-sizing: border-box;
        width: 100%;
        min-height: 8rem;
        max-height: var(--lit-material-diff-max-height, 24rem);
        margin: 0;
        padding: 8px 12px;
        border: 0;
        resize: vertical;
        background: transparent;
        color: inherit;
        font-family: var(--diff-mono);
        font-size: 0.8125rem;
        line-height: 1.25rem;
      }
      textarea:focus-visible {
        outline: 3px solid var(--md-sys-color-secondary, #625b71);
        outline-offset: -3px;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 16px;
        margin-block-start: 12px;
      }
      fieldset {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 16px;
        margin: 0;
        padding: 0;
        border: 0;
      }
      legend {
        float: inline-start;
        margin-inline-end: 8px;
        padding: 0;
        color: var(--diff-muted);
      }
      label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 32px;
        cursor: pointer;
      }
      input[type="radio"] {
        accent-color: var(--md-sys-color-primary, #6750a4);
      }
      button {
        margin-inline-start: auto;
        min-height: 36px;
        padding: 0 16px;
        border: 0;
        border-radius: var(--md-sys-shape-corner-full, 9999px);
        background: var(--md-sys-color-primary, #6750a4);
        color: var(--md-sys-color-on-primary, #fff);
        font: inherit;
        font-weight: 500;
        cursor: pointer;
      }
      button:focus-visible {
        outline: 3px solid var(--md-sys-color-secondary, #625b71);
        outline-offset: 2px;
      }
      @media (forced-colors: active) {
        li.own-yours { border-inline-start: 3px solid Highlight; }
        li.own-theirs { border-inline-start: 3px dashed CanvasText; }
      }
    `,
  ];

  /** Your version. */
  @property() yours = "";
  /** Their version. */
  @property() theirs = "";
  /** Heading of your pane (default "Yours"). */
  @property({ attribute: "yours-label" }) yoursLabel = "";
  /** Heading of their pane (default "Theirs"). */
  @property({ attribute: "theirs-label" }) theirsLabel = "";
  /** Who made each version and when, under its heading. */
  @property({ attribute: "yours-note" }) yoursNote = "";
  @property({ attribute: "theirs-note" }) theirsNote = "";
  /** The choice the result starts from. */
  @property({ reflect: true }) choice: ConflictChoice = "both";
  /** The result text; set it to start from your own merge. */
  @property() value = "";

  @state() private edited = false;
  private lines: DiffLine[] = [];
  private readonly localize = new LocalizeController(this);
  private static nextId = 0;
  private readonly uid = `cr${LitMaterialConflictResolver.nextId++}`;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("yours") || changed.has("theirs")) {
      this.lines = diffLines(this.yours ?? "", this.theirs ?? "");
    }
    const fresh = changed.has("yours") || changed.has("theirs") || changed.has("choice");
    if (fresh && !(changed.has("value") && this.value !== "") && !this.edited) {
      this.value = resolveText(this.choice, this.yours ?? "", this.theirs ?? "");
    }
  }

  private pick(choice: ConflictChoice) {
    this.edited = false;
    this.choice = choice;
    this.dispatchEvent(new CustomEvent("change", { detail: { choice }, bubbles: true, composed: true }));
  }

  private onInput(e: Event) {
    this.value = (e.target as HTMLTextAreaElement).value;
    this.edited = true;
  }

  private useResult() {
    this.dispatchEvent(
      new CustomEvent("resolve", { detail: { text: this.value, choice: this.choice, edited: this.edited }, bubbles: true, composed: true }),
    );
  }

  private pane(side: "yours" | "theirs", label: string, note: string) {
    const own = side === "yours" ? "removed" : "added";
    const shown = this.lines.filter((l) => l.op === "same" || l.op === own);
    const count = shown.filter((l) => l.op === own).length;
    const t = this.localize;
    const id = `${this.uid}-${side}`;
    return html`<section part="pane" aria-labelledby=${id}>
      <header>
        <h3 id=${id} part="heading">${label}</h3>
        <span class="note">${note ? `${note} · ` : ""}${t.term("diff.onlyHere", { one: "{count} line only here", other: "{count} lines only here" }, { count })}</span>
      </header>
      <div class="region" tabindex="0" role="region" aria-label=${t.term("diff.sideText", "{side}, text", { side: label })}>
        <ol part="lines">
          ${shown.map(
            (l) =>
              html`<li class=${l.op === own ? `own-${side}` : ""}>${l.op === own ? html`<span class="visually-hidden">${`${t.term("diff.onlyHereLine", "Only here:")} `}</span>` : ""}${l.text || " "}</li>`,
          )}
        </ol>
      </div>
    </section>`;
  }

  override render() {
    const t = this.localize;
    const yoursLabel = this.yoursLabel || t.term("diff.yours", "Yours");
    const theirsLabel = this.theirsLabel || t.term("diff.theirs", "Theirs");
    const resultId = `${this.uid}-result`;
    const options: [ConflictChoice, string][] = [
      ["yours", t.term("diff.keepYours", "Keep yours")],
      ["theirs", t.term("diff.keepTheirs", "Keep theirs")],
      ["both", t.term("diff.keepBoth", "Keep both")],
    ];
    return html`<div class="sides">
        ${this.pane("yours", yoursLabel, this.yoursNote)} ${this.pane("theirs", theirsLabel, this.theirsNote)}
      </div>
      <div class="actions">
        <fieldset part="choices">
          <legend>${t.term("diff.keep", "Keep")}</legend>
          ${options.map(
            ([c, label]) =>
              html`<label
                ><input
                  type="radio"
                  name=${`${this.uid}-choice`}
                  .checked=${this.choice === c}
                  @change=${() => this.pick(c)}
                />${label}</label
              >`,
          )}
        </fieldset>
        <button part="resolve" type="button" @click=${this.useResult}>${t.term("diff.useResult", "Use result")}</button>
      </div>
      <section class="result" part="pane" aria-labelledby=${resultId}>
        <header>
          <h3 id=${resultId} part="heading">${t.term("diff.result", "Result")}</h3>
          <span class="note">${this.edited ? t.term("diff.edited", "Edited") : t.term("diff.editable", "You can edit it")}</span>
        </header>
        <textarea part="result" aria-labelledby=${resultId} spellcheck="false" .value=${this.value} @input=${this.onInput}></textarea>
      </section>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-conflict-resolver": LitMaterialConflictResolver;
  }
}
