# @lit-material/form

A reactive controller that tracks a native `<form>`'s aggregate validity for a Lit host, with optional sync/async
field validators, Standard Schema (zod, valibot, …) validation, field arrays and a submit helper. Part of
[lit-material](https://github.com/bohdaq/lit-material)'s app-shell primitives, alongside
[`@lit-material/task`](https://github.com/bohdaq/lit-material/tree/main/packages/task),
[`@lit-material/router`](https://github.com/bohdaq/lit-material/tree/main/packages/router), and
[`@lit-material/store`](https://github.com/bohdaq/lit-material/tree/main/packages/store).

There's no `screenshot.png` in this README — like `@lit-material/store`, `@lit-material/task`, and
`@lit-material/core`, this package has no visual output of its own to capture.

## Why this and not just `form.checkValidity()`?

`form.checkValidity()`/`form.reportValidity()` already aggregate across every participant — native inputs and
any form-associated custom element alike (that's the entire point of `ElementInternals`/`formAssociated`,
which every form-associated `lit-material` component — Checkbox, Radio, Switch, Slider, Text Field — already
implements correctly). This package doesn't reimplement that.

What's actually missing is *reactivity*: native form validity isn't observable without wiring up your own
event listeners — e.g. to reactively enable/disable a submit button as the user types, instead of only
finding out when they click it. `FormController` is that listener, wired up once.

## Install

```sh
npm install @lit-material/form
```

## Usage

```ts
import { FormController } from "@lit-material/form";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import "@lit-material/text-field";
import "@lit-material/button";

@customElement("signup-form")
class SignupForm extends LitElement {
  @query("form") private readonly formEl?: HTMLFormElement;

  private readonly form = new FormController(this, () => this.formEl);

  override render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <lit-material-text-field name="email" label="Email" required type="email"></lit-material-text-field>
        <lit-material-button type="submit" ?disabled=${!this.form.valid}>Sign up</lit-material-button>
      </form>
    `;
  }

  private handleSubmit(event: SubmitEvent): void {
    if (!this.form.reportValidity()) event.preventDefault();
  }
}
```

### Validators, schemas and submit

Pass options instead of a bare `getForm` to add field validators (sync or async), a
[Standard Schema](https://standardschema.dev) (zod ≥ 3.24, valibot, arktype, …) and a submit helper. Messages show
on the matching controls: `error`/`errorText` on lit-material fields, `setCustomValidity()` on native ones.

```ts
import { z } from "zod";

const schema = z.object({ email: z.string().email("Enter an email"), password: z.string().min(8) });

@customElement("signup-form")
class SignupForm extends LitElement {
  @query("form") private readonly formEl?: HTMLFormElement;

  private readonly form = new FormController(this, {
    form: () => this.formEl,
    schema, // values are typed from the schema's output
    validators: {
      email: async (email, _values, signal) => ((await api.isTaken(email, signal)) ? "Already registered" : undefined),
    },
  });

  override render() {
    return html`
      <form @submit=${this.form.handleSubmit((values) => api.signup(values))}>
        <lit-material-text-field name="email" label="Email"></lit-material-text-field>
        <lit-material-text-field name="password" label="Password" type="password"></lit-material-text-field>
        <lit-material-button type="submit" ?disabled=${this.form.submitting}>
          ${this.form.validating ? "Checking…" : "Sign up"}
        </lit-material-button>
      </form>
    `;
  }
}
```

### Field arrays

`FieldArrayController` keeps the rows (with stable keys for `repeat()`); the inputs stay the source of truth. Name
row fields `items.${i}.name` (or `items[${i}].name`) and `form.values.items` reads back as an array:

```ts
private readonly items = new FieldArrayController(this, { initial: [{ name: "" }] });
private readonly form = new FormController(this, {
  form: () => this.formEl,
  validators: { "items.*.name": (name) => (name ? undefined : "Required") },
});

override render() {
  return html`
    <form @submit=${this.form.handleSubmit(({ items }) => save(items))}>
      ${repeat(this.items.items, (item) => item.key, (item, i) => html`
        <lit-material-text-field name="items.${i}.name" .value=${item.value.name}></lit-material-text-field>
        <lit-material-button @click=${() => this.items.remove(i)}>Remove</lit-material-button>
      `)}
      <lit-material-button @click=${() => this.items.append({ name: "" })}>Add</lit-material-button>
      <lit-material-button type="submit">Save</lit-material-button>
    </form>
  `;
}
// form.values → { items: [{ name: "…" }, …] }
```

## API

`new FormController(host, getForm)` or `new FormController(host, options)` — `getForm`/`options.form:
() => HTMLFormElement | null | undefined` is called lazily (not just once at construction), so a `@query("form")`
reference that's still `undefined` during the host's very first `hostConnected()` (before its first render)
resolves correctly once that render completes. Options:

- `validators?: { [name]: (value, values, signal) => string | null | undefined | Promise<…> }` — a message means
  invalid. `name` is a field name or a pattern with `*` for one segment (`items.*.name`). Sync ones run on every
  check; async ones run debounced, a newer run aborts `signal` and discards the older result.
- `schema?` — any Standard Schema v1 object, validated against `values`. Issue paths become field names
  (`["items", 0, "name"]` → `items.0.name`); issues without a path go to `formErrors`.
- `validateOn?: "input" | "change" | "submit"` (default `"input"`) — when a field's errors are first *shown*: as
  the user types in it, when it's committed, or after the first submit attempt (then live). Validation always
  runs, so `valid` is always current.
- `debounce?: number` (default `250`) — ms before async validators and async schemas run.

Members:

- `valid: boolean` — native validity, validator/schema errors (shown or not yet) and pending async validation,
  combined. Starts `true` until the controller's first successful check (a form with no invalid fields yet
  attached reads as valid, same as a bare `HTMLFormElement` would).
- `validating` / `submitting: boolean` — an async validator is pending / `handleSubmit()`'s `onValid` is pending.
- `values` — the form's values: `new FormData(form)` parsed by `parseFormValues()` (dotted/bracketed names nest,
  integer segments make arrays, repeated names make arrays; values as FormData gives them, e.g. a checked
  checkbox is `"on"`).
- `errors: Record<string, string>` / `error(name)` — the first shown message per field; `formErrors: string[]`.
- `checkValidity()` / `reportValidity()` — run validators, then the native methods of the same name, update
  `valid` and trigger a host re-render if anything changed. `reportValidity()` additionally shows every error and
  native validation UI, focusing the first invalid control.
- `validate(): Promise<boolean>` — runs everything now (no debounce), awaits async validators, then reports.
- `handleSubmit(onValid)` — a `submit` listener: prevents the default, `validate()`s, and calls
  `onValid(values, event)` only when valid (with the schema's output when there's a schema).
- `refresh()` — re-resolves `getForm()` and re-attaches. Call this if the form reference itself could have
  changed (e.g. conditionally rendering a different `<form>`).

Errors are shown on every control with that `name`: an element with an `errorText` property (lit-material Text
Field, Select, …) gets `error = true` and `errorText`; anything else gets `setCustomValidity()`, so native
`checkValidity()` and submit blocking see it too. The controller restores exactly what it set when the error goes
away, and leaves alone an `error`/`errorText` or custom validity the app set itself. Note that `errorText` doesn't
feed a Text Field's native validity — `valid`, this controller's `checkValidity()` and `handleSubmit()` account
for it, a bare `form.checkValidity()` doesn't.

`new FieldArrayController<T>(host, { initial? })` — `items: { key, value }[]` with stable keys, and `append(value)`,
`insert(index, value)`, `remove(index)`, `move(from, to)`, `replace(values)`, each re-rendering the host. The form
controller re-validates after a render that adds or removes fields.

`parseFormValues(formData)` — the pure parser behind `values`.

Listens for `input`/`change` (typing-driven updates — deferred a microtask, since a form-associated custom
element's own `ElementInternals` update typically happens in its `updated()`, i.e. *after* the `change` event
it just dispatched) and the capturing-phase `invalid` event (fired once per invalid field by
`checkValidity()`/`reportValidity()` themselves, or a submit attempt — it never bubbles, so a capture listener
on an ancestor is the only way to observe it). The `invalid` handler deliberately never calls
`checkValidity()`/`reportValidity()` again — since those two methods are what dispatch `invalid` in the first
place, doing so is circular and hangs the page in an infinite loop for as long as any field stays invalid;
seeing `invalid` fire at all already answers the question, so the handler just records `false` directly.

## License

MIT
