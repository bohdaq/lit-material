import { html, nothing } from "lit";
import "./icon.js";
import type { IconSize } from "./icon.js";

/**
 * A registered icon as a template value: `${icon("trash")}` in a button's
 * `icon` slot, a list row or beside text. Same as
 * `<lit-material-icon name="trash">`; pass `label` only when the icon says
 * something no nearby text does.
 */
export function icon(name: string, options: { label?: string; size?: IconSize; slot?: string } = {}) {
  return html`<lit-material-icon
    name=${name}
    label=${options.label ?? nothing}
    size=${options.size ?? nothing}
    slot=${options.slot ?? nothing}
  ></lit-material-icon>`;
}
