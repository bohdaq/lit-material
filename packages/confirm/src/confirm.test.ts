import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./confirm-dialog.js";
import type { LitMaterialConfirmDialog } from "./confirm-dialog.js";
import { confirm } from "./confirm.js";

const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r)));

function parts(el: LitMaterialConfirmDialog) {
  const root = el.shadowRoot!;
  return {
    native: root.querySelector("lit-material-dialog")!.shadowRoot!.querySelector("dialog")!,
    cancel: root.querySelector<HTMLElement>("lit-material-button.cancel")!,
    ok: root.querySelector<HTMLElement & { disabled: boolean }>("lit-material-button.confirm")!,
    field: root.querySelector<HTMLElement & { value: string }>("lit-material-text-field"),
  };
}

async function opened(template = html`<lit-material-confirm-dialog headline="Purge cache?" message="Entries are refetched."></lit-material-confirm-dialog>`) {
  const el = await fixture<LitMaterialConfirmDialog>(template);
  const result = el.show();
  await el.updateComplete;
  await frame();
  return { el, result };
}

describe("lit-material-confirm-dialog", () => {
  it("opens modally with the headline and message", async () => {
    const { el } = await opened();
    const { native } = parts(el);
    expect(native.open).to.be.true;
    expect(el.shadowRoot!.textContent).to.contain("Purge cache?");
    expect(el.shadowRoot!.textContent).to.contain("Entries are refetched.");
  });

  it("focuses Cancel, so a stray Enter doesn't confirm", async () => {
    const { el } = await opened();
    expect(el.shadowRoot!.activeElement).to.equal(parts(el).cancel);
  });

  it("resolves true on confirm", async () => {
    const { el, result } = await opened();
    parts(el).ok.shadowRoot!.querySelector("button")!.click();
    expect(await result).to.be.true;
    expect(el.returnValue).to.equal("confirm");
    expect(el.open).to.be.false;
  });

  it("resolves false on cancel and on Escape", async () => {
    let { el, result } = await opened();
    parts(el).cancel.click();
    expect(await result).to.be.false;
    ({ el, result } = await opened());
    await sendKeys({ press: "Escape" });
    expect(await result).to.be.false;
    expect(el.returnValue).to.equal("cancel");
  });

  it("fires one close event", async () => {
    const { el, result } = await opened();
    let closes = 0;
    el.addEventListener("close", () => closes++);
    parts(el).ok.shadowRoot!.querySelector("button")!.click();
    await result;
    expect(closes).to.equal(1);
  });

  it("requires the exact text before confirming", async () => {
    const { el, result } = await opened(html`<lit-material-confirm-dialog headline="Delete web?" require-text="web" destructive></lit-material-confirm-dialog>`);
    const { ok, field } = parts(el);
    expect(field).to.not.be.null;
    expect(ok.disabled).to.be.true;
    await sendKeys({ type: "we" });
    await el.updateComplete;
    expect(ok.disabled).to.be.true;
    await sendKeys({ press: "Enter" });
    await el.updateComplete;
    expect(el.open, "Enter does nothing until it matches").to.be.true;
    await sendKeys({ type: "b" });
    await el.updateComplete;
    expect(ok.disabled).to.be.false;
    await sendKeys({ press: "Enter" });
    expect(await result).to.be.true;
  });

  it("clears the typed text on reopen", async () => {
    const { el } = await opened(html`<lit-material-confirm-dialog headline="Delete web?" require-text="web"></lit-material-confirm-dialog>`);
    await sendKeys({ type: "web" });
    el.close(false);
    await el.updateComplete;
    void el.show();
    await el.updateComplete;
    expect(parts(el).ok.disabled).to.be.true;
  });
});

describe("confirm()", () => {
  it("creates, awaits and removes a dialog", async () => {
    const result = confirm({ headline: "Restart server?", confirmLabel: "Restart" });
    await frame();
    const el = document.querySelector("lit-material-confirm-dialog")!;
    expect(el).to.not.be.null;
    expect(el.shadowRoot!.textContent).to.contain("Restart");
    parts(el).ok.shadowRoot!.querySelector("button")!.click();
    expect(await result).to.be.true;
    expect(document.querySelector("lit-material-confirm-dialog")).to.be.null;
  });
});
