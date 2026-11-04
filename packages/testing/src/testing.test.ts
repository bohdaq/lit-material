import { expect } from "@open-wc/testing";
import { html } from "lit";
import "@lit-material/button";
import "@lit-material/text-field";
import "@lit-material/checkbox";
import "@lit-material/tabs";
import "@lit-material/dialog";
import {
  accessibleName,
  cleanup,
  findByRole,
  fixture,
  getAllByRole,
  getByLabel,
  getByRole,
  getByText,
  queryByRole,
  queryDeep,
  user,
  waitFor,
  waitForUpdate,
} from "./index.js";

afterEach(() => cleanup());

describe("@lit-material/testing", () => {
  it("fixture() waits for nested updates and cleanup() removes it", async () => {
    const el = await fixture(html`<lit-material-button>Save</lit-material-button>`);
    expect(el.localName).to.equal("lit-material-button");
    expect(el.shadowRoot!.querySelector("button")).to.exist;
    cleanup();
    expect(document.querySelector("lit-material-button")).to.be.null;
  });

  it("finds a lit-material button by role and name through its shadow root", async () => {
    await fixture(html`<div><lit-material-button>Save</lit-material-button><lit-material-button>Cancel</lit-material-button></div>`);
    const save = getByRole("button", { name: "Save" });
    expect(save.localName).to.equal("button");
    expect(save.getRootNode()).to.be.instanceOf(ShadowRoot);
    expect(getAllByRole("button")).to.have.length(2);
    expect(queryByRole("button", { name: "Delete" })).to.be.null;
  });

  it("explains what it did find when nothing matches", async () => {
    await fixture(html`<lit-material-button>Save</lit-material-button>`);
    expect(() => getByRole("button", { name: "Delete" })).to.throw(/button "Save"/);
  });

  it("finds a text field's input by its label and types into it", async () => {
    let seen = "";
    await fixture(html`<lit-material-text-field label="Email" @input=${(e: Event) => (seen = (e.target as HTMLInputElement).value)}></lit-material-text-field>`);
    const input = getByLabel<HTMLInputElement>("Email");
    expect(input.localName).to.equal("input");
    await user.type(input, "ada@example.com");
    expect(input.value).to.equal("ada@example.com");
    expect(seen).to.equal("ada@example.com");
    expect(getByRole("textbox", { name: "Email" })).to.equal(input);
  });

  it("matches state: a checkbox's checked, a tab's selected", async () => {
    await fixture(html`<div>
      <lit-material-checkbox label="Remember me" checked></lit-material-checkbox>
      <lit-material-tabs selected="1"><lit-material-tab>One</lit-material-tab><lit-material-tab>Two</lit-material-tab></lit-material-tabs>
    </div>`);
    expect(getByRole("checkbox", { name: "Remember me", checked: true })).to.exist;
    expect(queryByRole("checkbox", { checked: false })).to.be.null;
    expect(accessibleName(getByRole("tab", { selected: true }))).to.equal("Two");
  });

  it("clicks and waits for the update", async () => {
    await fixture(html`<lit-material-checkbox label="Agree"></lit-material-checkbox>`);
    const box = getByRole<HTMLInputElement>("checkbox", { name: "Agree" });
    await user.click(box);
    expect(getByRole("checkbox", { name: "Agree", checked: true })).to.equal(box);
  });

  it("ignores hidden elements unless asked, and finds them appearing later", async () => {
    const host = await fixture<HTMLDivElement>(html`<div><button hidden>Ghost</button></div>`);
    expect(queryByRole("button", { name: "Ghost" })).to.be.null;
    expect(queryByRole("button", { name: "Ghost", hidden: true })).to.exist;
    setTimeout(() => host.querySelector("button")!.removeAttribute("hidden"), 50);
    expect(await findByRole("button", { name: "Ghost" })).to.exist;
  });

  it("names a dialog from its slotted headline", async () => {
    await fixture(html`<lit-material-dialog open><span slot="headline">Delete file?</span>Body</lit-material-dialog>`);
    await waitFor(() => getByRole("dialog", { name: "Delete file?" }));
  });

  it("getByText and queryDeep reach into shadow roots; press() sends keys", async () => {
    await fixture(html`<lit-material-text-field label="Name" supporting-text="As on your passport"></lit-material-text-field>`);
    expect(getByText("As on your passport").getRootNode()).to.be.instanceOf(ShadowRoot);
    const input = queryDeep<HTMLInputElement>("input")!;
    let key = "";
    input.addEventListener("keydown", (e) => (key = e.key));
    input.focus();
    await user.press("Enter");
    expect(key).to.equal("Enter");
    await waitForUpdate();
  });

  it("fixture() takes an HTML string too", async () => {
    const el = await fixture(`<lit-material-button>From string</lit-material-button>`);
    expect(getByRole("button", { name: "From string", root: el })).to.exist;
  });
});
