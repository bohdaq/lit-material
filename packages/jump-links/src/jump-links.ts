import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface JumpLink {
  /** The target element's id. */
  id: string;
  /** The link text. */
  text: string;
  /** Heading level, e.g. 2 or 3; deeper levels indent. */
  depth?: number;
}

/**
 * An "On this page" list: links to a page's sections that highlight the
 * one being read. The links are plain `#id` anchors, so they work before
 * (and without) JavaScript and render on the server; scrolling then marks
 * the section at the top of the viewport with `aria-current="location"`.
 *
 * Give it `links` (`{ id, text, depth? }[]`), or set `for` to the id of a
 * container and it collects that container's `h2`/`h3` headings with ids.
 * Sticky headers: set `scroll-margin-top` on the headings (the browser then
 * leaves room when jumping) and `offset` to the header's height.
 *
 * @element lit-material-jump-links
 *
 * @csspart nav - The `<nav>`.
 * @csspart link - Each link.
 * @csspart title - The heading above the links.
 */
@customElement("lit-material-jump-links")
export class LitMaterialJumpLinks extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    }
    :host([hidden]) {
      display: none;
    }
    .title {
      margin: 0 0 8px;
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
      font-weight: 500;
    }
    ol {
      margin: 0;
      padding: 0;
      list-style: none;
      border-inline-start: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    }
    a {
      display: block;
      margin-inline-start: -1px;
      padding: 4px 0 4px calc(12px + var(--indent, 0px));
      border-inline-start: 2px solid transparent;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      text-decoration: none;
    }
    a:hover {
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    }
    a:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      outline-offset: -2px;
    }
    a[aria-current] {
      border-inline-start-color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      font-weight: 500;
    }
  `;

  /** The sections. Ignored while `for` is set. */
  @property({ attribute: false }) links: JumpLink[] = [];

  /** Id of a container whose `h2`/`h3` headings with ids become the links. */
  @property({ attribute: "for" }) htmlFor = "";

  /** Heading above the links; empty hides it. Also names the `<nav>`. */
  @property() label = "On this page";

  /** Pixels covered by a sticky header: a section counts as current once its top passes this line. */
  @property({ type: Number }) offset = 0;

  /** Id of the section in view; reflected as `aria-current` on its link. */
  @state() current = "";

  @state() private collected: JumpLink[] = [];

  private observer?: MutationObserver;

  private ticking = false;

  private get entries(): JumpLink[] {
    return this.htmlFor ? this.collected : this.links;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("hashchange", this.onScroll);
    this.collect();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("hashchange", this.onScroll);
    this.observer?.disconnect();
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("htmlFor") && this.isConnected) this.collect();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("links") || changed.has("collected") || changed.has("offset")) this.updateCurrent();
  }

  /** Looks ids up where this element lives: its shadow root, else the document. */
  private byId(id: string): HTMLElement | null {
    const root = this.getRootNode() as Document | ShadowRoot;
    return (root.getElementById?.(id) as HTMLElement | null) ?? document.getElementById(id);
  }

  private collect(): void {
    this.observer?.disconnect();
    if (!this.htmlFor || typeof document === "undefined") return;
    const root = this.byId(this.htmlFor);
    if (!root) return;
    const read = () => {
      this.collected = Array.from(root.querySelectorAll<HTMLElement>("h2[id], h3[id]")).map((h) => ({
        id: h.id,
        text: h.textContent?.replace(/#$/, "").trim() ?? "",
        depth: Number(h.tagName[1]),
      }));
    };
    read();
    this.observer = new MutationObserver(read);
    this.observer.observe(root, { childList: true, subtree: true });
  }

  private readonly onScroll = (): void => {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.updateCurrent();
    });
  };

  /** The last section whose top has passed the offset line; the first one before any has. */
  private updateCurrent(): void {
    const entries = this.entries;
    if (entries.length === 0) {
      this.current = "";
      return;
    }
    const line = this.offset + 8;
    let current = entries[0]!.id;
    for (const entry of entries) {
      const el = this.byId(entry.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= line) current = entry.id;
      else break;
    }
    // At the very bottom the last sections can't reach the line: mark the last.
    const doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) current = entries[entries.length - 1]!.id;
    this.current = current;
  }

  override render() {
    const entries = this.entries;
    if (entries.length === 0) return nothing;
    const top = Math.min(...entries.map((e) => e.depth ?? 2));
    return html`<nav part="nav" aria-label=${this.label || "On this page"}>
      ${this.label ? html`<p part="title" class="title" aria-hidden="true">${this.label}</p>` : nothing}
      <ol>
        ${entries.map(
          (entry) => html`<li>
            <a
              part="link"
              href=${`#${entry.id}`}
              style=${`--indent: ${((entry.depth ?? top) - top) * 12}px`}
              aria-current=${entry.id === this.current ? "location" : nothing}
              >${entry.text}</a
            >
          </li>`,
        )}
      </ol>
    </nav>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-jump-links": LitMaterialJumpLinks;
  }
}
