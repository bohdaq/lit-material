import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./inline-edit.js";
import type { LitMaterialInlineEdit } from "./inline-edit.js";

const edit = () => fixture<LitMaterialInlineEdit>(html`<lit-material-inline-edit label="Project name" value="web"></lit-material-inline-edit>`);
const button = (el: LitMaterialInlineEdit, label: string) => el.shadowRoot!.querySelector<HTMLElement>(`[aria-label="${label}"]`)!;
const field = (el: LitMaterialInlineEdit) => el.shadowRoot!.querySelector("lit-material-text-field") as HTMLElement & { errorText: string; value: string };
const settle = async (el: LitMaterialInlineEdit) => { await el.updateComplete; await new Promise((r) => setTimeout(r)); await el.updateComplete; };

describe("lit-material-inline-edit", () => {
  it("shows the value with a labelled edit button", async () => {
    const el = await edit();
    expect(el.shadowRoot!.querySelector(".value")!.textContent).to.equal("web");
    expect(button(el, "Edit Project name")).to.exist;
  });

  it("opens with the text selected, saves on Enter and fires change", async () => {
    const el = await edit();
    button(el, "Edit Project name").click();
    await settle(el);
    expect(el.editing).to.be.true;
    await sendKeys({ type: "api" }); // replaces the selected value
    const listener = oneEvent(el, "change");
    await sendKeys({ press: "Enter" });
    const { detail } = await listener;
    expect(detail).to.deep.equal({ value: "api", previous: "web" });
    expect(el.value).to.equal("api");
    expect(el.editing).to.be.false;
    await settle(el);
    expect(el.shadowRoot!.activeElement).to.equal(button(el, "Edit Project name"));
  });

  it("cancels on Escape and keeps the value", async () => {
    const el = await edit();
    await el.edit();
    await sendKeys({ type: "other" });
    const listener = oneEvent(el, "cancel");
    await sendKeys({ press: "Escape" });
    await listener;
    expect(el.editing).to.be.false;
    expect(el.value).to.equal("web");
  });

  it("awaits save and stays open with its error", async () => {
    const el = await edit();
    let resolve!: (v: string | void) => void;
    el.save = () => new Promise((r) => (resolve = r));
    await el.edit();
    await sendKeys({ type: "taken" });
    const done = el.commit();
    await el.updateComplete;
    expect(el.busy).to.be.true;
    resolve("That name is taken");
    expect(await done).to.be.false;
    await el.updateComplete;
    expect(el.editing).to.be.true;
    expect(field(el).errorText).to.equal("That name is taken");
    expect(el.value).to.equal("web");
  });

  it("shows a thrown error", async () => {
    const el = await edit();
    el.save = async () => {
      throw new Error("Network error");
    };
    await el.edit();
    await sendKeys({ type: "x" });
    expect(await el.commit()).to.be.false;
    await el.updateComplete;
    expect(field(el).errorText).to.equal("Network error");
  });

  it("refuses what the validator rejects", async () => {
    const el = await edit();
    el.validator = (v) => (v.trim() ? "" : "Required");
    await el.edit();
    await sendKeys({ press: "Backspace" });
    expect(await el.commit()).to.be.false;
    await el.updateComplete;
    expect(field(el).errorText).to.equal("Required");
  });

  it("can't be edited while disabled", async () => {
    const el = await edit();
    el.disabled = true;
    await el.edit();
    expect(el.editing).to.be.false;
  });

  it("translates its button and field labels", async () => {
    registerTranslation({
      $code: "x-inline-edit",
      "inlineEdit.editNamed": "{name} bearbeiten",
      "inlineEdit.edit": "Wert bearbeiten",
      "inlineEdit.saveNamed": "{name} speichern",
      "inlineEdit.cancelNamed": "Bearbeiten von {name} abbrechen",
      "inlineEdit.value": "Wert",
    });
    const wrapper = await fixture<HTMLDivElement>(html`<div lang="x-inline-edit">
      <lit-material-inline-edit label="Projektname" value="web"></lit-material-inline-edit>
      <lit-material-inline-edit value="web"></lit-material-inline-edit>
    </div>`);
    const [named, unnamed] = wrapper.querySelectorAll<LitMaterialInlineEdit>("lit-material-inline-edit");
    await named!.updateComplete;
    await unnamed!.updateComplete;
    expect(button(unnamed!, "Wert bearbeiten")).to.exist;
    await named!.edit();
    await settle(named!);
    expect(button(named!, "Projektname speichern")).to.exist;
    expect(button(named!, "Bearbeiten von Projektname abbrechen")).to.exist;
    await unnamed!.edit();
    await settle(unnamed!);
    expect(field(unnamed!).getAttribute("aria-label")).to.equal("Wert");
  });
});
