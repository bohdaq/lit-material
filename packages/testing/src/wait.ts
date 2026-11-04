import { walk, type QueryRoot } from "./dom.js";

type Updatable = Element & { updateComplete: Promise<unknown>; isUpdatePending?: boolean };
const isUpdatable = (el: Element): el is Updatable =>
  typeof (el as Partial<Updatable>).updateComplete?.then === "function";

/**
 * Waits until every Lit element under `root` (default: the whole document), through shadow roots, has
 * finished updating — including elements that an update renders, and their own updates. Gives up after
 * `maxRounds` rounds of new updates (an element that re-renders forever).
 */
export async function waitForUpdate(root: QueryRoot | Element = document, { maxRounds = 20 } = {}): Promise<void> {
  for (let round = 0; round < maxRounds; round++) {
    const elements = [...(root instanceof Element && isUpdatable(root) ? [root] : []), ...walk(root)].filter(isUpdatable);
    await Promise.all(elements.map((el) => el.updateComplete));
    // An update can render new elements or schedule another update; settle until neither happens.
    const after = [...walk(root)].filter(isUpdatable);
    if (after.length === elements.length && after.every((el) => !el.isUpdatePending)) return;
  }
  throw new Error(`waitForUpdate: still updating after ${maxRounds} rounds`);
}

/**
 * Calls `check` until it returns without throwing (and isn't `false`/`null`/`undefined`), then resolves with
 * its value. Rejects with the last error after `timeout` ms (default 1000).
 */
export async function waitFor<T>(check: () => T | Promise<T>, { timeout = 1000, interval = 20 } = {}): Promise<NonNullable<T>> {
  const deadline = Date.now() + timeout;
  let last: unknown = new Error("waitFor: condition never held");
  for (;;) {
    try {
      const value = await check();
      if (value !== false && value !== null && value !== undefined) return value as NonNullable<T>;
      last = new Error("waitFor: condition returned " + String(value));
    } catch (error) {
      last = error;
    }
    if (Date.now() >= deadline) throw last;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/** Resolves on the next animation frame (after layout), for code that measures. */
export const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));
