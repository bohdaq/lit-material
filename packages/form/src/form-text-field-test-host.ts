import "@lit-material/text-field";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { FormController } from "./form-controller.js";

/**
 * A second test fixture, separate from `form-test-host.ts`, using
 * `lit-material-text-field` specifically — regression coverage for a race
 * where a required-but-empty Text Field's own `ElementInternals` validity
 * isn't set yet (still defaults to valid) at the exact moment `attach()`
 * runs its first `checkValidity()`, since that Text Field's own first
 * render hasn't completed. See `attach()`'s comment in form-controller.ts.
 */
@customElement("lit-material-form-text-field-test-host")
export class FormTextFieldTestHost extends LitElement {
  @query("form") private readonly formElement?: HTMLFormElement;

  readonly form = new FormController(this, () => this.formElement);

  override render() {
    return html`
      <form>
        <lit-material-text-field name="email" required type="email"></lit-material-text-field>
        <button type="submit">Submit</button>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-form-text-field-test-host": FormTextFieldTestHost;
  }
}
