import "@lit-material/button";
import "@lit-material/card";
import "@lit-material/chip";
import "@lit-material/switch";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../styles/page-styles.js";
import { ALL_TOKENS, colorSchemeFromSeed, type ColorScheme } from "../theme/color-scheme.js";
import { copyCss } from "../theme/copy-css.js";

const DEFAULT_SEED = "#6750a4";
const MODES = ["light", "dark"] as const;
type Mode = (typeof MODES)[number];

@customElement("docs-theme-page")
export class DocsThemePage extends LitElement {
  static override styles = [
    pageStyles,
    css`
      :host {
        max-width: 900px;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        margin-bottom: 2rem;
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 14px;
        background: color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 60%, transparent);
      }
      .swatch-input {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .swatch-input span {
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--md-sys-color-on-surface-variant);
      }
      input[type="color"] {
        appearance: none;
        width: 34px;
        height: 34px;
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 10px;
        padding: 3px;
        background: none;
        cursor: pointer;
      }
      input[type="color"]::-webkit-color-swatch {
        border-radius: 7px;
        border: none;
      }

      .panels {
        display: flex;
        gap: 1.25rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
      }
      .panel {
        flex: 1;
        min-width: 320px;
        border-radius: 14px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: var(--panel-surface);
        color: var(--panel-on-surface);
        border: 1px solid var(--panel-outline-variant);
      }
      .panel .mode-label {
        font-family: "JetBrains Mono", ui-monospace, monospace;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        opacity: 0.6;
      }
      .row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        align-items: center;
      }
      .swatches {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }
      .swatch {
        width: 26px;
        height: 26px;
        border-radius: 7px;
        border: 1px solid rgba(128, 128, 128, 0.3);
      }
    `,
  ];

  @state()
  private seed = DEFAULT_SEED;

  @state()
  private copied = false;

  private readonly handleSeedChange = (event: Event): void => {
    this.seed = (event.target as HTMLInputElement).value;
    this.copied = false;
  };

  private readonly handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(copyCss(colorSchemeFromSeed(this.seed)));
    this.copied = true;
  };

  private panelStyle(scheme: ColorScheme, mode: Mode): string {
    const base = ALL_TOKENS.map((token) => `--md-sys-color-${token}: ${scheme[token][mode]}`).join("; ");
    return `--panel-surface: ${scheme.surface[mode]}; --panel-on-surface: ${scheme["on-surface"][mode]}; --panel-outline-variant: ${scheme["outline-variant"][mode]}; ${base}`;
  }

  override render() {
    const scheme = colorSchemeFromSeed(this.seed);
    return html`
      <h1>Theme builder</h1>
      <p>
        Pick a seed color to generate a full MD3 tonal color scheme — via
        <a href="https://www.npmjs.com/package/@material/material-color-utilities" target="_blank"
          >@material/material-color-utilities</a
        >, Google's own HCT/tonal-palette library, not hand-rolled color math — preview it against a few
        components, then copy a drop-in CSS override matching <code>@lit-material/tokens</code>' exact
        property names.
      </p>

      <div class="toolbar">
        <div class="swatch-input">
          <span>Seed</span>
          <input type="color" .value=${this.seed} @input=${this.handleSeedChange} />
        </div>
        <lit-material-button variant="filled" @click=${this.handleCopy}>
          ${this.copied ? "Copied!" : "Copy CSS"}
        </lit-material-button>
      </div>

      <div class="panels">
        ${MODES.map(
          (mode) => html`
            <div class="panel" style=${this.panelStyle(scheme, mode)}>
              <div class="mode-label">${mode}</div>
              <div class="row">
                <lit-material-button variant="filled">Filled</lit-material-button>
                <lit-material-button variant="outlined">Outlined</lit-material-button>
                <lit-material-chip>Chip</lit-material-chip>
                <lit-material-switch checked></lit-material-switch>
              </div>
              <lit-material-card variant="filled" style="width: 220px;">
                <strong>Card</strong>
                <p>Preview text on a card surface.</p>
              </lit-material-card>
              <div class="swatches">
                ${ALL_TOKENS.map(
                  (token) =>
                    html`<div class="swatch" style=${`background: ${scheme[token][mode]}`} title=${token}></div>`,
                )}
              </div>
            </div>
          `,
        )}
      </div>

      <h2>Generated CSS</h2>
      <pre>${copyCss(scheme)}</pre>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-theme-page": DocsThemePage;
  }
}
