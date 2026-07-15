import "@lit-material/checkbox";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { FormController } from "./form-controller.js";

/**
 * Shared test fixture for both the browser and SSR test suites — kept in
 * its own non-test file, not inlined in a `*.test.ts` file: this package's
 * tsconfig.json excludes `*.test.ts` from compilation, which breaks
 * decorator transformation for a `@customElement`-decorated class declared
 * directly inside one when run through `tsx` (see `@lit-material/task` for
 * where this was first found).
 *
 * Deliberately includes a real `lit-material-checkbox`, not just a native
 * `<input>` — proving `FormController` aggregates validity across a
 * form-associated custom element the same way it does a native control,
 * since both participate in the form via the same `ElementInternals` APIs.
 */
@customElement("lit-material-form-test-host")
export class FormTestHost extends LitElement {
  @query("form") private readonly formElement?: HTMLFormElement;

  readonly form = new FormController(this, () => this.formElement);

  override render() {
    return html`
      <form>
        <input name="username" required />
        <lit-material-checkbox name="agree" required></lit-material-checkbox>
        <button type="submit">Submit</button>
      </form>
      <p id="status">${this.form.valid ? "valid" : "invalid"}</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-form-test-host": FormTestHost;
  }
}
