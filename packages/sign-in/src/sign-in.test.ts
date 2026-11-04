import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./sign-in.js";
import type { LitMaterialSignIn } from "./sign-in.js";

type Field = HTMLElement & { value: string; name: string; updateComplete: Promise<unknown> };

const signIn = (methods = "password code sign-up forgot") =>
  fixture<LitMaterialSignIn>(html`<lit-material-sign-in methods=${methods}>
    <button slot="providers">Continue with Google</button>
  </lit-material-sign-in>`);
const field = (el: LitMaterialSignIn, name: string) =>
  el.shadowRoot!.querySelector<Field>(`form [name="${name}"]`);
const fill = async (el: LitMaterialSignIn, name: string, value: string) => {
  const f = field(el, name)!;
  f.value = value;
  f.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  await f.updateComplete;
};
const submit = (el: LitMaterialSignIn) => el.shadowRoot!.querySelector("form")!.requestSubmit();
const link = (el: LitMaterialSignIn, text: string) =>
  [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".link")].find((b) => b.textContent!.trim() === text);
const heading = (el: LitMaterialSignIn) => el.shadowRoot!.querySelector("h1")!.textContent;

describe("lit-material-sign-in", () => {
  it("signs in with email and password", async () => {
    const el = await signIn();
    expect(heading(el)).to.equal("Sign in");
    await fill(el, "email", " ada@example.com ");
    await fill(el, "password", "correct horse");
    const sent = oneEvent(el, "lit-material-sign-in");
    submit(el);
    expect((await sent).detail).to.deep.equal({ mode: "sign-in", method: "password", email: "ada@example.com", password: "correct horse" });
  });

  it("doesn't submit with an empty required field", async () => {
    const el = await signIn();
    let fired = 0;
    el.addEventListener("lit-material-sign-in", () => fired++);
    await fill(el, "email", "ada@example.com");
    submit(el);
    expect(fired).to.equal(0);
  });

  it("shows the provider buttons with an or divider, only on the sign-in view", async () => {
    const el = await signIn();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector<HTMLElement>(".providers")!.hidden).to.be.false;
    expect(el.shadowRoot!.querySelector<HTMLElement>(".divider")!.hidden).to.be.false;
    link(el, "Create an account")!.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector<HTMLElement>(".providers")!.hidden).to.be.true;
  });

  it("mails a code in two steps: the address, then the code", async () => {
    const el = await signIn();
    const view = oneEvent(el, "lit-material-sign-in-view-change");
    link(el, "Email me a code instead")!.click();
    expect((await view).detail).to.deep.equal({ mode: "sign-in", method: "code" });
    await el.updateComplete;
    expect(field(el, "password")).to.not.exist;
    await fill(el, "email", "ada@example.com");
    const first = oneEvent(el, "lit-material-sign-in");
    submit(el);
    expect((await first).detail).to.deep.equal({ mode: "sign-in", method: "code", email: "ada@example.com" });

    el.awaitingCode = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".intro")!.textContent).to.equal("We sent a code to ada@example.com.");
    const second = oneEvent(el, "lit-material-sign-in");
    const code = field(el, "code")!;
    await code.updateComplete;
    const input = code.shadowRoot!.querySelector("input")!;
    input.value = "123456"; // a pasted or suggested code submits by itself
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    expect((await second).detail).to.deep.equal({ mode: "sign-in", method: "code", email: "ada@example.com", code: "123456" });
  });

  it("resets a password: the address, then the code and a new password", async () => {
    const el = await signIn();
    link(el, "Forgot password?")!.click();
    await el.updateComplete;
    expect(heading(el)).to.equal("Reset your password");
    el.email = "ada@example.com";
    el.awaitingCode = true;
    await el.updateComplete;
    expect(heading(el)).to.equal("Set a new password");
    await fill(el, "code", "654321");
    await fill(el, "password", "a much better one");
    const sent = oneEvent(el, "lit-material-sign-in");
    submit(el);
    expect((await sent).detail).to.deep.equal({ mode: "forgot", method: "password", email: "ada@example.com", code: "654321", password: "a much better one" });
  });

  it("creates an account with a new password", async () => {
    const el = await signIn();
    link(el, "Create an account")!.click();
    await el.updateComplete;
    expect(field(el, "password")!.getAttribute("autocomplete")).to.equal("new-password");
    expect(link(el, "Back to sign in")).to.exist;
  });

  it("offers only the links for the methods the server has", async () => {
    const el = await signIn("password");
    expect(link(el, "Forgot password?")).to.not.exist;
    expect(link(el, "Email me a code instead")).to.not.exist;
    expect(link(el, "Create an account")).to.not.exist;
  });

  it("shows errors and notices, and turns the form off while busy", async () => {
    const el = await signIn();
    el.error = "Wrong email or password.";
    el.busy = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("lit-material-alert")!.textContent).to.contain("Wrong email or password.");
    const button = el.shadowRoot!.querySelector<HTMLElement & { disabled: boolean }>("lit-material-button")!;
    expect(button.disabled).to.be.true;
    expect(button.textContent).to.equal("Working…");
  });

  it("moves focus to the first field after switching view", async () => {
    const el = await signIn();
    link(el, "Create an account")!.click();
    await el.updateComplete;
    await field(el, "email")!.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    expect(el.shadowRoot!.activeElement).to.equal(field(el, "email"));
  });

  it("is accessible", async () => {
    const el = await signIn();
    await expect(el).to.be.accessible();
  });
});
