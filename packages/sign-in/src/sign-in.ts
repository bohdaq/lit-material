import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import "@lit-material/alert";
import "@lit-material/button/button.js";
import "@lit-material/text-field/text-field.js";
import "@lit-material/text-field/one-time-code.js";

export type SignInMode = "sign-in" | "sign-up" | "forgot";
export type SignInMethod = "password" | "code";

/** `detail` of `lit-material-sign-in`: what the reader submitted. The app calls its server with it. */
export interface SignInDetail {
  mode: SignInMode;
  /** For `mode: "sign-in"`: with a password or a mailed code. */
  method: SignInMethod;
  email: string;
  /** The password (sign in, sign up) or the new one (forgot, with `code`). */
  password?: string;
  /** The mailed code, once `awaiting-code` is set. */
  code?: string;
}

/** `detail` of `lit-material-sign-in-view-change`. */
export interface SignInViewDetail {
  mode: SignInMode;
  method: SignInMethod;
}

const tokens = (value: string) => new Set(value.split(/\s+/).filter(Boolean));

/**
 * A sign-in screen: email and password, a code sent by mail, creating an
 * account and resetting a forgotten password, with room for "Continue with
 * Google" style buttons. It only collects input: listen for
 * `lit-material-sign-in`, call your server, then set `busy`, `error`,
 * `notice` or `awaiting-code` from the answer.
 *
 * Flows that mail a code are two steps. The first submit carries the
 * address; once the mail is sent, set `awaiting-code` and the screen asks for
 * the code (and, when resetting, the new password). Switching between the
 * views is handled here and reported with `lit-material-sign-in-view-change`.
 *
 * @element lit-material-sign-in
 *
 * @slot logo - Above the heading.
 * @slot providers - Single sign-on buttons, shown above the form with an "or" divider.
 * @slot footer - Under everything: terms, the server in use, help links.
 *
 * @csspart card - The outer box.
 * @csspart form - The form.
 *
 * @cssprop --lit-material-sign-in-width - Width of the card (default `400px`, never wider than its container).
 *
 * @fires lit-material-sign-in - The form was submitted; `detail` is `SignInDetail`.
 * @fires lit-material-sign-in-view-change - The reader switched view; `detail` is `{ mode, method }`.
 */
@customElement("lit-material-sign-in")
export class LitMaterialSignIn extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: min(100%, var(--lit-material-sign-in-width, 400px));
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    }
    :host([hidden]) {
      display: none;
    }
    .card {
      display: grid;
      gap: 20px;
      box-sizing: border-box;
      padding: 32px 24px;
      border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
      border-radius: var(--md-sys-shape-corner-extra-large, 28px);
      background: var(--md-sys-color-surface-container-low, light-dark(#f7f2fa, #1d1b20));
    }
    h1 {
      margin: 0;
      font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
      font-weight: var(--md-sys-typescale-headline-small-weight, 400);
      line-height: 1.3;
    }
    .intro {
      margin: 4px 0 0;
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    .providers {
      display: grid;
      gap: 8px;
    }
    .providers[hidden],
    .divider[hidden] {
      display: none;
    }
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    .divider::before,
    .divider::after {
      content: "";
      flex: 1;
      border-top: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    }
    form {
      display: grid;
      gap: 16px;
    }
    lit-material-text-field {
      --lit-material-text-field-min-width: 0;
    }
    lit-material-one-time-code {
      justify-self: center;
    }
    lit-material-button[type="submit"] {
      justify-self: start;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 4px 16px;
    }
    .link {
      padding: 4px 0;
      border: 0;
      background: none;
      color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      font: inherit;
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      text-decoration: underline;
      text-underline-offset: 2px;
      cursor: pointer;
    }
    .link:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
      border-radius: 2px;
    }
    .link:disabled {
      opacity: 0.38;
      cursor: default;
    }
  `;

  /** Which flow is showing. */
  @property({ reflect: true }) mode: SignInMode = "sign-in";

  /** How to sign in, in `mode="sign-in"`. */
  @property({ reflect: true }) method: SignInMethod = "password";

  /**
   * What the server offers, space-separated: `password`, `code` (a sign-in code by mail), `sign-up`, `forgot`.
   * Links to the other views appear only for these.
   */
  @property() methods = "password";

  /** The address, kept across views. Set it to prefill. */
  @property() email = "";

  /** The code is mailed: ask for it (and the new password when resetting). */
  @property({ type: Boolean, reflect: true, attribute: "awaiting-code" }) awaitingCode = false;

  /** A request is running: the form is off and the button says so. */
  @property({ type: Boolean, reflect: true }) busy = false;

  /** The server's refusal, shown above the form. */
  @property() error = "";

  /** A note shown above the form, e.g. "Password changed. Sign in with the new one." */
  @property() notice = "";

  /** Overrides the heading of the current view. */
  @property() heading = "";

  /** Characters in the mailed code. */
  @property({ type: Number, attribute: "code-length" }) codeLength = 6;

  /** Shortest password accepted when creating one. */
  @property({ type: Number, attribute: "password-minlength" }) passwordMinlength = 8;

  @state() private hasProviders = false;

  private readonly localize = new LocalizeController(this);

  protected override updated(changed: Map<string, unknown>): void {
    // After switching view (not on the first render: the page decides where focus starts), put the reader in
    // the first field. Wait for it to render its own input first.
    const switched = ["mode", "method", "awaitingCode"].some((key) => changed.has(key) && changed.get(key) !== undefined);
    if (!switched) return;
    const first = this.renderRoot.querySelector<LitElement>("form lit-material-text-field, form lit-material-one-time-code");
    void first?.updateComplete.then(() => first.focus());
  }


  override render() {
    const offered = tokens(this.methods);
    const view = this.view();
    const showProviders = this.mode === "sign-in" && !this.awaitingCode;
    return html`
      <div class="card" part="card">
        <slot name="logo"></slot>
        <div>
          <h1>${this.heading || view.heading}</h1>
          ${view.intro ? html`<p class="intro">${view.intro}</p>` : nothing}
        </div>
        ${this.error ? html`<lit-material-alert variant="error">${this.error}</lit-material-alert>` : nothing}
        ${this.notice && !this.error ? html`<lit-material-alert variant="info">${this.notice}</lit-material-alert>` : nothing}
        <div class="providers" ?hidden=${!showProviders || !this.hasProviders}>
          <slot
            name="providers"
            @slotchange=${(e: Event) => (this.hasProviders = (e.target as HTMLSlotElement).assignedElements().length > 0)}
          ></slot>
        </div>
        <div class="divider" ?hidden=${!showProviders || !this.hasProviders || !(offered.has("password") || offered.has("code"))}>
          ${this.localize.term("signIn.or", "or")}
        </div>
        ${!showProviders || offered.has("password") || offered.has("code")
          ? html`<form part="form" novalidate @submit=${this.handleSubmit} aria-busy=${this.busy ? "true" : "false"}>
              ${view.fields}
              <lit-material-button type="submit" ?disabled=${this.busy}>${this.busy ? this.localize.term("signIn.working", "Working…") : view.submit}</lit-material-button>
            </form>`
          : nothing}
        <div class="links">${this.links(offered)}</div>
        <slot name="footer"></slot>
      </div>
    `;
  }

  private emailField() {
    return html`<lit-material-text-field
      name="email"
      type="email"
      autocomplete="username"
      required
      ?disabled=${this.busy}
      label=${this.localize.term("signIn.email", "Email")}
      .value=${this.email}
      @input=${(e: Event) => (this.email = (e.target as HTMLInputElement).value)}
    ></lit-material-text-field>`;
  }

  private codeField() {
    return html`<lit-material-one-time-code
      name="code"
      required
      ?disabled=${this.busy}
      length=${this.codeLength}
      label=${this.localize.term("signIn.code", "Code from the email")}
      @complete=${this.handleCodeComplete}
    ></lit-material-one-time-code>`;
  }

  private passwordField(fresh: boolean) {
    return html`<lit-material-text-field
      name="password"
      type="password"
      required
      ?disabled=${this.busy}
      autocomplete=${fresh ? "new-password" : "current-password"}
      minlength=${fresh ? this.passwordMinlength : nothing}
      supporting-text=${fresh ? this.localize.term("signIn.passwordHint", "At least {min} characters", { min: this.passwordMinlength }) : ""}
      label=${fresh ? this.localize.term("signIn.newPassword", "New password") : this.localize.term("signIn.password", "Password")}
    ></lit-material-text-field>`;
  }

  private view(): { heading: string; intro: string; fields: unknown; submit: string } {
    const sentTo = this.localize.term("signIn.codeSent", "We sent a code to {email}.", { email: this.email });
    if (this.mode === "sign-up") {
      return this.awaitingCode
        ? { heading: this.localize.term("signIn.confirmHeading", "Confirm your email"), intro: sentTo, fields: this.codeField(), submit: this.localize.term("signIn.confirm", "Confirm") }
        : {
            heading: this.localize.term("signIn.signUpHeading", "Create an account"),
            intro: "",
            fields: html`${this.emailField()}${this.passwordField(true)}`,
            submit: this.localize.term("signIn.signUp", "Create account"),
          };
    }
    if (this.mode === "forgot") {
      return this.awaitingCode
        ? {
            heading: this.localize.term("signIn.resetHeading", "Set a new password"),
            intro: sentTo,
            fields: html`${this.codeField()}${this.passwordField(true)}`,
            submit: this.localize.term("signIn.setPassword", "Set password"),
          }
        : {
            heading: this.localize.term("signIn.forgotHeading", "Reset your password"),
            intro: this.localize.term("signIn.forgotIntro", "Enter your email and we'll send you a code."),
            fields: this.emailField(),
            submit: this.localize.term("signIn.sendResetCode", "Send code"),
          };
    }
    if (this.method === "code") {
      return this.awaitingCode
        ? { heading: this.localize.term("signIn.heading", "Sign in"), intro: sentTo, fields: this.codeField(), submit: this.localize.term("signIn.signIn", "Sign in") }
        : {
            heading: this.localize.term("signIn.heading", "Sign in"),
            intro: this.localize.term("signIn.codeIntro", "We'll email you a code to sign in."),
            fields: this.emailField(),
            submit: this.localize.term("signIn.sendCode", "Email me a code"),
          };
    }
    return {
      heading: this.localize.term("signIn.heading", "Sign in"),
      intro: "",
      fields: html`${this.emailField()}${this.passwordField(false)}`,
      submit: this.localize.term("signIn.signIn", "Sign in"),
    };
  }

  private links(offered: Set<string>) {
    const link = (label: string, mode: SignInMode, method: SignInMethod = this.method) =>
      html`<button type="button" class="link" ?disabled=${this.busy} @click=${() => this.go(mode, method)}>${label}</button>`;
    const out = [];
    if (this.awaitingCode) {
      out.push(html`<button type="button" class="link" ?disabled=${this.busy} @click=${() => this.go(this.mode, this.method)}>
        ${this.localize.term("signIn.differentEmail", "Use a different email")}
      </button>`);
    }
    if (this.mode === "sign-in" && !this.awaitingCode) {
      if (this.method === "password" && offered.has("forgot")) out.push(link(this.localize.term("signIn.forgot", "Forgot password?"), "forgot"));
      if (this.method === "password" && offered.has("code")) out.push(link(this.localize.term("signIn.useCode", "Email me a code instead"), "sign-in", "code"));
      if (this.method === "code" && offered.has("password")) out.push(link(this.localize.term("signIn.usePassword", "Use a password instead"), "sign-in", "password"));
      if (offered.has("sign-up")) out.push(link(this.localize.term("signIn.toSignUp", "Create an account"), "sign-up"));
    }
    if (this.mode !== "sign-in") {
      out.push(link(this.localize.term("signIn.toSignIn", "Back to sign in"), "sign-in", offered.has("password") ? "password" : "code"));
    }
    return out;
  }

  /** Shows another view (and drops a pending code step and any message). */
  private go(mode: SignInMode, method: SignInMethod): void {
    this.mode = mode;
    this.method = method;
    this.awaitingCode = false;
    this.error = "";
    this.notice = "";
    this.dispatchEvent(
      new CustomEvent<SignInViewDetail>("lit-material-sign-in-view-change", { detail: { mode, method }, bubbles: true, composed: true }),
    );
  }

  private handleCodeComplete(): void {
    // Codes pasted or suggested by the phone submit at once; a lone password field still waits for the reader.
    if (this.mode !== "forgot") this.renderRoot.querySelector("form")?.requestSubmit();
  }

  private handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (this.busy) return;
    const form = event.target as HTMLFormElement;
    const fields = [...form.querySelectorAll<HTMLElement & { name: string; value: string; reportValidity(): boolean }>(
      "lit-material-text-field, lit-material-one-time-code",
    )];
    const invalid = fields.find((field) => !field.reportValidity());
    if (invalid) {
      invalid.focus();
      return;
    }
    const value = (name: string) => fields.find((field) => field.name === name)?.value;
    const detail: SignInDetail = { mode: this.mode, method: this.mode === "sign-in" ? this.method : "password", email: this.email.trim() };
    const password = value("password");
    const code = value("code");
    if (password !== undefined) detail.password = password;
    if (code !== undefined) detail.code = code;
    this.dispatchEvent(new CustomEvent<SignInDetail>("lit-material-sign-in", { detail, bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-sign-in": LitMaterialSignIn;
  }
}
