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
      <div class="eyebrow">App shell · <code>@lit-material/form</code></div>
      <h1>Form</h1>
      <p class="lede">
        A reactive controller that tracks the overall validity of a native <code>&lt;form&gt;</code> for a
        Lit host. <code>form.checkValidity()</code>/<code>reportValidity()</code> already cover every field,
        native inputs and form associated custom elements alike, and every <code>lit-material</code> form
        component (Checkbox, Radio, Switch, Slider, Text Field) supports them through
        <code>ElementInternals</code>. What's missing is <em>reactivity</em>: you can't observe native form
        validity without your own event listeners, for example to enable or disable a submit button as the
        user types instead of finding out only when they click it. <code>FormController</code> is that
        listener, set up once.
      </p>

      <section class="doc-section">
        <h2>Install</h2>
        <pre tabindex="0"><code>npm install @lit-material/form</code></pre>
      </section>

      <section class="doc-section">
        <h2>Usage</h2>
        <pre tabindex="0"><code>${usageCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>API</h2>
        <p>
          <code>new FormController(host, getForm)</code>: <code>getForm: () => HTMLFormElement | null |
          undefined</code> is called when needed, not once at construction, so a <code>@query("form")</code>
          reference that's still <code>undefined</code> during the host's first <code>hostConnected()</code>
          resolves once that render completes.
        </p>
        <ul>
          <li>
            <code>valid: boolean</code>: the form's current overall validity. Starts <code>true</code>
            until the controller's first successful check.
          </li>
          <li>
            <code>checkValidity()</code> / <code>reportValidity()</code>: thin wrappers around the native
            methods that also update <code>valid</code> and render the host again if it changed.
            <code>reportValidity()</code> additionally shows native validation UI for the first invalid field.
          </li>
          <li><code>refresh()</code>: calls <code>getForm()</code> again and attaches to its result, for a form reference that can change.</li>
        </ul>
        <p>
          Listens for <code>input</code>/<code>change</code>, and for the <code>invalid</code> event in the
          capture phase. <code>invalid</code> fires once per invalid field from
          <code>checkValidity()</code>/<code>reportValidity()</code> themselves or a submit attempt, and it
          never bubbles, so a capture listener on an ancestor is the only way to observe it. The
          <code>invalid</code> handler never calls <code>checkValidity()</code>/<code>reportValidity()</code>
          again: those methods are what dispatch <code>invalid</code>, so calling them would loop forever while
          any field stays invalid. The handler records <code>false</code> directly instead.
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
