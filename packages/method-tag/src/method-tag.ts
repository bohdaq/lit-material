import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./method-tag-styles.js";

export type MethodTagSize = "small" | "medium";
/** The colour family a method gets: the five HTTP methods with their own colour, or `other`. */
export type MethodKind = "get" | "post" | "put" | "patch" | "delete" | "other";

const KINDS: readonly MethodKind[] = ["get", "post", "put", "patch", "delete"];

/** The colour family of `method` (case-insensitive); anything but GET, POST, PUT, PATCH and DELETE is `other`. */
export const methodKind = (method: string): MethodKind => {
  const m = method.trim().toLowerCase() as MethodKind;
  return KINDS.includes(m) ? m : "other";
};

/**
 * An HTTP or API method as a short uppercase label in monospace, coloured by method:
 * GET green, POST amber, PUT blue, PATCH violet, DELETE red, anything else (HEAD, OPTIONS,
 * WS, GQL, SSE, gRPC…) the primary colour. The text is the method itself, so the meaning
 * never rests on colour.
 *
 * @element lit-material-method-tag
 *
 * @cssprop --lit-material-method-tag-get - GET's colour.
 * @cssprop --lit-material-method-tag-post - POST's colour.
 * @cssprop --lit-material-method-tag-put - PUT's colour.
 * @cssprop --lit-material-method-tag-patch - PATCH's colour.
 * @cssprop --lit-material-method-tag-delete - DELETE's colour.
 * @cssprop --lit-material-method-tag-other - Every other method's colour (default: primary).
 * @cssprop --lit-material-method-tag-font - The font (default: the system monospace).
 *
 * @csspart tag - The label.
 */
@customElement("lit-material-method-tag")
export class LitMaterialMethodTag extends LitElement {
  static override styles = styles;

  /** The method, e.g. `GET`, `POST`, `WS`. Shown in capitals. */
  @property() method = "";

  /** `small` (default, for lists) or `medium`. */
  @property({ reflect: true }) size: MethodTagSize = "small";

  override render() {
    return html`<span class="tag ${methodKind(this.method)}" part="tag">${this.method.trim().toUpperCase()}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-method-tag": LitMaterialMethodTag;
  }
}
