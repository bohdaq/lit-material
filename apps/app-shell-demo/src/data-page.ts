import "@lit-material/button";
import "@lit-material/card";
import "@lit-material/progress";
import { TaskController } from "@lit-material/task";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

interface FakeUser {
  name: string;
  bio: string;
}

// A tuple (not `Record<number, FakeUser>`) keeps every entry non-optional under
// `noUncheckedIndexedAccess` as long as it's only ever indexed by a `UserIndex`.
const fakeUsers: readonly [FakeUser, FakeUser, FakeUser] = [
  { name: "Ada", bio: "Writes the first program before there's a computer to run it on." },
  { name: "Grace", bio: "Debugs a relay, coins the word for it." },
  { name: "Margaret", bio: "Names it software engineering before anyone else does." },
];

type UserIndex = 0 | 1 | 2;

// There's no real backend for this demo to call — a setTimeout-based fake stands in for
// `fetch()`, but still honors the AbortSignal, which is the actual thing worth demonstrating:
// clicking "Next user" fast enough aborts the in-flight fetch instead of racing it.
function fetchFakeUser(id: UserIndex, signal: AbortSignal): Promise<FakeUser> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(fakeUsers[id]), 600);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

@customElement("demo-data-page")
export class DemoDataPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .controls {
      margin: 1rem 0;
    }
    .result {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-height: 3rem;
    }
    lit-material-card.result-card {
      margin-top: 1rem;
    }
  `;

  @state() private userIndex: UserIndex = 0;

  private readonly userTask = new TaskController(this, {
    task: ([index], signal) => fetchFakeUser(index, signal),
    args: () => [this.userIndex] as const,
  });

  override render() {
    return html`
      <lit-material-card variant="elevated">
        <h1>Data fetching</h1>
        <p>
          Backed by <code>@lit-material/task</code>'s <code>TaskController</code>. Click "Next user" a couple
          of times quickly — each click aborts the previous, still-pending fetch, so the result you see
          always matches the last user you asked for, never a stale one that happened to resolve out of
          order.
        </p>
        <div class="controls">
          <lit-material-button variant="outlined" @click=${this.nextUser}>Next user →</lit-material-button>
        </div>
        ${this.userTask.render({
          pending: () => html`
            <div class="result">
              <lit-material-circular-progress indeterminate size="28" aria-label="Loading"></lit-material-circular-progress>
              <span>Loading…</span>
            </div>
          `,
          complete: (user) => html`
            <lit-material-card class="result-card" variant="filled">
              <strong>${user.name}</strong>
              <p>${user.bio}</p>
            </lit-material-card>
          `,
          error: () => html`<p>Couldn't load that user.</p>`,
        })}
      </lit-material-card>
    `;
  }

  private readonly nextUser = (): void => {
    this.userIndex = (((this.userIndex + 1) % 3) as UserIndex);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-data-page": DemoDataPage;
  }
}
