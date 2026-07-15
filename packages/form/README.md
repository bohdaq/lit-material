# @lit-material/form

A reactive controller that tracks a native `<form>`'s aggregate validity for a Lit host. Part of
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

## API

`new FormController(host, getForm)` — `getForm: () => HTMLFormElement | null | undefined` is called lazily
(not just once at construction), so a `@query("form")` reference that's still `undefined` during the host's
very first `hostConnected()` (before its first render) resolves correctly once that render completes.

- `valid: boolean` — the form's current aggregate validity. Starts `true` until the controller's first
  successful check (a form with no invalid fields yet attached reads as valid, same as a bare
  `HTMLFormElement` would).
- `checkValidity()` / `reportValidity()` — thin wrappers around the native methods of the same name that also
  update `valid` and trigger a host re-render if it changed. `reportValidity()` additionally shows native
  validation UI for the first invalid field, exactly like the native method.
- `refresh()` — re-resolves `getForm()` and re-attaches. Call this if the form reference itself could have
  changed (e.g. conditionally rendering a different `<form>`).

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
