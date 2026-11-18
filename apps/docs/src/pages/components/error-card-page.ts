import "@lit-material/error-card";
import "@lit-material/button";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const RAW = "error sending request for url (https://api.example.test/v1/orders): client error (Connect): tcp connect error: Connection refused (os error 111)";

const controls: PlaygroundControl[] = [
  { kind: "text", key: "headline", label: "Headline", default: "Connection refused" },
  { kind: "text", key: "body", label: "Next step", default: "Nothing answered on that port: is the server running, and is the port right?" },
  { kind: "select", key: "variant", label: "Variant", options: ["error", "warning"], default: "error" },
  { kind: "boolean", key: "details", label: "Details", default: true },
  { kind: "boolean", key: "action", label: "Action", default: true },
];

const preview = (s: PlaygroundState) => html`<lit-material-error-card
  headline=${s.headline as string}
  variant=${s.variant as string}
  details=${s.details ? RAW : ""}
>
  ${s.body}
  ${s.action ? html`<lit-material-button slot="actions" variant="tonal">Try again</lit-material-button>` : ""}
</lit-material-error-card>`;

const markup = (s: PlaygroundState) =>
  `<lit-material-error-card headline="${s.headline}"${s.variant === "warning" ? ' variant="warning"' : ""}${s.details ? `\n  details="${RAW}"` : ""}>\n  ${s.body}${s.action ? `\n  <lit-material-button slot="actions" variant="tonal">Try again</lit-material-button>` : ""}\n</lit-material-error-card>`;

@customElement("docs-error-card-page")
export class DocsErrorCardPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Error card</h1>
      <p>
        A failure explained: a short headline, what to try next, actions, and the raw error under a collapsible Details block
        with a copy button. Add <code>alert</code> when the card appears in answer to what someone just did.
      </p>
      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section style="display: block;">
        <h2>Warning, open details</h2>
        <lit-material-error-card
          variant="warning"
          open
          headline="Saved, but 2 of 14 tests were skipped"
          details=${"skipped: tests/payments.yaml › refund over limit (needs STRIPE_KEY)\nskipped: tests/payments.yaml › refund twice (needs STRIPE_KEY)"}
        >
          Set <code>STRIPE_KEY</code> in the environment to run them.
        </lit-material-error-card>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-error-card-page": DocsErrorCardPage;
  }
}
