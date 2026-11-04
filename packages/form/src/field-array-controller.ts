import type { ReactiveController, ReactiveControllerHost } from "lit";

export interface FieldArrayItem<T> {
  /** Stable across inserts, removes and moves — use it as the `repeat()` key. */
  readonly key: string;
  readonly value: T;
}

let keyCount = 0;

/**
 * Holds a list of rows for a repeated group of fields, each with a stable
 * `key` for `repeat()`. It only tracks rows: the inputs themselves stay the
 * source of truth for values — name them `items.${index}.name` and
 * `FormController#values` reads them back as `items: [{ name }, ...]`.
 */
export class FieldArrayController<T = unknown> implements ReactiveController {
  items: FieldArrayItem<T>[];

  private readonly host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost, options: { initial?: T[] } = {}) {
    this.host = host;
    this.items = (options.initial ?? []).map(wrap);
    host.addController(this);
  }

  hostConnected(): void {}

  append(value: T): void {
    this.set([...this.items, wrap(value)]);
  }

  insert(index: number, value: T): void {
    const items = [...this.items];
    items.splice(index, 0, wrap(value));
    this.set(items);
  }

  remove(index: number): void {
    this.set(this.items.filter((_, i) => i !== index));
  }

  move(from: number, to: number): void {
    const items = [...this.items];
    items.splice(to, 0, ...items.splice(from, 1));
    this.set(items);
  }

  replace(values: T[]): void {
    this.set(values.map(wrap));
  }

  private set(items: FieldArrayItem<T>[]): void {
    this.items = items;
    this.host.requestUpdate();
  }
}

function wrap<T>(value: T): FieldArrayItem<T> {
  return { key: `row-${++keyCount}`, value };
}
