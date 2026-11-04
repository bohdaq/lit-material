import { aTimeout, expect, fixture, html } from "@open-wc/testing";
import { repeat } from "lit/directives/repeat.js";
import type { TemplateResult } from "lit";
import type { LitMaterialTextField } from "@lit-material/text-field";
import "@lit-material/text-field";
import "./form-validation-test-host.js";
import type { FormValidationTestHost } from "./form-validation-test-host.js";
import {
  FieldArrayController,
  FormController,
  type FormControllerOptions,
  type StandardSchemaV1,
  type StandardSchemaV1Issue,
} from "./index.js";

type Values = Record<string, unknown>;

async function setup(
  content: (host: FormValidationTestHost) => TemplateResult,
  options: Omit<FormControllerOptions<Values>, "form"> = {},
): Promise<{ el: FormValidationTestHost; form: FormController<Values> }> {
  const el = await fixture<FormValidationTestHost>(
    html`<lit-material-form-validation-test-host .content=${content}></lit-material-form-validation-test-host>`,
  );
  const form = new FormController<Values>(el, { form: () => el.formElement, ...options });
  await flush(el);
  return { el, form };
}

async function flush(el: FormValidationTestHost): Promise<void> {
  await Promise.resolve();
  await el.updateComplete;
  await el.updateComplete;
}

function field<T extends Element = HTMLInputElement>(el: FormValidationTestHost, name: string): T {
  return el.shadowRoot!.querySelector<T>(`[name="${name}"]`)!;
}

async function type(el: FormValidationTestHost, name: string, value: string, eventType = "input"): Promise<void> {
  const input = field<HTMLInputElement>(el, name);
  input.value = value;
  input.dispatchEvent(new Event(eventType, { bubbles: true, composed: true }));
  await flush(el);
}

const minLength = (n: number) => (value: string) => (value.length < n ? `At least ${n} characters` : undefined);

describe("FormController values", () => {
  it("reads nested, indexed and repeated names from the form", async () => {
    const { form } = await setup(
      () => html`
        <input name="address.city" value="Kyiv" />
        <input name="items[0].name" value="a" />
        <input name="items.1.name" value="b" />
        <input type="checkbox" name="tags" value="x" checked />
        <input type="checkbox" name="tags" value="y" checked />
        <input type="checkbox" name="off" />
      `,
    );
    expect(form.values).to.deep.equal({
      address: { city: "Kyiv" },
      items: [{ name: "a" }, { name: "b" }],
      tags: ["x", "y"],
    });
  });
});

describe("FormController validators", () => {
  it("shows a sync error on a native input once it's been typed in, and clears it", async () => {
    const { el, form } = await setup(() => html`<input name="username" /><input name="other" />`, {
      validators: { username: minLength(3), other: minLength(1) },
    });
    // Both fail from the first check (so `valid` is false), but nothing is shown before input.
    expect(form.valid).to.be.false;
    expect(form.errors).to.deep.equal({});

    await type(el, "username", "ab");
    expect(form.errors).to.deep.equal({ username: "At least 3 characters" });
    expect(form.error("username")).to.equal("At least 3 characters");
    expect(field(el, "username").validationMessage).to.equal("At least 3 characters");
    expect(el.formElement!.checkValidity()).to.be.false;

    await type(el, "username", "abc");
    expect(form.errors).to.deep.equal({});
    expect(field(el, "username").validationMessage).to.equal("");
    expect(form.valid).to.be.false; // `other` still fails, unshown

    await type(el, "other", "x");
    expect(form.valid).to.be.true;
  });

  it("passes all values for cross-field rules", async () => {
    const { el, form } = await setup(() => html`<input name="password" /><input name="confirm" />`, {
      validators: { confirm: (value, values) => (value !== values.password ? "Doesn't match" : undefined) },
    });
    await type(el, "password", "secret");
    await type(el, "confirm", "secre");
    expect(form.error("confirm")).to.equal("Doesn't match");
    await type(el, "password", "secre");
    expect(form.error("confirm")).to.be.undefined;
    expect(form.valid).to.be.true;
  });

  it('validateOn: "change" waits for change; "submit" waits for validate()', async () => {
    const onChange = await setup(() => html`<input name="a" />`, {
      validators: { a: minLength(3) },
      validateOn: "change",
    });
    await type(onChange.el, "a", "x");
    expect(onChange.form.errors).to.deep.equal({});
    await type(onChange.el, "a", "x", "change");
    expect(onChange.form.error("a")).to.equal("At least 3 characters");

    const onSubmit = await setup(() => html`<input name="a" />`, {
      validators: { a: minLength(3) },
      validateOn: "submit",
    });
    await type(onSubmit.el, "a", "x", "change");
    expect(onSubmit.form.errors).to.deep.equal({});
    expect(await onSubmit.form.validate()).to.be.false;
    expect(onSubmit.form.error("a")).to.equal("At least 3 characters");
    await type(onSubmit.el, "a", "xyz"); // live afterwards
    expect(onSubmit.form.errors).to.deep.equal({});
  });

  it("applies pattern validators to every matching array field", async () => {
    const { form } = await setup(
      () => html`<input name="items.0.name" value="ok" /><input name="items[1].name" value="" />`,
      { validators: { "items.*.name": (value: string) => (value ? undefined : "Required") } },
    );
    expect(await form.validate()).to.be.false;
    expect(form.errors).to.deep.equal({ "items.1.name": "Required" });
    expect(form.error("items[1].name")).to.equal("Required");
  });

  it("debounces async validators and reports validating", async () => {
    const calls: string[] = [];
    const { el, form } = await setup(() => html`<input name="user" />`, {
      debounce: 30,
      validators: {
        user: async (value: string) => {
          calls.push(value);
          return value === "taken" ? "Taken" : undefined;
        },
      },
    });
    await aTimeout(50);
    calls.length = 0;

    await type(el, "user", "t");
    await type(el, "user", "ta");
    await type(el, "user", "taken");
    expect(form.validating).to.be.true;
    expect(form.valid).to.be.false;
    expect(calls).to.deep.equal([]);

    await aTimeout(60);
    await flush(el);
    expect(calls).to.deep.equal(["taken"]);
    expect(form.validating).to.be.false;
    expect(form.error("user")).to.equal("Taken");
    expect(form.valid).to.be.false;
  });

  it("discards superseded async runs and aborts their signal", async () => {
    const runs: { value: string; signal: AbortSignal; resolve: (m?: string) => void }[] = [];
    const { el, form } = await setup(() => html`<input name="user" />`, {
      debounce: 0,
      validators: {
        user: (value: string, _values, signal) =>
          new Promise<string | undefined>((resolve) => runs.push({ value, signal, resolve })),
      },
    });
    await type(el, "user", "a");
    await aTimeout(5);
    await type(el, "user", "b");
    await aTimeout(5);
    const first = runs.find((r) => r.value === "a")!;
    const last = runs.at(-1)!;
    expect(last.value).to.equal("b");
    expect(first.signal.aborted).to.be.true;

    first.resolve("Stale error");
    await flush(el);
    expect(form.validating).to.be.true;
    expect(form.errors).to.deep.equal({});

    last.resolve(undefined);
    await aTimeout(0);
    await flush(el);
    expect(form.validating).to.be.false;
    expect(form.errors).to.deep.equal({});
    expect(form.valid).to.be.true;
  });

  it("validate() awaits async validators", async () => {
    const { form } = await setup(() => html`<input name="user" value="taken" />`, {
      debounce: 1000,
      validators: { user: async (value: string) => (value === "taken" ? "Taken" : undefined) },
    });
    expect(await form.validate()).to.be.false;
    expect(form.error("user")).to.equal("Taken");
  });
});

describe("FormController schema", () => {
  const issues = (values: Values): StandardSchemaV1Issue[] => [
    ...(values.email ? [] : [{ message: "Email required", path: [{ key: "email" }] }]),
    ...((values.items as { name: string }[] | undefined) ?? [])
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => !item.name)
      .map(({ i }) => ({ message: "Name required", path: ["items", i, "name"] })),
    ...(values.password !== values.confirm ? [{ message: "Passwords differ" }] : []),
  ];
  const schema = (async = false): StandardSchemaV1<unknown, Values> => ({
    "~standard": {
      version: 1,
      vendor: "test",
      validate(value) {
        const found = issues(value as Values);
        const result = found.length ? { issues: found } : { value: { ...(value as Values), parsed: true } };
        return async ? Promise.resolve(result) : result;
      },
    },
  });

  it("maps issue paths to field names and pathless issues to formErrors", async () => {
    const { form } = await setup(
      () => html`
        <input name="email" />
        <input name="items.0.name" value="a" />
        <input name="items.1.name" />
        <input name="password" value="x" />
        <input name="confirm" value="y" />
      `,
      { schema: schema() },
    );
    expect(await form.validate()).to.be.false;
    expect(form.errors).to.deep.equal({ email: "Email required", "items.1.name": "Name required" });
    expect(form.formErrors).to.deep.equal(["Passwords differ"]);
  });

  it("supports async schemas and hands the schema output to handleSubmit", async () => {
    const submitted: Values[] = [];
    const { el, form } = await setup(() => html`<input name="email" />`, { schema: schema(true), debounce: 0 });
    const submit = form.handleSubmit((values) => {
      submitted.push(values);
    });
    await submit(new Event("submit", { cancelable: true }));
    expect(submitted).to.have.length(0);
    expect(form.error("email")).to.equal("Email required");

    await type(el, "email", "a@b.c");
    await submit(new Event("submit", { cancelable: true }));
    expect(submitted).to.deep.equal([{ email: "a@b.c", parsed: true }]);
  });
});

describe("FormController showing errors", () => {
  it("sets error/errorText on a lit-material text-field and clears them", async () => {
    const { el, form } = await setup(() => html`<lit-material-text-field name="email"></lit-material-text-field>`, {
      validators: { email: (value: string) => (value.includes("@") ? undefined : "Invalid email") },
    });
    const textField = field<LitMaterialTextField>(el, "email");
    expect(textField.error).to.be.false;

    expect(form.reportValidity()).to.be.false;
    expect(textField.error).to.be.true;
    expect(textField.errorText).to.equal("Invalid email");
    expect(el.shadowRoot!.activeElement).to.equal(textField); // focused, though not natively invalid

    textField.value = "a@b.c";
    textField.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await flush(el);
    expect(textField.error).to.be.false;
    expect(textField.errorText).to.equal("");
    expect(form.valid).to.be.true;
  });

  it("never clears an error the app set itself", async () => {
    const { el, form } = await setup(
      () => html`
        <lit-material-text-field name="a" error error-text="Server says no"></lit-material-text-field>
        <lit-material-text-field name="b"></lit-material-text-field>
      `,
      { validators: { a: (v: string) => (v ? undefined : "Required"), b: (v: string) => (v ? undefined : "Required") } },
    );
    const a = field<LitMaterialTextField>(el, "a");
    const b = field<LitMaterialTextField>(el, "b");
    await form.validate();
    expect(a.errorText).to.equal("Required");
    expect(b.errorText).to.equal("Required");

    // `a` had an app error before ours: it comes back. `b` gets an app error after ours: it stays.
    b.errorText = "Server says no too";
    for (const [tf, value] of [[a, "x"], [b, "y"]] as const) {
      tf.value = value;
      tf.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    await flush(el);
    expect(form.errors).to.deep.equal({});
    expect([a.error, a.errorText]).to.deep.equal([true, "Server says no"]);
    expect([b.error, b.errorText]).to.deep.equal([true, "Server says no too"]);
  });

  it("never clears custom validity it didn't set", async () => {
    const { el, form } = await setup(() => html`<input name="a" /><input name="b" />`, {
      validators: { a: (v: string) => (v ? undefined : "Required") },
    });
    field(el, "b").setCustomValidity("App message");
    await type(el, "a", "");
    await type(el, "a", "x");
    expect(field(el, "a").validationMessage).to.equal("");
    expect(field(el, "b").validationMessage).to.equal("App message");
    expect(form.valid).to.be.false;
  });
});

describe("FieldArrayController", () => {
  it("keeps stable keys across append, insert, remove, move and replace", async () => {
    const el = await fixture<FormValidationTestHost>(
      html`<lit-material-form-validation-test-host></lit-material-form-validation-test-host>`,
    );
    const rows = new FieldArrayController<string>(el, { initial: ["a", "b"] });
    const [a, b] = rows.items.map((item) => item.key);
    rows.append("c");
    rows.insert(0, "z");
    expect(rows.items.map((i) => i.value)).to.deep.equal(["z", "a", "b", "c"]);
    rows.move(0, 3);
    expect(rows.items.map((i) => i.value)).to.deep.equal(["a", "b", "c", "z"]);
    rows.remove(1);
    expect(rows.items.map((i) => i.value)).to.deep.equal(["a", "c", "z"]);
    expect(rows.items[0]!.key).to.equal(a);
    expect(rows.items.map((i) => i.key)).not.to.include(b);
    rows.replace(["q"]);
    expect(rows.items.map((i) => i.value)).to.deep.equal(["q"]);
    expect(new Set(rows.items.map((i) => i.key)).size).to.equal(1);
  });

  it("renders rows the form reads back as an array, and re-validates when rows change", async () => {
    const el = await fixture<FormValidationTestHost>(
      html`<lit-material-form-validation-test-host></lit-material-form-validation-test-host>`,
    );
    const rows = new FieldArrayController<{ name: string }>(el, { initial: [{ name: "a" }, { name: "" }] });
    el.content = () => html`
      ${repeat(
        rows.items,
        (item) => item.key,
        (item, i) => html`<input name="items.${i}.name" .value=${item.value.name} />`,
      )}
    `;
    await el.updateComplete;
    const form = new FormController(el, {
      form: () => el.formElement,
      validators: { "items.*.name": (v: string) => (v ? undefined : "Required") },
    });
    await flush(el);
    expect(form.values).to.deep.equal({ items: [{ name: "a" }, { name: "" }] });
    expect(await form.validate()).to.be.false;
    expect(form.errors).to.deep.equal({ "items.1.name": "Required" });

    rows.remove(1);
    await flush(el);
    await flush(el);
    expect(form.values).to.deep.equal({ items: [{ name: "a" }] });
    expect(form.errors).to.deep.equal({});
    expect(form.valid).to.be.true;

    rows.append({ name: "c" });
    rows.move(1, 0);
    await flush(el);
    expect(form.values).to.deep.equal({ items: [{ name: "c" }, { name: "a" }] });
  });
});

describe("FormController handleSubmit", () => {
  it("blocks invalid submits, focusing the first invalid control", async () => {
    let called = 0;
    const { el, form } = await setup(() => html`<input name="a" /><input name="b" required />`, {
      validators: { a: (v: string) => (v ? undefined : "Required") },
    });
    const event = new Event("submit", { cancelable: true });
    await form.handleSubmit(() => {
      called++;
    })(event);
    expect(event.defaultPrevented).to.be.true;
    expect(called).to.equal(0);
    expect(el.shadowRoot!.activeElement).to.equal(field(el, "a"));
  });

  it("calls onValid with values, with submitting true while it's pending", async () => {
    const { el, form } = await setup(() => html`<input name="a" value="x" /><button>Go</button>`, {
      validators: { a: async (v: string) => (v ? undefined : "Required") },
    });
    let finish!: () => void;
    const seen: Values[] = [];
    el.formElement!.addEventListener(
      "submit",
      form.handleSubmit(async (values) => {
        seen.push(values);
        await new Promise<void>((resolve) => (finish = resolve));
      }),
    );
    el.formElement!.requestSubmit();
    await aTimeout(0);
    await flush(el);
    expect(seen).to.deep.equal([{ a: "x" }]);
    expect(form.submitting).to.be.true;
    finish();
    await aTimeout(0);
    expect(form.submitting).to.be.false;
  });
});
