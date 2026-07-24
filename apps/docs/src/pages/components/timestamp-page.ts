import "@lit-material/timestamp";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const SAMPLE_DATE = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

const controls: PlaygroundControl[] = [
  {
    kind: "select",
    key: "dateFormat",
    label: "Date format",
    options: ["full", "long", "medium", "short", "none"],
    default: "medium",
  },
  {
    kind: "select",
    key: "timeFormat",
    label: "Time format",
    options: ["full", "long", "medium", "short", "none"],
    default: "none",
  },
  { kind: "boolean", key: "relative", label: "Relative", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-timestamp
      date=${SAMPLE_DATE}
      date-format=${state.dateFormat as string}
      time-format=${state.timeFormat as string}
      ?relative=${state.relative as boolean}
    ></lit-material-timestamp>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [
    `date="${SAMPLE_DATE}"`,
    `date-format="${state.dateFormat}"`,
    `time-format="${state.timeFormat}"`,
    state.relative ? "relative" : null,
  ]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-timestamp ${attrs}></lit-material-timestamp>`;
}

@customElement("docs-timestamp-page")
export class DocsTimestampPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Timestamp</h1>
      <p>A date/time display built on the native <code>&lt;time&gt;</code> element, absolute or live-updating relative.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Fallback content</h2>
        <lit-material-timestamp>Unknown date</lit-material-timestamp>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-timestamp-page": DocsTimestampPage;
  }
}
