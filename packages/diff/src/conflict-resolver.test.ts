import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./index.js";
import { keepBoth, type LitMaterialConflictResolver } from "./index.js";

const yours = "checks:\n  - status == 201\n  - schema: Order\n  - time < 300ms";
const theirs = "checks:\n  - status == 201\n  - header Location\n  - time < 300ms";

const result = (el: LitMaterialConflictResolver) => el.shadowRoot!.querySelector("textarea")!;
const radios = (el: LitMaterialConflictResolver) => [...el.shadowRoot!.querySelectorAll<HTMLInputElement>('input[type="radio"]')];

describe("lit-material-conflict-resolver", () => {
  it("keeps both by default: shared lines once, each side's own lines", async () => {
    const el = await fixture<LitMaterialConflictResolver>(html`<lit-material-conflict-resolver .yours=${yours} .theirs=${theirs}></lit-material-conflict-resolver>`);
    expect(el.value).to.equal(keepBoth(yours, theirs));
    expect(el.value.split("\n")).to.deep.equal(["checks:", "  - status == 201", "  - schema: Order", "  - header Location", "  - time < 300ms"]);
    expect(result(el).value).to.equal(el.value);
  });

  it("marks the lines only one side has, in text too", async () => {
    const el = await fixture<LitMaterialConflictResolver>(html`<lit-material-conflict-resolver .yours=${yours} .theirs=${theirs}></lit-material-conflict-resolver>`);
    const own = [...el.shadowRoot!.querySelectorAll("li.own-yours, li.own-theirs")].map((li) => li.textContent);
    expect(own).to.deep.equal(["Only here:   - schema: Order", "Only here:   - header Location"]);
    const notes = [...el.shadowRoot!.querySelectorAll(".sides .note")].map((n) => n.textContent);
    expect(notes).to.deep.equal(["1 line only here", "1 line only here"]);
  });

  it("is a radio group whose choice sets the result and fires change", async () => {
    const el = await fixture<LitMaterialConflictResolver>(html`<lit-material-conflict-resolver .yours=${yours} .theirs=${theirs}></lit-material-conflict-resolver>`);
    expect(el.shadowRoot!.querySelector("fieldset legend")!.textContent).to.equal("Keep");
    const [mine, theirsRadio] = radios(el);
    const changed = oneEvent(el, "change");
    theirsRadio.click();
    expect((await changed).detail).to.deep.equal({ choice: "theirs" });
    await el.updateComplete;
    expect(result(el).value).to.equal(theirs);
    mine.click();
    await el.updateComplete;
    expect(result(el).value).to.equal(yours);
  });

  it("an edited result is kept and resolve says so", async () => {
    const el = await fixture<LitMaterialConflictResolver>(html`<lit-material-conflict-resolver .yours=${yours} .theirs=${theirs} choice="yours"></lit-material-conflict-resolver>`);
    const ta = result(el);
    ta.value = "checks: []";
    ta.dispatchEvent(new Event("input"));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".result .note")!.textContent).to.equal("Edited");
    const resolved = oneEvent(el, "resolve");
    el.shadowRoot!.querySelector<HTMLButtonElement>('[part="resolve"]')!.click();
    expect((await resolved).detail).to.deep.equal({ text: "checks: []", choice: "yours", edited: true });
  });

  it("labels each pane with its heading", async () => {
    const el = await fixture<LitMaterialConflictResolver>(
      html`<lit-material-conflict-resolver yours="a" theirs="b" yours-label="Priya" theirs-note="Jonas · 10:31"></lit-material-conflict-resolver>`,
    );
    const panes = [...el.shadowRoot!.querySelectorAll("section")];
    const names = panes.map((s) => el.shadowRoot!.getElementById(s.getAttribute("aria-labelledby")!)!.textContent);
    expect(names).to.deep.equal(["Priya", "Theirs", "Result"]);
    expect(el.shadowRoot!.querySelector("textarea")!.getAttribute("aria-labelledby")).to.equal(panes[2].getAttribute("aria-labelledby"));
    expect(panes[1].querySelector(".note")!.textContent).to.contain("Jonas · 10:31");
  });

  it("keeps a value set by the page", async () => {
    const el = await fixture<LitMaterialConflictResolver>(html`<lit-material-conflict-resolver yours="a" theirs="b" value="merged"></lit-material-conflict-resolver>`);
    expect(result(el).value).to.equal("merged");
  });
});
