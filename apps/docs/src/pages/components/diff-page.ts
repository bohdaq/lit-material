import "@lit-material/diff";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const original = `server:
  port: 8080
  workers: 4
  log: info
routes:
  - path: /
    root: /var/www
  - path: /api
    proxy: http://127.0.0.1:9000`;
const modified = `server:
  port: 8443
  workers: 4
  log: info
  tls: auto
routes:
  - path: /
    root: /var/www
  - path: /api
    proxy: http://127.0.0.1:9001`;

const controls: PlaygroundControl[] = [
  { kind: "select", key: "mode", label: "Mode", options: ["unified", "split"], default: "unified" },
  { kind: "select", key: "context", label: "Context", options: ["1", "3", "-1"], default: "1" },
];

const preview = (s: PlaygroundState) =>
  html`<lit-material-diff mode=${s.mode as string} context=${s.context as string} label="Changes to rws.yaml" .original=${original} .modified=${modified}></lit-material-diff>`;
const markup = (s: PlaygroundState) => `<lit-material-diff mode="${s.mode}" context="${s.context}" label="Changes to rws.yaml"></lit-material-diff>
<script type="module">
  const diff = document.querySelector("lit-material-diff");
  diff.original = await (await fetch("/rws.yaml.orig")).text();
  diff.modified = await (await fetch("/rws.yaml")).text();
</script>`;

@customElement("docs-diff-page")
export class DocsDiffPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Diff</h1>
      <p>How a text changed, line by line, in one column or side by side. Unchanged runs fold down to a few lines of context, and a screen reader hears each line as added or removed.</p>
      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
      <section>
        <h2>Changes by path</h2>
        <p>For structured data, such as two JSON responses or two sets of headers, list what changed at each path instead of diffing lines.</p>
        <lit-material-change-list
          label="Changes to the response"
          .changes=${[
            { path: "$.status", kind: "changed", before: "pending", after: "ready" },
            { path: "$.replicas", kind: "changed", before: 1, after: 3 },
            { path: "$.endpoint", kind: "added", after: "https://api.example.com" },
            { path: "$.error", kind: "removed", before: "image pull failed" },
          ]}
        ></lit-material-change-list>
      </section>
      <section>
        <h2>Merge view</h2>
        <p>Two versions that both changed a common base, next to the base. Each one marks what it added or changed and counts what it dropped. Put actions for a version in its <code>side-&lt;index&gt;</code> slot.</p>
        <lit-material-merge-view
          base="2"
          .sides=${[
            { label: "Mine (this device)", text: "GET /users\nAccept: application/json\nX-Trace: on" },
            { label: "Theirs (the server)", text: "GET /users?page=2\nAccept: application/json" },
            { label: "Before both changes", text: "GET /users\nAccept: application/json" },
          ]}
        >
          <button slot="side-0">Keep mine</button>
          <button slot="side-1">Take theirs</button>
        </lit-material-merge-view>
      </section>
      <section>
        <h2>Conflict resolver</h2>
        <p>
          The same file changed on two devices. Each side marks the lines only it has; keep yours, theirs or both (a radio group), edit the
          result if needed, then <em>Use result</em> fires <code>resolve</code> with the text.
        </p>
        <lit-material-conflict-resolver
          yours-note="Priya · laptop · 10:12"
          theirs-note="Jonas · desktop · 10:31"
          yours=${"checks:\n  - status == 201\n  - schema: CreateOrderResponse\n  - time < 300ms"}
          theirs=${"checks:\n  - status == 201\n  - header Location exists\n  - time < 300ms"}
        ></lit-material-conflict-resolver>
      </section>
      <section>
        <h2>Without a DOM</h2>
        <p><code>diffLines</code>, <code>sideBySide</code>, <code>hunks</code> and <code>stats</code> work in Node and workers:</p>
        <pre tabindex="0"><code>import { diffLines, stats } from "@lit-material/diff/lines.js";

const { added, removed } = stats(diffLines(before, after));</code></pre>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-diff-page": DocsDiffPage;
  }
}
