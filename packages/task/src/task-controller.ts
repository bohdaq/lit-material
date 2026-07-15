import type { ReactiveController, ReactiveControllerHost } from "lit";

export type TaskStatus = "initial" | "pending" | "complete" | "error";

export interface TaskConfig<T extends readonly unknown[], R> {
  /** The async work itself. Receives an `AbortSignal` that fires if a newer run supersedes this one. */
  task: (args: T, signal: AbortSignal) => Promise<R>;
  /** Read the host's current reactive properties into the task's arguments, checked before every render. */
  args: () => T;
  /** Set to `false` to only ever run via an explicit `.run()` call, ignoring `args` changes. Default `true`. */
  autoRun?: boolean;
}

export interface TaskRenderers<R> {
  initial?: () => unknown;
  pending?: () => unknown;
  complete?: (value: R) => unknown;
  error?: (error: unknown) => unknown;
}

/**
 * A reactive controller for async work (typically data fetching) whose
 * inputs are a Lit host's own reactive properties — the same shape as
 * `@lit-labs/task`, hand-rolled dependency-free (the same reasoning
 * `@lit-material/router` gives for not depending on `@lit-labs/router`:
 * the labs package is unstable API, and the actual need here — re-run an
 * async function when its arguments change, track pending/complete/error,
 * cancel a superseded run — doesn't need most of what it ships).
 *
 * Re-runs `task` automatically whenever `args()` returns a value that's
 * shallowly different from last time, checked in `hostUpdate()` (before the
 * host's own render) — matching `@lit-labs/task`'s actual timing. A newer
 * run aborts the previous one via the `AbortSignal` passed to `task`, and a
 * stale run's result/error is discarded even if it resolves after a newer
 * one already has (no out-of-order flicker).
 *
 * Doesn't run at all under `@lit-labs/ssr`: it drives `willUpdate()`/
 * `update()`/`render()` directly but never invokes reactive controllers'
 * `hostUpdate()`, so a server-rendered host is always frozen in `"initial"`
 * status — the real run only starts once the client hydrates. There's no
 * way around this either way, since Lit SSR is a single synchronous pass
 * that can't await an in-flight promise.
 *
 * @example
 * ```ts
 * class UserProfile extends LitElement {
 *   @property() userId!: string;
 *
 *   private readonly userTask = new TaskController(this, {
 *     task: ([id], signal) => fetch(`/api/users/${id}`, { signal }).then((r) => r.json()),
 *     args: () => [this.userId] as const,
 *   });
 *
 *   override render() {
 *     return this.userTask.render({
 *       pending: () => html`Loading…`,
 *       complete: (user) => html`${user.name}`,
 *       error: (e) => html`Error: ${String(e)}`,
 *     });
 *   }
 * }
 * ```
 */
export class TaskController<T extends readonly unknown[], R> implements ReactiveController {
  status: TaskStatus = "initial";
  value?: R;
  error?: unknown;

  private readonly host: ReactiveControllerHost;
  private readonly taskFn: (args: T, signal: AbortSignal) => Promise<R>;
  private readonly argsFn: () => T;
  private readonly autoRun: boolean;
  private previousArgs?: T;
  private abortController?: AbortController;
  private callId = 0;

  constructor(host: ReactiveControllerHost, config: TaskConfig<T, R>) {
    this.host = host;
    this.taskFn = config.task;
    this.argsFn = config.args;
    this.autoRun = config.autoRun ?? true;
    host.addController(this);
  }

  hostUpdate(): void {
    if (!this.autoRun) return;
    const args = this.argsFn();
    if (this.previousArgs && argsEqual(this.previousArgs, args)) return;
    this.previousArgs = args;
    this.run(args);
  }

  hostDisconnected(): void {
    this.abortController?.abort();
  }

  /** Runs the task now, regardless of `autoRun` or whether `args` changed. Aborts any run already in flight. */
  run(args: T = this.argsFn()): void {
    this.abortController?.abort();
    const abortController = new AbortController();
    this.abortController = abortController;
    const callId = ++this.callId;

    this.status = "pending";
    this.host.requestUpdate();

    this.taskFn(args, abortController.signal).then(
      (value) => {
        if (callId !== this.callId) return; // superseded by a newer run
        this.status = "complete";
        this.value = value;
        this.error = undefined;
        this.host.requestUpdate();
      },
      (error: unknown) => {
        if (callId !== this.callId) return;
        if (abortController.signal.aborted) return; // our own cancellation, not a real failure
        this.status = "error";
        this.error = error;
        this.host.requestUpdate();
      },
    );
  }

  /** Picks the renderer matching the current `status`, `@lit-labs/task`-style. */
  render(renderers: TaskRenderers<R>): unknown {
    switch (this.status) {
      case "initial":
        return renderers.initial?.();
      case "pending":
        return renderers.pending?.();
      case "complete":
        return renderers.complete?.(this.value as R);
      case "error":
        return renderers.error?.(this.error);
    }
  }
}

function argsEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
}
