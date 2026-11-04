import type { ReactiveController, ReactiveControllerHost } from "lit";
import { taskCache, type TaskCache, type TaskKey } from "./cache.js";

export type TaskStatus = "initial" | "pending" | "complete" | "error";

export interface TaskConfig<T extends readonly unknown[], R> {
  /** The async work itself. Receives an `AbortSignal` that fires if a newer run supersedes this one. */
  task: (args: T, signal: AbortSignal) => Promise<R>;
  /** Read the host's current reactive properties into the task's arguments, checked before every render. */
  args: () => T;
  /** Set to `false` to only ever run via an explicit `.run()` call, ignoring `args` changes. Default `true`. */
  autoRun?: boolean;
  /**
   * Turns on caching: results are stored under this key in `cache`, shown at once by every controller with
   * the same key (stale-while-revalidate), and concurrent runs for one key share a single request.
   */
  key?: (args: T) => TaskKey;
  /** Where keyed results live. Default: the shared `taskCache`. */
  cache?: TaskCache;
  /** How long (ms) a cached result counts as fresh: a run within it shows the cache and fetches nothing. Default `0`. */
  staleTime?: number;
  /**
   * Retries after a failure: a number of attempts, or a function deciding from the failure count and error.
   * Aborted runs never retry. Default `0`.
   */
  retry?: number | ((failures: number, error: unknown) => boolean);
  /** Wait (ms) before retry number `attempt` (1, 2, …). Default: 1 s, doubling, at most 30 s. */
  retryDelay?: number | ((attempt: number, error: unknown) => number);
  /** Fetch again (if stale) when the window regains focus. Default `false`. */
  refetchOnFocus?: boolean;
  /** Fetch again (if stale) when the browser comes back online. Default `false`. */
  refetchOnReconnect?: boolean;
  /** Fetch again every this many ms while connected and the page is visible. */
  refetchInterval?: number;
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
  /** `true` while a background fetch runs behind a value already shown (status stays `"complete"`). */
  refreshing = false;
  /** When `value` was fetched (ms since epoch). */
  updatedAt?: number;

  private readonly host: ReactiveControllerHost;
  private readonly config: TaskConfig<T, R>;
  private readonly autoRun: boolean;
  private previousArgs?: T;
  private abortController?: AbortController;
  private callId = 0;
  private unsubscribe?: () => void;
  private subscribedKey?: string;
  private interval?: ReturnType<typeof setInterval>;
  private connected = false;

  constructor(host: ReactiveControllerHost, config: TaskConfig<T, R>) {
    this.host = host;
    this.config = config;
    this.autoRun = config.autoRun ?? true;
    host.addController(this);
  }

  private get cache(): TaskCache {
    return this.config.cache ?? taskCache;
  }

  hostConnected(): void {
    this.connected = true;
    if (typeof window === "undefined") return;
    if (this.config.refetchOnFocus) {
      window.addEventListener("focus", this.revalidate);
      document.addEventListener("visibilitychange", this.handleVisibility);
    }
    if (this.config.refetchOnReconnect) window.addEventListener("online", this.revalidate);
    if (this.config.refetchInterval) {
      this.interval = setInterval(() => {
        if (document.visibilityState !== "hidden" && this.previousArgs) this.run(this.previousArgs, { force: true });
      }, this.config.refetchInterval);
    }
    // Reconnected after a disconnect aborted the last run: pick it up again.
    if (this.previousArgs && this.status === "pending") this.run(this.previousArgs);
  }

  hostUpdate(): void {
    if (!this.autoRun) return;
    const args = this.config.args();
    if (this.previousArgs && argsEqual(this.previousArgs, args)) return;
    this.previousArgs = args;
    this.run(args);
  }

  hostDisconnected(): void {
    this.connected = false;
    this.abortController?.abort();
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.subscribedKey = undefined;
    clearInterval(this.interval);
    if (typeof window === "undefined") return;
    window.removeEventListener("focus", this.revalidate);
    window.removeEventListener("online", this.revalidate);
    document.removeEventListener("visibilitychange", this.handleVisibility);
  }

  /**
   * Runs the task now, regardless of `autoRun` or whether `args` changed. Aborts any run already in flight.
   * With a `key`, a fresh cached value is shown without fetching unless `force` is set.
   */
  run(args: T = this.config.args(), options: { force?: boolean } = {}): void {
    this.previousArgs ??= args;
    this.abortController?.abort();
    const abortController = new AbortController();
    this.abortController = abortController;
    const callId = ++this.callId;
    const key = this.config.key?.(args);

    let fetcher = (signal: AbortSignal) => this.attempt(args, signal);
    if (key !== undefined) {
      this.watch(key);
      const cached = this.cache.get<R>(key);
      if (cached) {
        this.status = "complete";
        this.value = cached.value;
        this.updatedAt = cached.updatedAt;
        this.error = undefined;
        const fresh = cached.updatedAt > 0 && Date.now() - cached.updatedAt < (this.config.staleTime ?? 0);
        if (fresh && !options.force) {
          this.refreshing = false;
          this.host.requestUpdate();
          return;
        }
        this.refreshing = true;
      } else {
        this.status = "pending";
        this.refreshing = false;
      }
      fetcher = (signal) => this.cache.fetch(key, (shared) => this.attempt(args, shared), signal);
    } else {
      this.status = "pending";
    }
    this.host.requestUpdate();

    fetcher(abortController.signal).then(
      (value) => {
        if (callId !== this.callId) return; // superseded by a newer run
        this.status = "complete";
        this.value = value;
        this.error = undefined;
        this.refreshing = false;
        this.updatedAt = Date.now();
        this.host.requestUpdate();
      },
      (error: unknown) => {
        if (callId !== this.callId) return;
        if (abortController.signal.aborted) return; // our own cancellation, not a real failure
        this.error = error;
        // A failed background refresh keeps showing the value it had.
        if (!this.refreshing) this.status = "error";
        this.refreshing = false;
        this.host.requestUpdate();
      },
    );
  }

  /** Fetches again now with the current args, even if the cached value is fresh. */
  refresh(): void {
    this.run(this.previousArgs ?? this.config.args(), { force: true });
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

  /** One run of the task, with retries. */
  private async attempt(args: T, signal: AbortSignal): Promise<R> {
    const { retry = 0, retryDelay } = this.config;
    for (let failures = 0; ; ) {
      try {
        return await this.config.task(args, signal);
      } catch (error) {
        failures++;
        const again = typeof retry === "function" ? retry(failures, error) : failures <= retry;
        if (signal.aborted || !again) throw error;
        const wait =
          typeof retryDelay === "function"
            ? retryDelay(failures, error)
            : (retryDelay ?? Math.min(1000 * 2 ** (failures - 1), 30_000));
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, wait);
          signal.addEventListener("abort", () => (clearTimeout(timer), reject(signal.reason)), { once: true });
        });
      }
    }
  }

  /** Follows `set()`/`invalidate()` on the key this controller is showing. */
  private watch(key: TaskKey): void {
    const id = JSON.stringify(key);
    if (id === this.subscribedKey || !this.connected) return;
    this.unsubscribe?.();
    this.subscribedKey = id;
    this.unsubscribe = this.cache.subscribe(key, () => {
      const entry = this.cache.get<R>(key);
      if (!entry) return;
      if (entry.updatedAt === 0) {
        if (this.previousArgs) this.run(this.previousArgs); // invalidated: fetch again
        return;
      }
      if (entry.value === this.value) return;
      this.value = entry.value;
      this.updatedAt = entry.updatedAt;
      if (this.status !== "pending") this.status = "complete";
      this.host.requestUpdate();
    });
  }

  private readonly revalidate = (): void => {
    if (this.previousArgs) this.run(this.previousArgs);
  };

  private readonly handleVisibility = (): void => {
    if (document.visibilityState === "visible") this.revalidate();
  };
}

function argsEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
}
