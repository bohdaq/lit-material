import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
    --fill: var(--lit-material-world-map-fill, var(--lit-material-chart-series-1, light-dark(#2a78d6, #3987e5)));
    --empty: var(--lit-material-world-map-empty, var(--md-sys-color-surface-container-highest, light-dark(#e6e0e9, #36343b)));
    --border: var(--lit-material-world-map-border, var(--md-sys-color-surface, light-dark(#fef7ff, #141218)));
    --muted: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    --focus: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
  }

  :host([hidden]) {
    display: none;
  }

  .figure {
    margin: 0;
    display: grid;
    gap: 8px;
  }

  .frame {
    position: relative;
    border-radius: 4px;
  }
  .frame:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 4px;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .country {
    fill: var(--empty);
    stroke: var(--border);
    stroke-width: 0.5;
    stroke-linejoin: round;
  }
  .country.on {
    fill: color-mix(in oklab, var(--fill) var(--level), var(--empty));
  }
  :host([selectable]) .country.on {
    cursor: pointer;
  }
  .country.active,
  .country.selected {
    stroke: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    stroke-width: 1.5;
  }
  .country.selected {
    stroke: var(--focus);
    stroke-width: 2;
  }

  .tooltip {
    position: absolute;
    transform: translate(-50%, calc(-100% - 6px));
    pointer-events: none;
    padding: 6px 8px;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background: var(--md-sys-color-inverse-surface, light-dark(#322f35, #e6e0e9));
    color: var(--md-sys-color-inverse-on-surface, light-dark(#f5eff7, #322f35));
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .tooltip.corner {
    inset-block-start: 0;
    inset-inline-start: 0;
    transform: none;
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .ramp {
    flex: 0 1 160px;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(
      to right,
      color-mix(in oklab, var(--fill) 18%, var(--empty)),
      color-mix(in oklab, var(--fill) 90%, var(--empty))
    );
  }
  :host(:dir(rtl)) .ramp {
    transform: scaleX(-1);
  }

  .elsewhere {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    color: var(--muted);
  }
  .elsewhere-label {
    font-weight: 600;
  }
  .place {
    font: inherit;
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-variant-numeric: tabular-nums;
  }
  button.place {
    min-height: 24px;
    padding: 0 8px;
    border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background: transparent;
    cursor: pointer;
  }
  button.place[aria-pressed="true"] {
    border-color: var(--focus);
    background: color-mix(in oklab, var(--focus) 12%, transparent);
  }
  button.place:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (forced-colors: active) {
    .country {
      fill: Canvas;
      stroke: CanvasText;
    }
    .country.on {
      /* No colour scale in forced colours: shaded or not, values are in the readout and the table. */
      fill: GrayText;
    }
    .country.selected {
      fill: Highlight;
      fill-opacity: 1;
    }
    .ramp {
      background: CanvasText;
    }
  }
`;
