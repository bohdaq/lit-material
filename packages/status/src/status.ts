import { html, LitElement, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./status-styles.js";

export type StatusKind = "ok" | "warning" | "error" | "info" | "neutral";

// 20×20 glyphs, drawn here so the package ships no icon set (and works
// without one). Each kind has a distinct shape, so the state reads without
// colour too: a check, a triangle, a cross, an "i", a dot.
const GLYPHS: Record<StatusKind, ReturnType<typeof svg>> = {
  ok: svg`<circle cx="10" cy="10" r="8"/><path d="M6.5 10.2l2.4 2.4 4.6-4.8"/>`,
  warning: svg`<path d="M10 3l7.5 13h-15z"/><path d="M10 8.2v3.6M10 14.2v.1"/>`,
  error: svg`<circle cx="10" cy="10" r="8"/><path d="M7.2 7.2l5.6 5.6M12.8 7.2l-5.6 5.6"/>`,
  info: svg`<circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6.2v.1"/>`,
  neutral: svg`<circle cx="10" cy="10" r="3.2" class="fill"/>`,
};

const KINDS = new Set<string>(["ok", "warning", "error", "info", "neutral"]);

/**
 * A status indicator: an icon and a short label, coloured by state. Colour is
 * never the only signal — each state has its own glyph and the label says it
 * in words — so it reads in grayscale, for colour-blind users and in
 * forced-colors mode.
 *
 * The label is the default slot (`<lit-material-status status="ok">Healthy</…>`).
 * Slot your own icon into `icon` to replace the built-in glyph.
 *
 * It's text, not a live region: for a status that changes while someone is
 * looking and should be announced, put it inside your own
 * `role="status"` element.
 *
 * @element lit-material-status
 *
 * @slot - The label.
 * @slot icon - Replaces the built-in glyph.
 *
 * @csspart status - The row holding icon and label.
 * @csspart icon - The icon box.
 *
 * @cssprop --lit-material-status-ok-color
 * @cssprop --lit-material-status-warning-color
 * @cssprop --lit-material-status-error-color
 * @cssprop --lit-material-status-info-color
 * @cssprop --lit-material-status-neutral-color
 */
@customElement("lit-material-status")
export class LitMaterialStatus extends LitElement {
  static override styles = styles;

  /** `ok`, `warning`, `error`, `info` or `neutral` (anything else is neutral). */
  @property({ reflect: true }) status: StatusKind = "neutral";

  private get kind(): StatusKind {
    return KINDS.has(this.status) ? this.status : "neutral";
  }

  override render() {
    const kind = this.kind;
    return html`<span class="status ${kind}" part="status">
      <span class="icon" part="icon" aria-hidden="true"
        ><slot name="icon"><svg viewBox="0 0 20 20" focusable="false">${GLYPHS[kind]}</svg></slot></span
      ><span class="label"><slot></slot></span>
    </span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-status": LitMaterialStatus;
  }
}
