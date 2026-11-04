import type { ReactiveController, ReactiveControllerHost } from "lit";
import { type FormValues, getPath, normalizeName, parseFormValues, toPath } from "./values.js";

/**
 * The minimal slice of the Standard Schema v1 interface
 * (https://standardschema.dev) this package needs — implemented by zod
 * (≥ 3.24), valibot, arktype and others, so any of them can be passed as
 * `schema` without this package depending on one.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown,
    ) => StandardSchemaV1Result<Output> | Promise<StandardSchemaV1Result<Output>>;
    readonly types?: { readonly input: Input; readonly output: Output } | undefined;
  };
}

export type StandardSchemaV1Result<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: readonly StandardSchemaV1Issue[] };

export interface StandardSchemaV1Issue {
  readonly message: string;
  readonly path?: readonly (PropertyKey | { readonly key: PropertyKey })[] | undefined;
}

/** A message means invalid; `undefined`/`null`/`""` means valid. */
export type ValidationResult = string | undefined | null;

export type FieldValidator<V = FormValues> = (
  // `any`, not `unknown`: a field's value is whatever FormData holds for it (usually a string),
  // and forcing a cast in every validator would only add noise.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  values: V,
  signal: AbortSignal,
) => ValidationResult | Promise<ValidationResult>;

export interface FormControllerOptions<V = FormValues> {
  /** Called lazily, so a `@query("form")` that's still unset before the first render is fine. */
  form: () => HTMLFormElement | null | undefined;
  /** Field name (or pattern with `*` for one segment, e.g. `items.*.name`) → validator. */
  validators?: Record<string, FieldValidator<V>>;
  /** Any Standard Schema v1 object (zod, valibot, arktype, ...), validated against `values`. */
  schema?: StandardSchemaV1<unknown, V>;
  /** When a field's errors start being shown. Validation itself always runs on every check. */
  validateOn?: "input" | "change" | "submit";
  /** Debounce for async validators and async schemas, in ms. */
  debounce?: number;
}

interface Issue {
  name?: string;
  message: string;
}

interface Job {
  id: string;
  run(signal: AbortSignal): Issue[] | Promise<Issue[]>;
}

interface Mark {
  message: string;
  /** The element's own `[error, errorText]` before we set them; absent when we used setCustomValidity(). */
  prev?: [unknown, unknown];
}

type ErrorTextElement = Element & { error: unknown; errorText: unknown };

const AsyncFunction = (async () => {}).constructor;

/**
 * A reactive controller that tracks a native `<form>`'s aggregate validity
 * for a Lit host — e.g. to reactively enable/disable a submit button as the
 * user types, instead of only finding out on submit — and optionally runs
 * field validators (sync or async) and a Standard Schema against the form's
 * values, showing their messages on the matching controls.
 *
 * Deliberately *not* a validity-aggregation engine: `form.checkValidity()`/
 * `form.reportValidity()` already aggregate across every participant —
 * native inputs and any form-associated custom element alike (that's the
 * entire point of `ElementInternals`/`formAssociated`, which every
 * form-associated `lit-material` component — Checkbox, Radio, Switch,
 * Slider, Text Field — already implements correctly). What's actually
 * missing is *reactivity*: native form validity isn't observable without
 * manually wiring up your own event listeners, which is what this
 * controller does, calling `host.requestUpdate()` only when its observable
 * state actually changes.
 *
 * Listens for `input`/`change` (typing-driven updates, deferred to a
 * microtask so a form-associated custom element's own `ElementInternals`
 * update — which typically happens in its `updated()`, i.e. *after* the
 * `change` event it just dispatched — has settled before the aggregate
 * check runs) and the capturing-phase `invalid` event (fired once per
 * invalid field, dispatched *by* `checkValidity()`/`reportValidity()`
 * itself — including this controller's own calls to them — or a submit
 * attempt; it never bubbles, so this is only observable via a capture
 * listener on an ancestor, not a normal bubbling one).
 *
 * The `invalid` handler deliberately does not call `checkValidity()`/
 * `reportValidity()` again — since those two methods are themselves what
 * dispatch `invalid` in the first place, doing so is circular and hangs
 * the page in an infinite loop for as long as any field stays invalid.
 * Seeing `invalid` fire at all already answers the question (the form
 * isn't fully valid), so the handler just records that directly.
 */
export class FormController<V = FormValues> implements ReactiveController {
  /** Native validity, validator/schema errors (shown or not) and pending async validation, combined. */
  valid = true;
  /** True while an async validator or async schema is pending. */
  validating = false;
  /** True while `handleSubmit()`'s `onValid` promise is pending. */
  submitting = false;
  /** Field name (dotted) → first message, for fields whose errors are currently shown. */
  errors: Record<string, string> = {};
  /** Schema issues without a path, once shown. */
  formErrors: string[] = [];

  private readonly host: ReactiveControllerHost;
  private readonly getForm: () => HTMLFormElement | null | undefined;
  private readonly validators: [string, FieldValidator<V>][];
  private readonly schema?: StandardSchemaV1<unknown, V>;
  private readonly validateOn: "input" | "change" | "submit";
  private readonly debounce: number;
  private form?: HTMLFormElement;

  private nativeValid = true;
  private syncIssues: Issue[] = [];
  private asyncIssues: Issue[] = [];
  private hasIssues = false;
  private output?: { value: V };
  private readonly asyncJobs = new Set<string>();
  private abort?: AbortController;
  private pending?: Promise<void>;
  private readonly touched = new Set<string>();
  private showAll = false;
  private readonly marks = new Map<Element, Mark>();
  private names = "";
  private lastState = "";

  constructor(
    host: ReactiveControllerHost,
    options: FormControllerOptions<V> | (() => HTMLFormElement | null | undefined),
  ) {
    const opts = typeof options === "function" ? { form: options } : options;
    this.host = host;
    this.getForm = opts.form;
    this.validators = Object.entries(opts.validators ?? {}).map(([name, fn]) => [normalizeName(name), fn]);
    this.schema = opts.schema;
    this.validateOn = opts.validateOn ?? "input";
    this.debounce = opts.debounce ?? 250;
    for (const [name, fn] of this.validators) if (fn instanceof AsyncFunction) this.asyncJobs.add(name);
    this.lastState = this.state();
    host.addController(this);
  }

  /** The form's current values, built from `new FormData(form)` by {@link parseFormValues}. */
  get values(): V {
    return (this.form ? parseFormValues(new FormData(this.form)) : {}) as V;
  }

  /** The shown error for a field (`items[0].name` and `items.0.name` are the same field). */
  error(name: string): string | undefined {
    return this.errors[normalizeName(name)];
  }

  hostConnected(): void {
    this.attach();
  }

  hostUpdated(): void {
    // hostConnected() fires as part of connectedCallback(), *before* the
    // host's first render — if `getForm()` reads a `@query()`-resolved
    // element, it's still undefined at that point, so attach() silently
    // no-ops there. hostUpdated() runs after every render (including the
    // first), so this is what actually attaches in that common case;
    // attach() no-ops on every call after the first since the form
    // reference doesn't change without an explicit refresh().
    //
    // A render can also add or remove fields (e.g. a field array row)
    // without any input event, so re-check when the set of names changed.
    const names = this.form && this.hasValidation ? this.fieldNames().join() : this.names;
    if (names !== this.names) {
      this.names = names;
      queueMicrotask(() => this.checkValidity());
    }
    this.attach();
  }

  hostDisconnected(): void {
    this.detach();
  }

  /** Re-resolves `getForm()` and re-attaches — call if the form reference could have changed. */
  refresh(): void {
    this.detach();
    this.attach();
  }

  /**
   * Re-checks validity without showing native validation UI: runs sync validators now (async ones
   * debounced), then the native check. With no validators, the same boolean `form.checkValidity()` returns.
   */
  checkValidity(): boolean {
    this.run();
    return this.checkNative();
  }

  /** Like `checkValidity()`, but shows every error and focuses the first invalid control. */
  reportValidity(): boolean {
    this.showAll = true;
    this.run();
    return this.report();
  }

  /** Runs every validator and the schema immediately, waits for async ones, then reports like `reportValidity()`. */
  async validate(): Promise<boolean> {
    this.showAll = true;
    this.run(true);
    while (this.pending) await this.pending;
    return this.report();
  }

  /**
   * Returns a `submit` listener: prevents the default, runs `validate()`, and calls `onValid` only if the
   * form is valid — with the schema's output when there is a schema, else `values`.
   */
  handleSubmit(onValid: (values: V, event: Event) => void | Promise<void>): (event: Event) => Promise<void> {
    return async (event) => {
      event.preventDefault();
      if (this.submitting || !(await this.validate())) return;
      this.submitting = true;
      this.notify();
      try {
        await onValid(this.output ? this.output.value : this.values, event);
      } finally {
        this.submitting = false;
        this.notify();
      }
    };
  }

  private get hasValidation(): boolean {
    return this.validators.length > 0 || this.schema !== undefined;
  }

  private attach(): void {
    const form = this.getForm();
    if (!form || form === this.form) return;
    this.form = form;
    this.names = this.fieldNames().join();
    form.addEventListener("input", this.handleChange);
    form.addEventListener("change", this.handleChange);
    form.addEventListener("reset", this.handleReset);
    form.addEventListener("invalid", this.handleInvalid, true);
    // Deferred a microtask for the same reason handleChange is: this typically runs from
    // hostUpdated(), synchronously right after the host's own first render — but a form-associated
    // child (e.g. a required, still-empty Text Field) that *just* connected as part of that same
    // render hasn't run its own first update yet, so its ElementInternals validity is still unset
    // (defaults to valid). Queuing this lets any such pending child update flush first, so the
    // very first check already reflects real validity instead of only catching up on the next
    // input/change event.
    queueMicrotask(() => this.checkValidity());
  }

  private detach(): void {
    if (!this.form) return;
    this.form.removeEventListener("input", this.handleChange);
    this.form.removeEventListener("change", this.handleChange);
    this.form.removeEventListener("reset", this.handleReset);
    this.form.removeEventListener("invalid", this.handleInvalid, true);
    this.abort?.abort();
    this.pending = undefined;
    this.paint({});
    this.form = undefined;
  }

  private readonly handleChange = (event: Event): void => {
    const name = nameOf(event.target);
    if (name && (this.validateOn === "input" || (this.validateOn === "change" && event.type === "change"))) {
      this.touched.add(name);
    }
    queueMicrotask(() => this.checkValidity());
  };

  private readonly handleReset = (): void => {
    this.touched.clear();
    this.showAll = false;
    queueMicrotask(() => this.checkValidity());
  };

  private readonly handleInvalid = (): void => {
    this.nativeValid = false;
    this.notify();
  };

  /** Runs sync jobs now and async ones (debounced unless `immediate`), superseding any earlier run. */
  private run(immediate = false): void {
    if (!this.form || !this.hasValidation) return;
    this.abort?.abort();
    const { signal } = (this.abort = new AbortController());
    const sync: Issue[] = [];
    const started: Promise<Issue[]>[] = [];
    const deferred: Job[] = [];
    for (const job of this.jobs()) {
      if (!immediate && this.asyncJobs.has(job.id)) {
        deferred.push(job);
        continue;
      }
      const result = job.run(signal);
      if (result instanceof Promise) {
        this.asyncJobs.add(job.id);
        started.push(result);
      } else sync.push(...result);
    }
    if (deferred.length) {
      started.push(
        delay(this.debounce, signal)
          .then(() => Promise.all(deferred.map((job) => job.run(signal))))
          .then((results) => results.flat()),
      );
    }
    this.syncIssues = sync;
    if (started.length) {
      this.validating = true;
      const batch = Promise.all(started);
      this.pending = new Promise<void>((resolve) => {
        signal.addEventListener("abort", () => resolve());
        batch.then((results) => {
          if (signal.aborted) return;
          this.asyncIssues = results.flat();
          this.validating = false;
          this.pending = undefined;
          this.apply();
          this.checkNative();
          resolve();
        }, () => resolve());
      });
    } else {
      this.asyncIssues = [];
      this.validating = false;
      this.pending = undefined;
    }
    this.apply();
  }

  private jobs(): Job[] {
    const values = this.values;
    const names = this.fieldNames();
    const jobs: Job[] = [];
    for (const [pattern, fn] of this.validators) {
      const fields = pattern.includes("*") ? names.filter((name) => matches(pattern, name)) : [pattern];
      jobs.push({
        id: pattern,
        run: (signal) => {
          const results = fields.map((name) => {
            const toIssues = (message: ValidationResult): Issue[] => (message ? [{ name, message }] : []);
            const result = fn(getPath(values, name), values, signal);
            return result instanceof Promise
              ? result.then(toIssues, (error: unknown) => toIssues(messageOf(error)))
              : toIssues(result);
          });
          return results.some((r) => r instanceof Promise)
            ? Promise.all(results).then((r) => r.flat())
            : (results as Issue[][]).flat();
        },
      });
    }
    const schema = this.schema;
    if (schema) {
      this.output = undefined;
      jobs.push({
        id: "~schema",
        run: (signal) => {
          const toIssues = (result: StandardSchemaV1Result<V>): Issue[] => {
            if (!result.issues) {
              if (!signal.aborted) this.output = { value: result.value };
              return [];
            }
            return result.issues.map((issue) => ({
              name: issue.path?.length ? issue.path.map((seg) => String(typeof seg === "object" ? seg.key : seg)).join(".") : undefined,
              message: issue.message,
            }));
          };
          const result = schema["~standard"].validate(values);
          return result instanceof Promise
            ? result.then(toIssues, (error: unknown) => [{ message: messageOf(error) }])
            : toIssues(result);
        },
      });
    }
    return jobs;
  }

  /** Recomputes `errors`/`formErrors` from the latest issues and paints the shown ones onto controls. */
  private apply(): void {
    const all: Record<string, string> = {};
    const formErrors: string[] = [];
    for (const { name, message } of [...this.syncIssues, ...this.asyncIssues]) {
      if (name === undefined) formErrors.push(message);
      else all[name] ??= message;
    }
    this.hasIssues = formErrors.length > 0 || Object.keys(all).length > 0;
    this.errors = Object.fromEntries(Object.entries(all).filter(([name]) => this.showAll || this.touched.has(name)));
    this.formErrors = this.showAll || this.touched.size ? formErrors : [];
    this.paint(this.errors);
    this.notify();
  }

  /** Shows `errors` on their controls and clears exactly what this controller set before. */
  private paint(errors: Record<string, string>): void {
    const seen = new Set<Element>();
    for (const el of this.controls()) {
      const message = errors[nameOf(el)];
      if (!message) continue;
      seen.add(el);
      const mark = this.marks.get(el);
      if (mark?.message === message) continue;
      if (hasErrorText(el)) {
        const prev = mark?.prev ?? [el.error, el.errorText];
        el.error = true;
        el.errorText = message;
        this.marks.set(el, { message, prev });
      } else if ("setCustomValidity" in el && typeof el.setCustomValidity === "function") {
        el.setCustomValidity(message);
        this.marks.set(el, { message });
      }
    }
    for (const [el, mark] of this.marks) {
      if (seen.has(el)) continue;
      this.marks.delete(el);
      if (!mark.prev) (el as HTMLInputElement).setCustomValidity("");
      else if (hasErrorText(el) && el.error === true && el.errorText === mark.message) {
        [el.error, el.errorText] = mark.prev;
      }
    }
  }

  private checkNative(): boolean {
    this.nativeValid = this.form?.checkValidity() ?? true;
    this.notify();
    return this.valid;
  }

  private report(): boolean {
    const form = this.form;
    if (!form) return this.valid;
    // Native reportValidity() only knows about natively-invalid controls; a control showing one of our
    // errors through `errorText` (not custom validity) may come first, so focus that one ourselves.
    const first = this.controls().find((el) => this.marks.has(el) || el.matches(":invalid"));
    if (first && !first.matches(":invalid")) {
      (first as HTMLElement).focus();
      this.nativeValid = form.checkValidity();
    } else {
      this.nativeValid = form.reportValidity();
    }
    this.notify();
    return this.valid;
  }

  private controls(): Element[] {
    return this.form ? Array.from(this.form.elements) : [];
  }

  private fieldNames(): string[] {
    return [...new Set(this.controls().map(nameOf).filter(Boolean))];
  }

  private state(): string {
    return JSON.stringify([this.valid, this.validating, this.submitting, this.errors, this.formErrors]);
  }

  private notify(): void {
    this.valid = this.nativeValid && !this.hasIssues && !this.validating;
    const state = this.state();
    if (state === this.lastState) return;
    this.lastState = state;
    this.host.requestUpdate();
  }
}

function nameOf(el: unknown): string {
  const name = (el as { name?: unknown } | null)?.name;
  return typeof name === "string" ? normalizeName(name) : "";
}

function hasErrorText(el: Element): el is ErrorTextElement {
  return "errorText" in el;
}

function matches(pattern: string, name: string): boolean {
  const a = toPath(pattern);
  const b = toPath(name);
  return a.length === b.length && a.every((seg, i) => seg === "*" || seg === b[i]);
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}
