import "@lit-material/avatar";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

// A small self-contained SVG data URI so the demo doesn't depend on network access.
const sampleImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#6750a4"/><circle cx="40" cy="32" r="16" fill="#fffbfe"/><circle cx="40" cy="80" r="28" fill="#fffbfe"/></svg>',
  );

const controls: PlaygroundControl[] = [
  { kind: "select", key: "kind", label: "Content", options: ["image", "initials", "icon"], default: "image" },
  { kind: "select", key: "size", label: "Size", options: ["small", "medium", "large"], default: "medium" },
  { kind: "select", key: "shape", label: "Shape", options: ["circle", "square"], default: "circle" },
];

function preview(state: PlaygroundState) {
  const size = state.size as string;
  const shape = state.shape as string;
  if (state.kind === "initials") {
    return html`<lit-material-avatar initials="JD" alt="Jane Doe" size=${size} shape=${shape}></lit-material-avatar>`;
  }
  if (state.kind === "icon") {
    return html`<lit-material-avatar alt="Jane Doe" size=${size} shape=${shape}></lit-material-avatar>`;
  }
  return html`<lit-material-avatar src=${sampleImage} alt="Jane Doe" size=${size} shape=${shape}></lit-material-avatar>`;
}

function markup(state: PlaygroundState): string {
  const attrs = [`size="${state.size}"`, `shape="${state.shape}"`].join(" ");
  if (state.kind === "initials") return `<lit-material-avatar initials="JD" alt="Jane Doe" ${attrs}></lit-material-avatar>`;
  if (state.kind === "icon") return `<lit-material-avatar alt="Jane Doe" ${attrs}></lit-material-avatar>`;
  return `<lit-material-avatar src="/jane.jpg" alt="Jane Doe" ${attrs}></lit-material-avatar>`;
}

@customElement("docs-avatar-page")
export class DocsAvatarPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Avatar</h1>
      <p>An image, falling back to initials, falling back to an icon.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>All three states, all three sizes</h2>
        <div style="display: flex; align-items: center; gap: 16px;">
          <lit-material-avatar src=${sampleImage} alt="Jane Doe" size="small"></lit-material-avatar>
          <lit-material-avatar src=${sampleImage} alt="Jane Doe" size="medium"></lit-material-avatar>
          <lit-material-avatar src=${sampleImage} alt="Jane Doe" size="large"></lit-material-avatar>
          <lit-material-avatar initials="JD" alt="Jane Doe" size="small"></lit-material-avatar>
          <lit-material-avatar initials="JD" alt="Jane Doe" size="medium"></lit-material-avatar>
          <lit-material-avatar initials="JD" alt="Jane Doe" size="large"></lit-material-avatar>
          <lit-material-avatar alt="Jane Doe" size="small"></lit-material-avatar>
          <lit-material-avatar alt="Jane Doe" size="medium"></lit-material-avatar>
          <lit-material-avatar alt="Jane Doe" size="large"></lit-material-avatar>
        </div>
      </section>

      <section>
        <h2>Broken image, falls back to initials</h2>
        <lit-material-avatar src="/does-not-exist.jpg" initials="JD" alt="Jane Doe"></lit-material-avatar>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-avatar-page": DocsAvatarPage;
  }
}
