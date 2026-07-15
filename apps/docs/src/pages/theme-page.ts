import "@lit-material/button";
import "@lit-material/card";
import "@lit-material/chip";
import "@lit-material/switch";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ALL_TOKENS, colorSchemeFromSeed, type ColorScheme } from "../theme/color-scheme.js";
import { copyCss } from "../theme/copy-css.js";

const DEFAULT_SEED = "#6750a4";
const MODES = ["light", "dark"] as const;
type Mode = (typeof MODES)[number];

@customElement("docs-theme-page")
export class DocsThemePage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      max-width: 900px;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .controls label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .panels {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }
    .panel {
      flex: 1;
      min-width: 320px;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--panel-surface);
      color: var(--panel-on-surface);
      border: 1px solid var(--panel-outline-variant);
    }
    .panel h3 {
      margin: 0;
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
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid rgba(128, 128, 128, 0.3);
    }
    pre {
      background: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
  `;

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

      <div class="controls">
        <label>
          Seed color
          <input type="color" .value=${this.seed} @input=${this.handleSeedChange} />
        </label>
        <lit-material-button variant="filled" @click=${this.handleCopy}>
          ${this.copied ? "Copied!" : "Copy CSS"}
        </lit-material-button>
      </div>

      <div class="panels">
        ${MODES.map(
          (mode) => html`
            <div class="panel" style=${this.panelStyle(scheme, mode)}>
              <h3>${mode === "light" ? "Light" : "Dark"}</h3>
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
