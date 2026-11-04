# @lit-material/task

A dependency-free reactive controller for async work (typically data fetching) tied to a Lit host's own
reactive properties — the same shape as [`@lit-labs/task`](https://www.npmjs.com/package/@lit-labs/task),
hand-rolled without the dependency. Part of [lit-material](https://github.com/bohdaq/lit-material)'s
app-shell primitives, alongside
[`@lit-material/router`](https://github.com/bohdaq/lit-material/tree/main/packages/router) and
[`@lit-material/store`](https://github.com/bohdaq/lit-material/tree/main/packages/store).

There's no `screenshot.png` in this README — like `@lit-material/store` and `@lit-material/core`, this
package has no visual output of its own to capture.

## Why hand-rolled instead of `@lit-labs/task`?

The same reasoning `@lit-material/router` gives for not depending on `@lit-labs/router`: the `labs` package
is unstable API, and the actual need here — re-run an async function when its arguments change, track
pending/complete/error, cancel a superseded run — doesn't need most of what a full task-queue implementation
ships.

## Install

```sh
npm install @lit-material/task
```

## Usage

```ts
import { TaskController } from "@lit-material/task";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("user-profile")
class UserProfile extends LitElement {
  @property() userId!: string;

  private readonly userTask = new TaskController(this, {
    task: ([id], signal) => fetch(`/api/users/${id}`, { signal }).then((r) => r.json()),
    args: () => [this.userId] as const,
  });

  override render() {
    return this.userTask.render({
      pending: () => html`Loading…`,
      complete: (user) => html`${user.name}`,
      error: (e) => html`Error: ${String(e)}`,
    });
  }
}
```

## API

`new TaskController(host, { task, args, autoRun?, key?, cache?, staleTime?, retry?, retryDelay?, refetchOnFocus?, refetchOnReconnect?, refetchInterval? })`:

- `task: (args, signal) => Promise<R>` — the async work. Receives an `AbortSignal` that fires if a newer run
  supersedes this one before it resolves.
- `args: () => T` — read the host's current reactive properties into the task's arguments. Checked before
  every render; a new run starts automatically whenever this returns a shallowly different value.
- `autoRun` (default `true`) — set `false` to only ever run via an explicit `.run()` call.
- `key`, `cache`, `staleTime`, `refetch*` — caching and background refresh, see below.
- `retry`, `retryDelay` — retries, see below.

Properties: `status` (`"initial" | "pending" | "complete" | "error"`), `value`, `error`, `refreshing`
(a background fetch is running behind a value already shown), `updatedAt`. Methods: `run(args?, { force? })`
(runs now regardless of `autoRun`/whether `args` changed — aborts anything already in flight), `refresh()`
(fetches again now, even if the cache is fresh), `render({ initial?, pending?, complete?, error? })` (picks
the matching callback for the current `status`).

A newer run always aborts the previous one via the signal passed to `task`, and a stale run's result/error is
discarded even if it resolves after a newer one already has — no out-of-order flicker if responses arrive out
of sequence.

## Caching, deduplication and background refresh

Give a task a `key` and its results are kept in a cache shared by every controller (`taskCache`, or your own
`new TaskCache()` passed as `cache`):

```ts
private readonly user = new TaskController(this, {
  task: ([id], signal) => api.get<User>(`/users/${id}`, { signal }),
  args: () => [this.userId] as const,
  key: ([id]) => ["user", id],   // a string, or an array of JSON-able parts
  staleTime: 30_000,             // fresh for 30 s: show it, fetch nothing
  refetchOnFocus: true,          // stale again? fetch when the tab regains focus
});
```

- **Stale-while-revalidate:** a cached value shows at once (`status: "complete"`); if it's older than
  `staleTime` (default `0`), a background fetch runs with `refreshing: true` and replaces it. A failed
  background fetch keeps the value and sets `error`.
- **Deduplication:** controllers asking for one key at once share one request. Its signal aborts only when
  every one of them has gone.
- **Mutations:** `taskCache.set(key, value)` shows a value everywhere (optimistic updates);
  `taskCache.invalidate(["user"])` marks every key starting with `"user"` stale and re-fetches the ones on
  screen; `invalidate()` marks everything.
- **Background refresh:** `refetchOnFocus`, `refetchOnReconnect` (stale entries only), `refetchInterval` (ms,
  while the page is visible).
- Entries nobody shows are dropped after `gcTime` (`new TaskCache({ gcTime })`, default 5 minutes).

## Retries

`retry: 3` retries a failed run three times; a function decides per failure:
`retry: (failures, error) => failures < 3 && error.status >= 500`. `retryDelay` is milliseconds or a function
of the attempt number (default 1 s, doubling, at most 30 s). An aborted run never retries.

For the requests themselves, [`@lit-material/http`](../http) adds a base URL, JSON, typed errors, timeouts and
interceptors.

## SSR

A `TaskController` never runs its task during `@lit-labs/ssr`: SSR drives `willUpdate()`/`update()`/
`render()` directly but never invokes reactive controllers' `hostUpdate()` — the hook `autoRun` relies on to
start a task before the host's first render. So a server-rendered host is always frozen in the `"initial"`
status; the real run only starts once the client hydrates. There's no way around this either way, since Lit
SSR is a single synchronous pass that can't await an in-flight promise — render an `initial` state that makes
sense pre-hydration (e.g. the same as `pending`).

## License

MIT
