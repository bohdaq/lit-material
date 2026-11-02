import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import { guidePageStyles } from "../../styles/guide-page-styles.js";

const usageCode = [
  'import { TaskController } from "@lit-material/task";',
  'import { LitElement, html } from "lit";',
  'import { customElement, property } from "lit/decorators.js";',
  "",
  '@customElement("user-profile")',
  "class UserProfile extends LitElement {",
  "  @property() userId!: string;",
  "",
  "  private readonly userTask = new TaskController(this, {",
  "    task: ([id], signal) => fetch(`/api/users/${id}`, { signal }).then((r) => r.json()),",
  "    args: () => [this.userId] as const,",
  "  });",
  "",
  "  override render() {",
  "    return this.userTask.render({",
  "      pending: () => html`Loading…`,",
  "      complete: (user) => html`${user.name}`,",
  "      error: (e) => html`Error: ${String(e)}`,",
  "    });",
  "  }",
  "}",
].join("\n");

@customElement("docs-task-page")
export class DocsTaskPage extends LitElement {
  static override styles = [pageStyles, guidePageStyles];

  override render() {
    return html`
      <div class="eyebrow">App shell · <code>@lit-material/task</code></div>
      <h1>Task</h1>
      <p class="lede">
        A reactive controller with no dependencies for async work (usually data fetching) tied to a Lit
        host's own reactive properties. It has the same shape as
        <a href="https://www.npmjs.com/package/@lit-labs/task" target="_blank"><code>@lit-labs/task</code></a>,
        written without that dependency: the <code>labs</code> package's API isn't stable, and the actual need
        here (run an async function again when its arguments change, track pending, complete and error,
        cancel a run a newer one replaced) doesn't need most of what a full task queue ships.
      </p>

      <section class="doc-section">
        <h2>Install</h2>
        <pre tabindex="0"><code>npm install @lit-material/task</code></pre>
      </section>

      <section class="doc-section">
        <h2>Usage</h2>
        <pre tabindex="0"><code>${usageCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>API</h2>
        <p><code>new TaskController(host, { task, args, autoRun? })</code>:</p>
        <ul>
          <li>
            <code>task: (args, signal) => Promise&lt;R&gt;</code>: the async work. Receives an
            <code>AbortSignal</code> that fires if a newer run replaces this one before it resolves.
          </li>
          <li>
            <code>args: () => T</code>: reads the host's current reactive properties into the task's
            arguments. Checked before every render; a new run starts by itself whenever this returns a value
            that differs at the top level.
          </li>
          <li><code>autoRun</code> (default <code>true</code>): set <code>false</code> to run only when you call <code>.run()</code>.</li>
        </ul>
        <p>
          Properties: <code>status</code> (<code>"initial" | "pending" | "complete" | "error"</code>),
          <code>value</code>, <code>error</code>. Methods: <code>run(args?)</code> (runs now, whatever
          <code>autoRun</code> says and whether or not <code>args</code> changed, and aborts any run in flight),
          <code>render({ initial?, pending?, complete?, error? })</code> (picks the matching callback for the
          current <code>status</code>).
        </p>
        <p>
          A newer run always aborts the previous one through the signal passed to <code>task</code>, and an
          old run's result or error is dropped even if it arrives after a newer one has resolved, so responses
          arriving out of order cause no flicker.
        </p>
      </section>

      <section class="doc-section">
        <h2>SSR</h2>
        <p>
          A <code>TaskController</code> never runs its task during <code>@lit-labs/ssr</code>: SSR drives
          <code>willUpdate()</code>/<code>update()</code>/<code>render()</code> directly but never invokes
          reactive controllers' <code>hostUpdate()</code>, the hook <code>autoRun</code> relies on to start a
          task before the host's first render. So a host rendered on the server always stays in the
          <code>"initial"</code> status; the real run starts once the browser hydrates it. Render an
          <code>initial</code> state that makes sense before hydration (for example the same as
          <code>pending</code>).
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-task-page": DocsTaskPage;
  }
}
