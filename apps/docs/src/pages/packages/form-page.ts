import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import { guidePageStyles } from "../../styles/guide-page-styles.js";

const usageCode = [
  'import { FormController } from "@lit-material/form";',
  'import { LitElement, html } from "lit";',
  'import { customElement, query } from "lit/decorators.js";',
  'import "@lit-material/text-field";',
  'import "@lit-material/button";',
  "",
  '@customElement("signup-form")',
  "class SignupForm extends LitElement {",
  '  @query("form") private readonly formEl?: HTMLFormElement;',
  "",
  "  private readonly form = new FormController(this, () => this.formEl);",
  "",
  "  override render() {",
  "    return html`",
  "      <form @submit=${this.handleSubmit}>",
  '        <lit-material-text-field name="email" label="Email" required type="email"></lit-material-text-field>',
  '        <lit-material-button type="submit" ?disabled=${!this.form.valid}>Sign up</lit-material-button>',
  "      </form>",
  "    `;",
  "  }",
  "",
  "  private handleSubmit(event: SubmitEvent): void {",
  "    if (!this.form.reportValidity()) event.preventDefault();",
  "  }",
  "}",
].join("\n");

@customElement("docs-form-page")
export class DocsFormPage extends LitElement {
  static override styles = [pageStyles, guidePageStyles];

  override render() {
    return html`
      <div class="eyebrow">App shell · @lit-material/form</div>
      <h1>Form</h1>
      <p class="lede">
        A reactive controller that tracks a native <code>&lt;form&gt;</code>'s aggregate validity for a Lit
        host. <code>form.checkValidity()</code>/<code>reportValidity()</code> already aggregate across every
        participant — native inputs and any form-associated custom element alike — every form-associated
        lit-material component (Checkbox, Radio, Switch, Slider, Text Field) already implements that
        correctly via <code>ElementInternals</code>. What's missing is <em>reactivity</em>: native form
        validity isn't observable without wiring up your own event listeners — e.g. to reactively enable/
        disable a submit button as the user types, instead of only finding out when they click it.
        <code>FormController</code> is that listener, wired up once.
      </p>

      <section class="doc-section">
        <h2>Install</h2>
        <pre><code>npm install @lit-material/form</code></pre>
      </section>

      <section class="doc-section">
        <h2>Usage</h2>
        <pre><code>${usageCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>API</h2>
        <p>
          <code>new FormController(host, getForm)</code> — <code>getForm: () => HTMLFormElement | null |
          undefined</code> is called lazily (not just once at construction), so a <code>@query("form")</code>
          reference that's still <code>undefined</code> during the host's very first
          <code>hostConnected()</code> resolves correctly once that render completes.
        </p>
        <ul>
          <li>
            <code>valid: boolean</code> — the form's current aggregate validity. Starts <code>true</code>
            until the controller's first successful check.
          </li>
          <li>
            <code>checkValidity()</code> / <code>reportValidity()</code> — thin wrappers around the native
            methods that also update <code>valid</code> and trigger a host re-render if it changed.
            <code>reportValidity()</code> additionally shows native validation UI for the first invalid field.
          </li>
          <li><code>refresh()</code> — re-resolves <code>getForm()</code> and re-attaches, for a form reference that could change.</li>
        </ul>
        <p>
          Listens for <code>input</code>/<code>change</code> and the capturing-phase <code>invalid</code>
          event (fired once per invalid field by <code>checkValidity()</code>/<code>reportValidity()</code>
          themselves, or a submit attempt — it never bubbles, so a capture listener on an ancestor is the only
          way to observe it). The <code>invalid</code> handler deliberately never calls
          <code>checkValidity()</code>/<code>reportValidity()</code> again — since those two methods are what
          dispatch <code>invalid</code> in the first place, doing so is circular and hangs the page in an
          infinite loop for as long as any field stays invalid; the handler just records <code>false</code>
          directly instead.
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-form-page": DocsFormPage;
  }
}
