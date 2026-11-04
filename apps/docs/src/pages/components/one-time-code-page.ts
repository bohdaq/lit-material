import "@lit-material/text-field/one-time-code.js";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "length", label: "Length", options: ["4", "6", "8"], default: "6" },
  { kind: "select", key: "group", label: "Group size", options: ["0", "3", "4"], default: "3" },
  { kind: "boolean", key: "alphanumeric", label: "Letters too", default: false },
];

const preview = (s: PlaygroundState) =>
  html`<lit-material-one-time-code label="Code from the email" length=${s.length as string} group-size=${s.group as string} ?alphanumeric=${Boolean(s.alphanumeric)}></lit-material-one-time-code>`;
const markup = (s: PlaygroundState) =>
  `<lit-material-one-time-code label="Code from the email" length="${s.length}" group-size="${s.group}"${s.alphanumeric ? " alphanumeric" : ""}></lit-material-one-time-code>`;

@customElement("docs-one-time-code-page")
export class DocsOneTimeCodePage extends LitElement {
  static override styles = [pageStyles];

  @state() private completed = "";

  override render() {
    return html`
      <h1>One-time code</h1>
      <p>The digits from a sign-in mail, an authenticator app or a text message. One native input sits under the boxes, so paste, deleting, the phone's code suggestion and screen readers work as in any field. Spaces and dashes in a pasted code are dropped, and <code>complete</code> fires when the last character is in.</p>
      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
      <section>
        <h2>Verify on complete</h2>
        <lit-material-one-time-code
          label="Authenticator code"
          group-size="3"
          @complete=${(e: CustomEvent<{ value: string }>) => (this.completed = `Checking ${e.detail.value}…`)}
        ></lit-material-one-time-code>
        <p role="status">${this.completed}</p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-one-time-code-page": DocsOneTimeCodePage;
  }
}
