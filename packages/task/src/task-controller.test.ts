import { expect, fixture, html } from "@open-wc/testing";
import "./task-test-host.js";
import type { TaskTestHost } from "./task-test-host.js";

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void; reject: (error: unknown) => void } {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("TaskController + LitElement", () => {
  it("starts pending immediately on first render (autoRun default true)", async () => {
    const el = await fixture<TaskTestHost>(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    // hostUpdate() runs the task before the first render completes, so by
    // the time the element is connected the status is already "pending" or
    // (if the microtask already resolved) "complete" — never "initial".
    expect(el.task.status).to.not.equal("initial");
  });

  it("transitions to complete and re-renders with the resolved value", async () => {
    const el = await fixture<TaskTestHost>(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    await el.updateComplete;
    // Let the resolved microtask's requestUpdate() flow through.
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;

    expect(el.task.status).to.equal("complete");
    expect(el.task.value).to.equal("user-1");
    expect(el.shadowRoot!.textContent).to.equal("complete:user-1");
  });

  it("re-runs automatically when args change", async () => {
    const el = await fixture<TaskTestHost>(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    expect(el.runCount).to.equal(1);

    el.id = "2";
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;

    expect(el.runCount).to.equal(2);
    expect(el.task.value).to.equal("user-2");
  });

  it("does not re-run when args are unchanged across re-renders", async () => {
    const el = await fixture<TaskTestHost>(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    expect(el.runCount).to.equal(1);

    el.requestUpdate(); // force a re-render with the same `id`
    await el.updateComplete;
    expect(el.runCount).to.equal(1);
  });

  it("discards a stale run's result when superseded before it resolves", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const el = await fixture<TaskTestHost>(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    el.taskImpl = () => (el.runCount === 1 ? first.promise : second.promise);
    el.id = "a"; // trigger the first (deferred) run
    await el.updateComplete;

    el.id = "b"; // supersede it before it resolves
    await el.updateComplete;

    second.resolve("second-result");
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    expect(el.task.status).to.equal("complete");
    expect(el.task.value).to.equal("second-result");

    // The first run resolving afterwards must not clobber the second's result.
    first.resolve("first-result (stale)");
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    expect(el.task.value).to.equal("second-result");
  });

  it("aborts the superseded run's signal", async () => {
    const el = await fixture<TaskTestHost>(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    await new Promise((r) => setTimeout(r, 0));
    const firstSignal = el.lastSignal!;
    expect(firstSignal.aborted).to.be.false;

    el.id = "2";
    await el.updateComplete;
    expect(firstSignal.aborted).to.be.true;
  });

  it("transitions to error when the task rejects", async () => {
    const el = await fixture<TaskTestHost>(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    el.taskImpl = () => Promise.reject(new Error("boom"));
    el.id = "err"; // trigger a run with the rejecting impl
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;

    expect(el.task.status).to.equal("error");
    expect((el.task.error as Error).message).to.equal("boom");
    expect(el.shadowRoot!.textContent).to.equal("error:Error: boom");
  });

  it("run() executes regardless of autoRun and args-equality", async () => {
    const el = await fixture<TaskTestHost>(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    const before = el.runCount;

    el.task.run();
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;

    expect(el.runCount).to.equal(before + 1);
  });

  it("aborts an in-flight run when the host disconnects", async () => {
    const pending = deferred<string>();
    const el = await fixture<TaskTestHost>(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    el.taskImpl = () => pending.promise;
    el.id = "disconnect-test";
    await el.updateComplete;
    const signal = el.lastSignal!;

    el.remove();
    expect(signal.aborted).to.be.true;
  });
});
