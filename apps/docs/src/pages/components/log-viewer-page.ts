import "@lit-material/log-viewer";
import "@lit-material/button";
import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import type { LitMaterialLogViewer } from "@lit-material/log-viewer";

const PATHS = ["/", "/api/orders", "/api/users/42", "/static/app.js", "/missing", "/api/checkout"];

function fakeLine(n: number): string {
  const status = n % 17 === 0 ? 500 : n % 7 === 0 ? 404 : 200;
  return `{"time":"${new Date().toISOString()}","method":"GET","path":"${PATHS[n % PATHS.length]}","status":${status},"bytes":${200 + ((n * 37) % 900)}}`;
}

@customElement("docs-log-viewer-page")
export class DocsLogViewerPage extends LitElement {
  static override styles = [pageStyles];

  @query("lit-material-log-viewer") private readonly log?: LitMaterialLogViewer;
  @state() private paused = false;
  private timer?: ReturnType<typeof setInterval>;
  private n = 0;

  override firstUpdated(): void {
    if (!this.log) return;
    this.log.highlight = (line) => (/"status":5\d\d/.test(line) ? "error" : /"status":4\d\d/.test(line) ? "warning" : null);
    this.log.lines = Array.from({ length: 20 }, () => fakeLine(this.n++));
    this.timer = setInterval(() => this.log?.appendLines(fakeLine(this.n++)), 700);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.timer);
  }

  override render() {
    return html`
      <h1>Log viewer</h1>
      <p>A monospace stream that follows the newest line while you're at the bottom. Scroll up to read; pause to hold new lines back.</p>
      <lit-material-log-viewer label="Demo access log" max-lines="500" ?paused=${this.paused}></lit-material-log-viewer>
      <p>
        <lit-material-button variant="outlined" @click=${() => (this.paused = !this.paused)}>${this.paused ? "Resume" : "Pause"}</lit-material-button>
      </p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-log-viewer-page": DocsLogViewerPage;
  }
}
