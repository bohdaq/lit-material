import "@lit-material/sign-in";
import { navigate } from "@lit-material/router";
import type { LitMaterialSignIn, SignInDetail } from "@lit-material/sign-in";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { signIn } from "../api.js";

@customElement("sign-in-page")
export class SignInPage extends LitElement {
  static override styles = css`
    :host {
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 16px;
      box-sizing: border-box;
    }
  `;

  override render() {
    return html`<lit-material-sign-in methods="password forgot" @lit-material-sign-in=${this.handle}>
      <strong slot="logo">{{PROJECT_NAME}}</strong>
    </lit-material-sign-in>`;
  }

  private async handle(event: CustomEvent<SignInDetail>): Promise<void> {
    const form = event.currentTarget as LitMaterialSignIn;
    const { detail } = event;
    form.busy = true;
    form.error = "";
    try {
      if (detail.mode === "forgot" && !detail.code) {
        form.awaitingCode = true; // mail the code here
        return;
      }
      await signIn(detail.email, detail.password ?? "");
      navigate("/");
    } catch (error) {
      form.error = error instanceof Error ? error.message : String(error);
    } finally {
      form.busy = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sign-in-page": SignInPage;
  }
}
