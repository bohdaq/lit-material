import "@lit-material/icon";
import { registerIcons } from "@lit-material/icon";

// Material icons (Apache 2.0), as an app would import its set's SVG files.
registerIcons({
  home: '<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24"><path d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58-1.92-3.32-2.39.96a7 7 0 0 0-1.62-.94L14.88 3.6h-3.84l-.36 2.58a7 7 0 0 0-1.62.94l-2.39-.96-1.92 3.32 2.03 1.58a7.07 7.07 0 0 0 0 1.88l-2.03 1.58 1.92 3.32 2.39-.96c.5.38 1.04.7 1.62.94l.36 2.58h3.84l.36-2.58a7 7 0 0 0 1.62-.94l2.39.96 1.92-3.32zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>',
  delete: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
});
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "size", label: "Size", options: ["small", "medium", "large"], default: "medium" },
  {
    kind: "select",
    key: "color",
    label: "Color",
    options: ["inherit", "info", "success", "warning", "error"],
    default: "inherit",
  },
];

function preview(state: PlaygroundState) {
  return html`<lit-material-icon size=${state.size as string} color=${state.color as string}>★</lit-material-icon>`;
}

function markup(state: PlaygroundState): string {
  return `<lit-material-icon size="${state.size}" color="${state.color}">★</lit-material-icon>`;
}

@customElement("docs-icon-page")
export class DocsIconPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Icon</h1>
      <p>A consistent sizing/color wrapper for icon content — ships no icon set of its own.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section style="display: flex; gap: 16px; align-items: center;">
        <h2 style="width: 100%;">Sizes</h2>
        <lit-material-icon size="small">★</lit-material-icon>
        <lit-material-icon size="medium">★</lit-material-icon>
        <lit-material-icon size="large">★</lit-material-icon>
      </section>

      <section style="display: flex; gap: 16px; align-items: center; margin-top: 1rem;">
        <h2 style="width: 100%;">Colors</h2>
        <lit-material-icon color="info">●</lit-material-icon>
        <lit-material-icon color="success">●</lit-material-icon>
        <lit-material-icon color="warning">●</lit-material-icon>
        <lit-material-icon color="error">●</lit-material-icon>
      </section>

      <section style="margin-top: 1rem;">
        <h2>Labeled (meaningful, not decorative)</h2>
        <lit-material-icon label="Verified" color="success" size="large">✓</lit-material-icon>
      </section>

      <section>
        <h2>By name</h2>
        <p>Register a set once with <code>registerIcons()</code>, then use <code>name</code>.</p>
        <div style="display: flex; gap: 16px; align-items: center;">
          <lit-material-icon name="home"></lit-material-icon>
          <lit-material-icon name="settings" color="info"></lit-material-icon>
          <lit-material-icon name="delete" size="large" color="error" label="Delete"></lit-material-icon>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-icon-page": DocsIconPage;
  }
}
