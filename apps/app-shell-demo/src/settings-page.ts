import "@lit-material/text-field";
import "@lit-material/button";
import "@lit-material/card";
import { FormController } from "@lit-material/form";
import { LitElement, html, css } from "lit";
import { customElement, query, state } from "lit/decorators.js";

@customElement("demo-settings-page")
export class DemoSettingsPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
  `;

  @query("form") private readonly formEl?: HTMLFormElement;
  private readonly form = new FormController(this, () => this.formEl);

  @state() private saved = false;

  override render() {
    return html`
      <lit-material-card variant="elevated">
        <h1>Form validation</h1>
        <p>
          Backed by <code>@lit-material/form</code>'s <code>FormController</code>, which makes the native
          <code>form.checkValidity()</code> aggregate <em>reactive</em> — the Save button below disables
          itself as you type an invalid email, instead of only failing once you submit.
        </p>
        <form @submit=${this.handleSubmit}>
          <lit-material-text-field
            name="email"
            label="Email"
            type="email"
            required
            @input=${() => (this.saved = false)}
          ></lit-material-text-field>
          <lit-material-button type="submit" ?disabled=${!this.form.valid}>Save</lit-material-button>
          ${this.saved ? html`<p>Saved.</p>` : null}
        </form>
      </lit-material-card>
    `;
  }

  private readonly handleSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    if (this.form.reportValidity()) this.saved = true;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-settings-page": DemoSettingsPage;
  }
}
