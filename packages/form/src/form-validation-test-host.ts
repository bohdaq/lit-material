import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";

/**
 * A bare host for the validation tests: renders `<form>${content(this)}</form>`,
 * and each test attaches its own `FormController`/`FieldArrayController` to it
 * (`addController()` on an already-connected host calls `hostConnected()` at once).
 * Kept out of `*.test.ts` for the decorator reason given in `form-test-host.ts`.
 */
@customElement("lit-material-form-validation-test-host")
export class FormValidationTestHost extends LitElement {
  @property({ attribute: false }) content: (host: FormValidationTestHost) => TemplateResult = () => html``;
  @query("form") readonly formElement?: HTMLFormElement;

  override render() {
    return html`<form>${this.content(this)}</form>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-form-validation-test-host": FormValidationTestHost;
  }
}
