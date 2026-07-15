import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TaskController } from "./task-controller.js";

/**
 * Shared test fixture for both the browser and SSR test suites — kept in
 * its own non-test file (not inlined in a `*.test.ts` file) because this
 * package's tsconfig.json excludes `*.test.ts` from compilation, which
 * breaks decorator transformation for a `@customElement`/`@property`-
 * decorated class declared directly inside one when run through `tsx`.
 */
@customElement("lit-material-task-test-host")
export class TaskTestHost extends LitElement {
  @property() id = "1";

  runCount = 0;
  lastSignal?: AbortSignal;
  taskImpl: (id: string, signal: AbortSignal) => Promise<string> = (id) => Promise.resolve(`user-${id}`);

  readonly task = new TaskController<[string], string>(this, {
    task: ([id], signal) => {
      this.runCount++;
      this.lastSignal = signal;
      return this.taskImpl(id, signal);
    },
    args: () => [this.id],
  });

  override render() {
    return this.task.render({
      initial: () => "initial",
      pending: () => "pending",
      complete: (value) => `complete:${value}`,
      error: (error) => `error:${String(error)}`,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-task-test-host": TaskTestHost;
  }
}
