/** A cache key: a string, or an array of JSON-able parts (`["users", id, { page }]`). */
export type TaskKey = string | readonly unknown[];

export interface CacheEntry<R = unknown> {
  value: R;
  /** When the value was stored (ms since epoch); `0` after `invalidate()`. */
  updatedAt: number;
}

interface Slot {
  key: readonly unknown[];
  entry?: CacheEntry;
  inflight?: { promise: Promise<unknown>; abort: AbortController; joined: number };
  listeners: Set<() => void>;
  gc?: ReturnType<typeof setTimeout>;
}

/** JSON with object keys sorted, so `{ a, b }` and `{ b, a }` are one key. */
function stable(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : v,
  );
}

const parts = (key: TaskKey): readonly unknown[] => (typeof key === "string" ? [key] : key);

/**
 * Results of keyed tasks, shared by every `TaskController` that uses the same cache: a value fetched by one
 * is shown at once by the others, concurrent fetches of one key share a single request, and
 * `invalidate()`/`set()` reach every controller showing that key.
 *
 * Entries nobody is showing are dropped `gcTime` ms after the last one stops (default 5 minutes).
 */
export class TaskCache {
  private readonly slots = new Map<string, Slot>();
  private readonly gcTime: number;

  constructor(options: { gcTime?: number } = {}) {
    this.gcTime = options.gcTime ?? 5 * 60_000;
  }

  private slot(key: TaskKey): Slot {
    const id = stable(parts(key));
    let slot = this.slots.get(id);
    if (!slot) {
      slot = { key: parts(key), listeners: new Set() };
      this.slots.set(id, slot);
      this.scheduleGc(id, slot);
    }
    return slot;
  }

  private scheduleGc(id: string, slot: Slot): void {
    clearTimeout(slot.gc);
    if (slot.listeners.size > 0 || slot.inflight) return;
    slot.gc = setTimeout(() => {
      if (slot.listeners.size === 0 && !slot.inflight) this.slots.delete(id);
    }, this.gcTime);
    // In Node (server rendering, tests) a pending clean-up must not keep the process alive.
    (slot.gc as { unref?: () => void }).unref?.();
  }

  /** The cached value for `key`, if any. */
  get<R>(key: TaskKey): CacheEntry<R> | undefined {
    return this.slots.get(stable(parts(key)))?.entry as CacheEntry<R> | undefined;
  }

  /** Stores a value (after a mutation, say) and shows it in every controller on that key. */
  set<R>(key: TaskKey, value: R): void {
    const slot = this.slot(key);
    slot.entry = { value, updatedAt: Date.now() };
    for (const listener of slot.listeners) listener();
  }

  /**
   * Marks entries stale — every key starting with `prefix` (`["users"]` matches `["users", 42]`), or all of
   * them — so controllers showing them fetch again now, and others on their next run.
   */
  invalidate(prefix?: TaskKey): void {
    const match = prefix === undefined ? undefined : parts(prefix).map((p) => stable(p));
    for (const slot of this.slots.values()) {
      if (match && !match.every((p, i) => i < slot.key.length && stable(slot.key[i]) === p)) continue;
      if (slot.entry) slot.entry = { ...slot.entry, updatedAt: 0 };
      for (const listener of slot.listeners) listener();
    }
  }

  /** Drops every entry. */
  clear(): void {
    for (const slot of this.slots.values()) clearTimeout(slot.gc);
    this.slots.clear();
  }

  /** Calls `listener` when `key`'s entry is set or invalidated. Returns the unsubscribe function. */
  subscribe(key: TaskKey, listener: () => void): () => void {
    const id = stable(parts(key));
    const slot = this.slot(key);
    slot.listeners.add(listener);
    clearTimeout(slot.gc);
    return () => {
      slot.listeners.delete(listener);
      this.scheduleGc(id, slot);
    };
  }

  /**
   * Runs `fetcher` for `key`, or joins the request already in flight for it. The shared request is aborted
   * only when every caller's `signal` has aborted. The result is stored and shown to subscribers.
   */
  fetch<R>(key: TaskKey, fetcher: (signal: AbortSignal) => Promise<R>, signal?: AbortSignal): Promise<R> {
    const id = stable(parts(key));
    const slot = this.slot(key);
    let inflight = slot.inflight;
    if (!inflight) {
      const abort = new AbortController();
      const promise = fetcher(abort.signal).then(
        (value) => {
          if (slot.inflight === inflight) slot.inflight = undefined;
          if (!abort.signal.aborted) this.set(key, value);
          this.scheduleGc(id, slot);
          return value;
        },
        (error: unknown) => {
          if (slot.inflight === inflight) slot.inflight = undefined;
          this.scheduleGc(id, slot);
          throw error;
        },
      );
      inflight = { promise, abort, joined: 0 };
      slot.inflight = inflight;
    }
    const joined = inflight;
    joined.joined++;
    signal?.addEventListener(
      "abort",
      () => {
        if (--joined.joined === 0 && slot.inflight === joined) {
          slot.inflight = undefined;
          joined.abort.abort(signal.reason);
          this.scheduleGc(id, slot);
        }
      },
      { once: true },
    );
    return joined.promise as Promise<R>;
  }
}

/** The cache `TaskController`s use unless given their own. */
export const taskCache = new TaskCache();
