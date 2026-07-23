import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./code-block.js";
import type { LitMaterialCodeBlock } from "./code-block.js";

describe("lit-material-code-block", () => {
  it("renders slotted code content inside pre/code", async () => {
    const el = await fixture<LitMaterialCodeBlock>(html`<lit-material-code-block>const x = 1;</lit-material-code-block>`);
    const code = el.shadowRoot!.querySelector("pre > code")!;
    expect(code).to.exist;
    expect(el.textContent!.trim()).to.equal("const x = 1;");
  });

  it("shows the header (with a copy button) by default", async () => {
    const el = await fixture<LitMaterialCodeBlock>(html`<lit-material-code-block>const x = 1;</lit-material-code-block>`);
    expect(el.shadowRoot!.querySelector(".header")).to.exist;
    expect(el.shadowRoot!.querySelector(".copy")).to.exist;
  });

  it("hides the header entirely when there's no label and copyable is false", async () => {
    const el = await fixture<LitMaterialCodeBlock>(
      html`<lit-material-code-block .copyable=${false}>const x = 1;</lit-material-code-block>`,
    );
    expect(el.shadowRoot!.querySelector(".header")).to.not.exist;
  });

  it("shows the header for a label alone, even with copyable=false", async () => {
    const el = await fixture<LitMaterialCodeBlock>(
      html`<lit-material-code-block label="index.ts" .copyable=${false}>const x = 1;</lit-material-code-block>`,
    );
    const header = el.shadowRoot!.querySelector(".header");
    expect(header).to.exist;
    expect(header!.querySelector(".label")!.textContent).to.equal("index.ts");
    expect(header!.querySelector(".copy")).to.not.exist;
  });

  it("copy() writes the element's text content to the clipboard, sets copied, and fires copy", async () => {
    const el = await fixture<LitMaterialCodeBlock>(html`<lit-material-code-block>const x = 1;</lit-material-code-block>`);
    let writtenText: string | undefined;
    const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = (text: string) => {
      writtenText = text;
      return Promise.resolve();
    };
    try {
      const copyEvent = oneEvent(el, "copy");
      await el.copy();
      await copyEvent;
      expect(writtenText).to.equal("const x = 1;");
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector(".copy")!.textContent!.trim()).to.equal("Copied");
    } finally {
      navigator.clipboard.writeText = originalWriteText;
    }
  });

  it("clicking the copy button triggers copy()", async () => {
    const el = await fixture<LitMaterialCodeBlock>(html`<lit-material-code-block>const x = 1;</lit-material-code-block>`);
    const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = () => Promise.resolve();
    try {
      const copyEvent = oneEvent(el, "copy");
      (el.shadowRoot!.querySelector(".copy") as HTMLButtonElement).click();
      await copyEvent;
    } finally {
      navigator.clipboard.writeText = originalWriteText;
    }
  });

  it("does not render an expand toggle by default", async () => {
    const el = await fixture<LitMaterialCodeBlock>(html`<lit-material-code-block>const x = 1;</lit-material-code-block>`);
    expect(el.shadowRoot!.querySelector(".expand-toggle")).to.not.exist;
  });

  it("renders an expand toggle when expandable, and toggles expanded on click", async () => {
    const el = await fixture<LitMaterialCodeBlock>(html`<lit-material-code-block expandable>const x = 1;</lit-material-code-block>`);
    const toggle = el.shadowRoot!.querySelector(".expand-toggle") as HTMLButtonElement;
    expect(toggle).to.exist;
    expect(toggle.textContent!.trim()).to.equal("Show more");
    expect(el.expanded).to.be.false;

    toggle.click();
    await el.updateComplete;
    expect(el.expanded).to.be.true;
    expect(toggle.textContent!.trim()).to.equal("Show less");
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialCodeBlock>(
      html`<lit-material-code-block label="index.ts">const x = 1;</lit-material-code-block>`,
    );
    await expect(el).to.be.accessible();
  });
});
