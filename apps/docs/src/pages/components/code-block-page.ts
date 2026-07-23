import "@lit-material/code-block";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const SNIPPET = `export function add(a: number, b: number): number {
  return a + b;
}`;

const LONG_SNIPPET = Array.from({ length: 12 }, (_, i) => `console.log("line ${i + 1}");`).join("\n");

const controls: PlaygroundControl[] = [
  { kind: "text", key: "label", label: "Label", default: "index.ts" },
  { kind: "boolean", key: "copyable", label: "Copyable", default: true },
];

function preview(state: PlaygroundState) {
  // No whitespace/newlines around ${SNIPPET}: <pre> preserves it verbatim,
  // so any indentation or blank lines from this template's own formatting
  // would show up as part of the displayed code.
  return html`<lit-material-code-block
    label=${state.label as string}
    ?copyable=${state.copyable as boolean}
    style="width: 420px;"
    >${SNIPPET}</lit-material-code-block
  >`;
}

function markup(state: PlaygroundState): string {
  const attrs = [`label="${state.label}"`, state.copyable ? null : "copyable=\"false\""].filter(Boolean).join(" ");
  return `<lit-material-code-block ${attrs}>\n  ${SNIPPET.replace(/\n/g, "\n  ")}\n</lit-material-code-block>`;
}

@customElement("docs-code-block-page")
export class DocsCodeBlockPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Code Block</h1>
      <p>A monospace container for a block of source code, with a copy button and optional truncation.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Expandable</h2>
        <lit-material-code-block label="log.ts" expandable style="width: 420px;">${LONG_SNIPPET}</lit-material-code-block>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-code-block-page": DocsCodeBlockPage;
  }
}
