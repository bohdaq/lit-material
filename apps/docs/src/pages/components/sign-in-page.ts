import "@lit-material/button";
import "@lit-material/sign-in";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { LitMaterialSignIn, SignInDetail } from "@lit-material/sign-in";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-sign-in-page")
export class DocsSignInPage extends LitElement {
  static override styles = [pageStyles];

  @state() private last = "";

  override render() {
    return html`
      <h1>Sign in</h1>
      <p>A sign-in screen: email and password, a code by mail, creating an account and resetting a password, with room for single sign-on buttons. It only collects input. Your handler calls the server and sets <code>busy</code>, <code>error</code>, <code>notice</code> or <code>awaiting-code</code> from the answer.</p>
      <section>
        <h2>Try it</h2>
        <p>Any password signs in except <code>wrong</code>. Codes are "mailed" at once.</p>
        <lit-material-sign-in methods="password code sign-up forgot" @lit-material-sign-in=${this.handle}>
          <lit-material-button slot="providers" variant="outlined">Continue with Google</lit-material-button>
          <lit-material-button slot="providers" variant="outlined">Continue with GitHub</lit-material-button>
          <span slot="footer" style="font-size: 0.75rem">By signing in you accept the terms.</span>
        </lit-material-sign-in>
        <p role="status">${this.last}</p>
      </section>
      <section>
        <h2>Two steps for mailed codes</h2>
        <p>Signing in with a code, confirming a new account and resetting a password first submit the address. Send the mail, then set <code>awaiting-code</code>: the screen asks for the code (and the new password when resetting). A pasted or suggested code submits by itself.</p>
        <pre><code>${`signIn.addEventListener("lit-material-sign-in", async ({ detail }) => {
  signIn.busy = true;
  signIn.error = "";
  try {
    if (detail.method === "code" && !detail.code) {
      await api.mailCode(detail.email);
      signIn.awaitingCode = true;
    } else {
      await api.signIn(detail);
      location.assign("/");
    }
  } catch (error) {
    signIn.error = error.message;
  } finally {
    signIn.busy = false;
  }
});`}</code></pre>
      </section>
    `;
  }

  private async handle(event: CustomEvent<SignInDetail>): Promise<void> {
    const el = event.currentTarget as LitMaterialSignIn;
    const { detail } = event;
    el.busy = true;
    el.error = "";
    await new Promise((resolve) => setTimeout(resolve, 600));
    el.busy = false;
    const needsCode = detail.mode !== "sign-in" || detail.method === "code";
    if (needsCode && !detail.code) {
      el.awaitingCode = true;
      return;
    }
    if (detail.password === "wrong") {
      el.error = "Wrong email or password.";
      return;
    }
    if (detail.mode === "forgot") {
      el.mode = "sign-in";
      el.method = "password";
      el.awaitingCode = false;
      el.notice = "Password changed. Sign in with the new one.";
      return;
    }
    el.awaitingCode = false;
    this.last = `Signed in as ${detail.email}.`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-sign-in-page": DocsSignInPage;
  }
}
