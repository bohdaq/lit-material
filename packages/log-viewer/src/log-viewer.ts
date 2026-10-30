import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { styles } from "./log-viewer-styles.js";

export type LogLevel = "error" | "warning" | "info";

interface Line {
  id: number;
  text: string;
  level?: LogLevel;
}

/**
 * A log viewer: a monospace stream of lines, newest at the bottom.
 *
 * - **Follows the newest line only while you're at the bottom.** Scroll up
 *   to read and it stays put, with a "N new lines" button to jump back.
 * - **Pause** (`paused`) holds new lines back until you resume, then adds
 *   them all; nothing is lost up to `max-lines`.
 * - **A line cap** (`max-lines`, default 1000) drops the oldest, so a busy
 *   stream can't grow the page without bound.
 * - **Highlighting**: set `highlight` to a function returning `"error"`,
 *   `"warning"` or `"info"` for a line; the level shows as colour *and* a
 *   marker in the gutter.
 *
 * Feed it with `appendLines(line)` / `appendLines([lines])`, or set `lines`.
 * It's a `role="log"` region, not announced live by default (`aria-live`
 * off): a busy log read aloud line by line is unusable.
 *
 * @element lit-material-log-viewer
 *
 * @fires lines-dropped - `detail: { count }` when `max-lines` dropped old lines.
 *
 * @csspart viewport - The scrolling area.
 * @csspart line - Each line.
 * @csspart jump - The "new lines" button.
 *
 * @cssprop --lit-material-log-viewer-height - The viewport's height (default 320px).
 */
@customElement("lit-material-log-viewer")
export class LitMaterialLogViewer extends LitElement {
  static override styles = styles;

  /** Lines kept; the oldest are dropped past this. */
  @property({ type: Number, attribute: "max-lines" }) maxLines = 1000;

  /** Hold new lines back until set to false again. */
  @property({ type: Boolean, reflect: true }) paused = false;

  /** Wrap long lines instead of scrolling sideways. */
  @property({ type: Boolean, reflect: true }) wrap = false;

  /** The accessible name of the log region. */
  @property() label = "Log";

  /** Classifies a line; return nothing for a plain one. */
  @property({ attribute: false }) highlight?: (line: string) => LogLevel | null | undefined;

  @state() private entries: Line[] = [];
  @state() private unseen = 0;
  @state() private held: string[] = [];

  @query(".viewport") private readonly viewport?: HTMLElement;

  private nextId = 0;
  private following = true;

  /** The lines shown, oldest first. */
  get lines(): string[] {
    return this.entries.map((l) => l.text);
  }

  set lines(lines: string[]) {
    this.entries = [];
    this.held = [];
    this.unseen = 0;
    this.following = true;
    this.add(lines);
  }

  /** Add one line or several (a string with newlines is split). */
  appendLines(lines: string | string[]): void {
    const list = (Array.isArray(lines) ? lines : [lines]).flatMap((l) => String(l).split("\n"));
    if (this.paused) {
      this.held = [...this.held, ...list].slice(-this.maxLines);
      return;
    }
    this.add(list);
  }

  clear(): void {
    this.entries = [];
    this.held = [];
    this.unseen = 0;
  }

  /** Scroll to the newest line and follow again. */
  scrollToLatest(): void {
    this.following = true;
    this.unseen = 0;
    const v = this.viewport;
    if (v) v.scrollTop = v.scrollHeight;
  }

  private add(list: string[]): void {
    if (list.length === 0) return;
    const added = list.map((text) => ({ id: this.nextId++, text, level: this.highlight?.(text) ?? undefined }));
    const all = [...this.entries, ...added];
    const dropped = Math.max(0, all.length - this.maxLines);
    this.entries = dropped ? all.slice(dropped) : all;
    if (dropped) this.dispatchEvent(new CustomEvent("lines-dropped", { detail: { count: dropped }, bubbles: true, composed: true }));
    if (!this.following) this.unseen += added.length;
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("paused") && !this.paused && this.held.length) {
      const held = this.held;
      this.held = [];
      this.add(held);
    }
  }

  protected override updated(): void {
    if (this.following && this.viewport) this.viewport.scrollTop = this.viewport.scrollHeight;
  }

  private onScroll(): void {
    const v = this.viewport;
    if (!v) return;
    this.following = v.scrollHeight - v.scrollTop - v.clientHeight < 24;
    if (this.following) this.unseen = 0;
  }

  override render() {
    return html`
      <div class="box">
        <div class="viewport" part="viewport" role="log" aria-live="off" aria-label=${this.label} tabindex="0" @scroll=${this.onScroll}>
          ${repeat(
            this.entries,
            (l) => l.id,
            (l) => html`<div class="line ${l.level ?? ""}" part="line">${l.level ? html`<span class="mark" aria-label=${l.level}></span>` : nothing}${l.text}</div>`,
          )}
        </div>
        ${this.unseen > 0
          ? html`<button class="jump" part="jump" @click=${() => this.scrollToLatest()}>${this.unseen} new line${this.unseen === 1 ? "" : "s"} ↓</button>`
          : nothing}
        ${this.paused && this.held.length
          ? html`<div class="held" role="status">Paused: ${this.held.length} line${this.held.length === 1 ? "" : "s"} waiting</div>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-log-viewer": LitMaterialLogViewer;
  }
}
