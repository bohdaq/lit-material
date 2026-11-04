import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { TaskCache } from "./cache.js";
import { TaskController, type TaskConfig } from "./task-controller.js";

class Host implements ReactiveControllerHost {
  controllers: ReactiveController[] = [];
  updates = 0;
  addController(c: ReactiveController) {
    this.controllers.push(c);
  }
  removeController() {}
  requestUpdate() {
    this.updates++;
  }
  get updateComplete() {
    return Promise.resolve(true);
  }
  connect() {
    for (const c of this.controllers) c.hostConnected?.();
    for (const c of this.controllers) c.hostUpdate?.();
  }
  disconnect() {
    for (const c of this.controllers) c.hostDisconnected?.();
  }
}

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

function mount<R>(config: Partial<TaskConfig<[string], R>> & Pick<TaskConfig<[string], R>, "task">, id = "1") {
  const host = new Host();
  const args = { id };
  const task = new TaskController<[string], R>(host, { args: () => [args.id], ...config });
  host.connect();
  return { host, task, args };
}

describe("TaskController cache (no browser)", () => {
  it("shares one request between controllers on the same key", async () => {
    const cache = new TaskCache();
    let calls = 0;
    const task = async ([id]: [string]) => (calls++, await tick(5), `user-${id}`);
    const a = mount({ task, key: ([id]) => ["user", id], cache });
    const b = mount({ task, key: ([id]) => ["user", id], cache });
    await tick(20);
    assert.equal(calls, 1);
    assert.equal(a.task.value, "user-1");
    assert.equal(b.task.value, "user-1");
    assert.equal(b.task.status, "complete");
  });

  it("shows a cached value at once and refreshes it in the background (stale-while-revalidate)", async () => {
    const cache = new TaskCache();
    cache.set(["user", "1"], "old");
    let release!: (v: string) => void;
    const { task } = mount({ task: () => new Promise<string>((r) => (release = r)), key: ([id]) => ["user", id], cache });
    assert.equal(task.status, "complete");
    assert.equal(task.value, "old");
    assert.equal(task.refreshing, true);
    release("new");
    await tick();
    assert.equal(task.value, "new");
    assert.equal(task.refreshing, false);
  });

  it("doesn't fetch within staleTime, unless refresh() forces it", async () => {
    const cache = new TaskCache();
    cache.set(["user", "1"], "cached");
    let calls = 0;
    const { task } = mount({ task: async () => (calls++, "fetched"), key: ([id]) => ["user", id], cache, staleTime: 60_000 });
    await tick();
    assert.equal(calls, 0);
    assert.equal(task.value, "cached");
    task.refresh();
    await tick();
    assert.equal(calls, 1);
    assert.equal(task.value, "fetched");
  });

  it("invalidate() re-fetches what's showing, by key prefix", async () => {
    const cache = new TaskCache();
    let n = 0;
    const { task } = mount({ task: async () => `v${++n}`, key: ([id]) => ["user", id], cache, staleTime: 60_000 });
    await tick();
    assert.equal(task.value, "v1");
    cache.invalidate(["post"]);
    await tick();
    assert.equal(task.value, "v1");
    cache.invalidate(["user"]);
    await tick();
    assert.equal(task.value, "v2");
  });

  it("set() pushes a value to every controller on the key", async () => {
    const cache = new TaskCache();
    const { task, host } = mount({ task: async () => "server", key: () => "me", cache });
    await tick();
    const before = host.updates;
    cache.set("me", "optimistic");
    assert.equal(task.value, "optimistic");
    assert.ok(host.updates > before);
  });

  it("keeps the value when a background refresh fails, and records the error", async () => {
    const cache = new TaskCache();
    cache.set("k", "old");
    const { task } = mount({ task: async () => Promise.reject(new Error("offline")), key: () => "k", cache });
    await tick();
    assert.equal(task.status, "complete");
    assert.equal(task.value, "old");
    assert.equal((task.error as Error).message, "offline");
  });

  it("aborts the shared request only when every controller has gone", async () => {
    const cache = new TaskCache();
    let signal!: AbortSignal;
    const task = (_: [string], s: AbortSignal) => ((signal = s), new Promise<string>(() => {}));
    const a = mount({ task, key: () => "slow", cache });
    const b = mount({ task, key: () => "slow", cache });
    a.host.disconnect();
    assert.equal(signal.aborted, false);
    b.host.disconnect();
    assert.equal(signal.aborted, true);
  });

  it("matches object keys regardless of property order", () => {
    const cache = new TaskCache();
    cache.set(["list", { page: 2, sort: "name" }], "x");
    assert.equal(cache.get(["list", { sort: "name", page: 2 }])?.value, "x");
  });
});

describe("TaskController retry (no browser)", () => {
  it("retries the given number of times, then reports the error", async () => {
    let calls = 0;
    const { task } = mount({ task: async () => (calls++, Promise.reject(new Error("boom"))), retry: 2, retryDelay: 1 });
    await tick(30);
    assert.equal(calls, 3);
    assert.equal(task.status, "error");
  });

  it("stops retrying once it succeeds, and a function can decide", async () => {
    let calls = 0;
    const { task } = mount({
      task: async () => (++calls < 3 ? Promise.reject(new Error("503")) : "ok"),
      retry: (failures, error) => failures < 5 && (error as Error).message === "503",
      retryDelay: () => 1,
    });
    await tick(30);
    assert.equal(calls, 3);
    assert.equal(task.value, "ok");
  });

  it("doesn't retry an aborted run", async () => {
    let calls = 0;
    const { task, args } = mount({
      task: (_, signal) => (calls++, new Promise<string>((_, reject) => signal.addEventListener("abort", () => reject(new Error("aborted"))))),
      retry: 3,
      retryDelay: 1,
    });
    args.id = "2";
    task.run(["2"]);
    await tick(20);
    assert.equal(calls, 2);
  });

  it("without new options, behaves as before: no cache, no retry", async () => {
    let calls = 0;
    const { task } = mount({ task: async () => (calls++, Promise.reject(new Error("x"))) });
    await tick(10);
    assert.equal(calls, 1);
    assert.equal(task.status, "error");
  });
});
