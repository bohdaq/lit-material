import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { diffColors } from "./styles.js";

export type ChangeKind = "added" | "removed" | "changed";

export interface Change {
  /** Where the change is: a JSON path, a header name, a field. */
  path: string;
  kind: ChangeKind;
  before?: unknown;
  after?: unknown;
}

const show = (value: unknown): string => (typeof value === "string" ? value : JSON.stringify(value) ?? String(value));

/**
 * A list of changes by path: what was added, removed or changed, with the
 * old and new values. For structured data (JSON fields, headers, settings)
 * where a line diff would be noise.
 *
 * Set `changes` as a property, or as a JSON attribute when rendering on the
 * server. Values that aren't strings are shown as JSON.
 *
 * @element lit-material-change-list
 *
 * @csspart list - The `<ul>`.
 * @csspart item - Each change.
 * @csspart path - The path of each change.
 */
@customElement("lit-material-change-list")
export class LitMaterialChangeList extends LitElement {
  static override styles = [
    diffColors,
    css`
      ul {
        display: grid;
        gap: 4px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      li {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 8px;
        padding: 4px 8px;
        border-inline-start: 3px solid var(--diff-outline);
        overflow-wrap: anywhere;
      }
      li.added { border-color: var(--diff-added-fg); background: none; color: inherit; }
      li.removed { border-color: var(--diff-removed-fg); background: none; color: inherit; }
      li.changed { border-color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff)); }
      code {
        font-family: var(--diff-mono);
        font-weight: 500;
      }
      .kind {
        color: var(--diff-muted);
        font-size: var(--md-sys-typescale-label-small-size, 0.75rem);
      }
      .arrow {
        color: var(--diff-muted);
      }
    `,
  ];

  /** The changes, in the order to show them. */
  @property({ type: Array }) changes: Change[] = [];

  /** Accessible name of the list. */
  @property() label = "Changes";

  override render() {
    const changes = this.changes ?? [];
    if (!changes.length) return html`<p class="empty">No differences.</p>`;
    return html`<ul part="list" aria-label=${this.label}>
      ${changes.map(
        (c) => html`<li class=${c.kind} part="item">
          <code part="path">${c.path}</code>
          <span class="kind">${c.kind}</span>
          ${c.kind === "added"
            ? html`<ins>${show(c.after)}</ins>`
            : c.kind === "removed"
              ? html`<del>${show(c.before)}</del>`
              : html`<del>${show(c.before)}</del><span class="arrow" aria-hidden="true">→</span><span class="visually-hidden">to</span><ins>${show(c.after)}</ins>`}
        </li>`,
      )}
    </ul>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-change-list": LitMaterialChangeList;
  }
}
