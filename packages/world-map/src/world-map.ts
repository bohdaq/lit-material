import { html, LitElement, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { isRtl, LocalizeController } from "@lit-material/core/localize.js";
import { cssProps } from "@lit-material/core/css-props.js";
import { COUNTRIES, VIEWBOX } from "./countries.js";
import { styles } from "./world-map-styles.js";

/** Values by ISO 3166-1 alpha-2 country code, e.g. `{ US: 120, DE: 40 }`. */
export type CountryValues = Record<string, number>;

export interface WorldMapChangeDetail {
  /** The selected country's code, or `""` when the selection was cleared. */
  code: string;
  /** Its value, or `null` when cleared. */
  value: number | null;
}

interface Entry {
  code: string;
  name: string;
  value: number;
}

const LOW = 18;
const HIGH = 90;
/** Fill strength for `value` on the square-root scale: small counts stay visible next to a big one. */
export const level = (value: number, max: number): number => (value > 0 && max > 0 ? Math.round(LOW + (HIGH - LOW) * Math.sqrt(Math.min(1, value / max))) : 0);

const SUMMARY_TOP = 5;

/**
 * A world map shaded by a value per country (a choropleth), e.g. visitors by country.
 *
 * Countries are coloured on a square-root scale of one sequential colour, with a legend under the map.
 * Countries too small for the 1:110m shapes (Singapore, Malta, Bahrain…) are listed under the map instead
 * of being dropped, so every value can be seen and picked.
 *
 * Focus the map and use the arrow keys (Home / End) to read the countries that have a value, highest
 * first; with `selectable`, Enter or Space (or a click) selects one and fires `change`. Screen readers get
 * the label with the top countries, every value in a table, and each country as it's read.
 *
 * Shapes are Natural Earth (public domain), drawn in SVG with no measuring, so the map renders on the
 * server. They ship in this package (about 12 kB gzipped) and nowhere else.
 *
 * @element lit-material-world-map
 *
 * @fires change - With `selectable`, a country was selected or the selection cleared. `detail`: `{ code, value }`.
 *
 * @csspart map - The SVG.
 * @csspart tooltip - The hover/focus readout.
 * @csspart legend - The colour scale under the map.
 * @csspart elsewhere - The list of countries too small to draw.
 *
 * @cssprop --lit-material-world-map-fill - Colour of the highest value (default: the first chart series colour).
 * @cssprop --lit-material-world-map-empty - Colour of countries with no value.
 * @cssprop --lit-material-world-map-border - Colour of the borders between countries.
 */
@customElement("lit-material-world-map")
export class LitMaterialWorldMap extends LitElement {
  static override styles = styles;

  /** Values by country code (case-insensitive). Non-finite and negative values are left out. */
  @property({ type: Object }) data: CountryValues = {};

  /** The map's accessible name, e.g. "Visitors by country". Unset, "World map", translated. */
  @property() label = "";

  /** A unit appended to values, e.g. "visitors". */
  @property() unit = "";

  /** Countries can be selected with a click, Enter or Space; fires `change`. */
  @property({ type: Boolean, reflect: true }) selectable = false;

  /** The selected country's code, or `""`. */
  @property() selected = "";

  /** Formats values. Default: the element's language, compact above 10,000. */
  @property({ attribute: false }) format?: (n: number) => string;

  private readonly localize = new LocalizeController(this);

  /** The country the readout shows, or `""`. */
  @state() private active = "";

  /** Where the readout sits, in percent of the map. */
  @state() private tipAt: { x: number; y: number } | null = null;

  private names?: Intl.DisplayNames | null;
  private namesLang = "";

  private countryName(code: string): string {
    const lang = this.localize.lang;
    if (this.names === undefined || this.namesLang !== lang) {
      this.namesLang = lang;
      try {
        this.names = new Intl.DisplayNames([lang, "en"], { type: "region" });
      } catch {
        this.names = null;
      }
    }
    try {
      return this.names?.of(code) ?? code;
    } catch {
      return code; // not a region code Intl knows
    }
  }

  /** Countries with a value, highest first. */
  private get entries(): Entry[] {
    const sums = new Map<string, number>();
    for (const [key, value] of Object.entries(this.data ?? {})) {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) continue;
      const code = key.trim().toUpperCase();
      if (!code) continue;
      sums.set(code, (sums.get(code) ?? 0) + value);
    }
    return [...sums]
      .map(([code, value]) => ({ code, value, name: this.countryName(code) }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }

  private formatValue(n: number): string {
    if (this.format) return this.format(n);
    return this.localize.number(n, Math.abs(n) >= 1e4 ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 2 });
  }

  private text(n: number): string {
    const value = this.formatValue(n);
    return this.unit ? this.localize.term("worldMap.valueWithUnit", "{value} {unit}", { value, unit: this.unit }) : value;
  }

  private readout(code: string, value: number | undefined): string {
    const name = this.countryName(code);
    return value === undefined
      ? this.localize.term("worldMap.nameNoData", "{name}: no data", { name })
      : this.localize.term("worldMap.nameValue", "{name}: {value}", { name, value: this.text(value) });
  }

  /** Shows the readout for `code`, over its shape when it has one. */
  private show(code: string): void {
    this.active = code;
    const path = this.renderRoot.querySelector<SVGPathElement>(`path[data-code="${code}"]`);
    const box = path?.getBBox?.();
    const [, , w, h] = VIEWBOX.split(" ").map(Number) as [number, number, number, number];
    this.tipAt = box ? { x: Math.min(88, Math.max(12, ((box.x + box.width / 2) / w) * 100)), y: (box.y / h) * 100 } : null;
  }

  private hide(): void {
    this.active = "";
    this.tipAt = null;
  }

  private pick(code: string, value: number | undefined): void {
    if (!this.selectable || value === undefined) return;
    const clear = this.selected === code;
    this.selected = clear ? "" : code;
    this.dispatchEvent(
      new CustomEvent<WorldMapChangeDetail>("change", { detail: { code: this.selected, value: clear ? null : value }, bubbles: true, composed: true }),
    );
  }

  private onKey(event: KeyboardEvent, entries: Entry[]): void {
    if (event.key === "Escape") {
      this.hide();
      return;
    }
    const at = entries.findIndex((e) => e.code === this.active);
    if ((event.key === "Enter" || event.key === " ") && at >= 0) {
      event.preventDefault();
      this.pick(entries[at]!.code, entries[at]!.value);
      return;
    }
    const rtl = isRtl(this);
    const next = (i: number) => Math.min(entries.length - 1, i + 1);
    const previous = (i: number) => (i < 0 ? entries.length - 1 : Math.max(0, i - 1));
    const moves: Record<string, (i: number) => number> = {
      ArrowDown: next,
      ArrowUp: previous,
      ArrowRight: rtl ? previous : next,
      ArrowLeft: rtl ? next : previous,
      Home: () => 0,
      End: () => entries.length - 1,
    };
    const move = moves[event.key];
    if (!move || entries.length === 0) return;
    event.preventDefault();
    this.show(entries[move(at)]!.code);
  }

  private renderCountry(code: string, d: string, values: Map<string, number>, max: number) {
    const value = values.get(code);
    const on = value !== undefined && value > 0;
    const classes = ["country", on ? "on" : "", code === this.active ? "active" : "", code === this.selected ? "selected" : ""].join(" ");
    return svg`<path
      d=${d}
      data-code=${code}
      class=${classes}
      style=${cssProps({ "--level": on ? `${level(value!, max)}%` : null })}
      @pointerenter=${() => this.show(code)}
      @click=${() => this.pick(code, value)}
    ></path>`;
  }

  override render() {
    const entries = this.entries;
    const name = this.label || this.localize.term("worldMap.worldMap", "World map");
    const values = new Map(entries.map((e) => [e.code, e.value]));
    const max = entries[0]?.value ?? 0;
    const elsewhere = entries.filter((e) => !(e.code in COUNTRIES));
    const sep = this.localize.term("worldMap.listSeparator", "; ");
    const summary = entries.length
      ? this.localize.term("worldMap.labelTop", "{label}. Highest: {top}", {
          label: name,
          top: entries
            .slice(0, SUMMARY_TOP)
            .map((e) => this.readout(e.code, e.value))
            .join(sep),
        })
      : this.localize.term("worldMap.nameNoData", "{name}: no data", { name });
    const readout = this.active ? this.readout(this.active, values.get(this.active)) : "";
    const status =
      readout && this.active === this.selected ? this.localize.term("worldMap.readoutSelected", "{readout}, selected", { readout }) : readout;
    const min = entries.filter((e) => e.value > 0).at(-1)?.value ?? 0;
    return html`
      <figure class="figure">
        <div
          class="frame"
          role="img"
          aria-label=${summary}
          tabindex="0"
          @keydown=${(e: KeyboardEvent) => this.onKey(e, entries)}
          @pointerleave=${() => this.hide()}
          @blur=${() => this.hide()}
        >
          <svg part="map" viewBox=${VIEWBOX} aria-hidden="true">
            ${Object.entries(COUNTRIES).map(([code, d]) => this.renderCountry(code, d, values, max))}
          </svg>
          ${this.active
            ? html`<div
                class="tooltip ${this.tipAt ? "" : "corner"}"
                part="tooltip"
                aria-hidden="true"
                style=${cssProps(this.tipAt ? { left: `${this.tipAt.x}%`, top: `${this.tipAt.y}%` } : {})}
              >${readout}</div>`
            : nothing}
        </div>
        ${max > 0
          ? html`<div class="legend" part="legend" aria-hidden="true">
              <span>${this.formatValue(min)}</span><span class="ramp"></span><span>${this.text(max)}</span>
            </div>`
          : nothing}
        ${elsewhere.length
          ? html`<div class="elsewhere" part="elsewhere">
              <span class="elsewhere-label">${this.localize.term("worldMap.notOnMap", "Not on the map")}</span>
              ${elsewhere.map((e) =>
                this.selectable
                  ? html`<button
                      type="button"
                      class="place"
                      aria-pressed=${e.code === this.selected ? "true" : "false"}
                      @click=${() => this.pick(e.code, e.value)}
                    >${this.readout(e.code, e.value)}</button>`
                  : html`<span class="place">${this.readout(e.code, e.value)}</span>`,
              )}
            </div>`
          : nothing}
      </figure>
      <span class="visually-hidden" role="status">${status}</span>
      ${entries.length
        ? html`<table class="visually-hidden">
            <caption>${name}</caption>
            <thead>
              <tr>
                <th scope="col">${this.localize.term("worldMap.country", "Country")}</th>
                <th scope="col">${this.unit
                  ? this.localize.term("worldMap.valueInUnit", "Value ({unit})", { unit: this.unit })
                  : this.localize.term("worldMap.value", "Value")}</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map((e) => html`<tr><th scope="row">${e.name}</th><td>${this.formatValue(e.value)}</td></tr>`)}
            </tbody>
          </table>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-world-map": LitMaterialWorldMap;
  }
}
