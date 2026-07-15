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
      <div class="eyebrow">App shell · @lit-material/task</div>
      <h1>Task</h1>
      <p class="lede">
        A dependency-free reactive controller for async work (typically data fetching) tied to a Lit host's
        own reactive properties — the same shape as
        <a href="https://www.npmjs.com/package/@lit-labs/task" target="_blank">@lit-labs/task</a>, hand-rolled
        without the dependency: the <code>labs</code> package is unstable API, and the actual need here —
        re-run an async function when its arguments change, track pending/complete/error, cancel a superseded
        run — doesn't need most of what a full task-queue implementation ships.
      </p>

      <section class="doc-section">
        <h2>Install</h2>
        <pre><code>npm install @lit-material/task</code></pre>
      </section>

      <section class="doc-section">
        <h2>Usage</h2>
        <pre><code>${usageCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>API</h2>
        <p><code>new TaskController(host, { task, args, autoRun? })</code>:</p>
        <ul>
          <li>
            <code>task: (args, signal) => Promise&lt;R&gt;</code> — the async work. Receives an
            <code>AbortSignal</code> that fires if a newer run supersedes this one before it resolves.
          </li>
          <li>
            <code>args: () => T</code> — read the host's current reactive properties into the task's
            arguments. Checked before every render; a new run starts automatically whenever this returns a
            shallowly different value.
          </li>
          <li><code>autoRun</code> (default <code>true</code>) — set <code>false</code> to only ever run via an explicit <code>.run()</code> call.</li>
        </ul>
        <p>
          Properties: <code>status</code> (<code>"initial" | "pending" | "complete" | "error"</code>),
          <code>value</code>, <code>error</code>. Methods: <code>run(args?)</code> (runs now regardless of
          <code>autoRun</code>/whether <code>args</code> changed — aborts anything already in flight),
          <code>render({ initial?, pending?, complete?, error? })</code> (picks the matching callback for the
          current <code>status</code>).
        </p>
        <p>
          A newer run always aborts the previous one via the signal passed to <code>task</code>, and a stale
          run's result/error is discarded even if it resolves after a newer one already has — no
          out-of-order flicker if responses arrive out of sequence.
        </p>
      </section>

      <section class="doc-section">
        <h2>SSR</h2>
        <p>
          A <code>TaskController</code> never runs its task during <code>@lit-labs/ssr</code>: SSR drives
          <code>willUpdate()</code>/<code>update()</code>/<code>render()</code> directly but never invokes
          reactive controllers' <code>hostUpdate()</code> — the hook <code>autoRun</code> relies on to start a
          task before the host's first render. So a server-rendered host is always frozen in the
          <code>"initial"</code> status; the real run only starts once the client hydrates. Render an
          <code>initial</code> state that makes sense pre-hydration (e.g. the same as <code>pending</code>).
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
