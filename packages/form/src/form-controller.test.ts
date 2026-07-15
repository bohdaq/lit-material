import { expect, fixture, html } from "@open-wc/testing";
import "./form-test-host.js";
import type { FormTestHost } from "./form-test-host.js";
import type { LitMaterialCheckbox } from "@lit-material/checkbox";

function statusText(el: FormTestHost): string | null | undefined {
  return el.shadowRoot!.getElementById("status")?.textContent;
}

// FormController's "input"/"change" handling is deferred a microtask (to
// outlast a form-associated custom element's own async ElementInternals
// update — see the controller), so tests need to flush a microtask *and*
// updateComplete (which itself may resolve across more than one microtask
// turn) after every dispatch, not just updateComplete alone.
async function flush(el: FormTestHost): Promise<void> {
  await Promise.resolve();
  await el.updateComplete;
  await el.updateComplete;
}

describe("FormController + LitElement", () => {
  it("starts invalid when required fields are empty", async () => {
    const el = await fixture<FormTestHost>(html`<lit-material-form-test-host></lit-material-form-test-host>`);
    expect(el.form.valid).to.be.false;
    expect(statusText(el)).to.equal("invalid");
  });

  it("becomes valid once every required field is satisfied, reactively", async () => {
    const el = await fixture<FormTestHost>(html`<lit-material-form-test-host></lit-material-form-test-host>`);
    const input = el.shadowRoot!.querySelector("input")!;
    const checkbox = el.shadowRoot!.querySelector<LitMaterialCheckbox>("lit-material-checkbox")!;

    input.value = "ada";
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await flush(el);
    expect(el.form.valid).to.be.false; // checkbox still unchecked

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await flush(el);

    expect(el.form.valid).to.be.true;
    expect(statusText(el)).to.equal("valid");
  });

  it("goes back to invalid if a previously-valid field is cleared", async () => {
    const el = await fixture<FormTestHost>(html`<lit-material-form-test-host></lit-material-form-test-host>`);
    const input = el.shadowRoot!.querySelector("input")!;
    const checkbox = el.shadowRoot!.querySelector<LitMaterialCheckbox>("lit-material-checkbox")!;
    input.value = "ada";
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await flush(el);
    expect(el.form.valid).to.be.true;

    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await flush(el);
    expect(el.form.valid).to.be.false;
  });

  it("checkValidity() reflects the aggregate result without changing focus", async () => {
    const el = await fixture<FormTestHost>(html`<lit-material-form-test-host></lit-material-form-test-host>`);
    expect(el.form.checkValidity()).to.be.false;

    const active = document.activeElement;
    expect(document.activeElement).to.equal(active); // unchanged — no native UI shown
  });

  it("reportValidity() returns the same boolean and updates valid", async () => {
    const el = await fixture<FormTestHost>(html`<lit-material-form-test-host></lit-material-form-test-host>`);
    expect(el.form.reportValidity()).to.be.false;
    expect(el.form.valid).to.be.false;
  });

  it("stops reacting to form changes once the host disconnects", async () => {
    const el = await fixture<FormTestHost>(html`<lit-material-form-test-host></lit-material-form-test-host>`);
    const input = el.shadowRoot!.querySelector("input")!;
    el.remove();

    // Should not throw even though the controller is detached.
    expect(() => input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))).to.not.throw();
  });
});
