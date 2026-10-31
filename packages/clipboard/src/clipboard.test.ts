import { expect, fixture, html } from "@open-wc/testing";
import "./copy-button.js";
import "./clipboard-copy.js";
import type { LitMaterialCopyButton } from "./copy-button.js";
import type { LitMaterialClipboardCopy } from "./clipboard-copy.js";
import { copyText } from "./copy-text.js";

let written: string[] = [];
let clipboardFails = false;
let execResult = true;
let execCalls = 0;
const realClipboard = Object.getOwnPropertyDescriptor(Navigator.prototype, "clipboard");
const realExec = document.execCommand.bind(document);

beforeEach(() => {
  written = [];
  clipboardFails = false;
  execResult = true;
  execCalls = 0;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (t: string) => {
        if (clipboardFails) throw new DOMException("denied", "NotAllowedError");
        written.push(t);
      },
    },
  });
  document.execCommand = ((cmd: string) => {
    execCalls++;
    return cmd === "copy" ? execResult : false;
  }) as typeof document.execCommand;
});

afterEach(() => {
  delete (navigator as unknown as Record<string, unknown>).clipboard;
  if (realClipboard) Object.defineProperty(Navigator.prototype, "clipboard", realClipboard);
  document.execCommand = realExec;
});

describe("copyText", () => {
  it("uses the Clipboard API", async () => {
    expect(await copyText("hello")).to.be.true;
    expect(written).to.deep.equal(["hello"]);
    expect(execCalls).to.equal(0);
  });

  it("falls back when the Clipboard API rejects", async () => {
    clipboardFails = true;
    expect(await copyText("x")).to.be.true;
    expect(execCalls).to.equal(1);
    expect(document.querySelector("textarea")).to.be.null;
  });

  it("falls back when there is no Clipboard API, and reports failure", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    execResult = false;
    expect(await copyText("x")).to.be.false;
    expect(execCalls).to.equal(1);
  });
});

describe("lit-material-copy-button", () => {
  const click = (el: HTMLElement) => el.shadowRoot!.querySelector("lit-material-icon-button")!.shadowRoot!.querySelector("button")!.click();

  it("copies its value, shows a check and announces it", async () => {
    const el = await fixture<LitMaterialCopyButton>(html`<lit-material-copy-button value="https://rws8.tech" label="Copy URL"></lit-material-copy-button>`);
    let detail: { text: string; ok: boolean } | undefined;
    el.addEventListener("copy", (e) => (detail = (e as CustomEvent).detail));
    expect(await el.copy()).to.be.true;
    await el.updateComplete;
    expect(written).to.deep.equal(["https://rws8.tech"]);
    expect(detail).to.deep.equal({ text: "https://rws8.tech", ok: true });
    expect(el.shadowRoot!.querySelector("[role=status]")!.textContent).to.equal("Copied");
    expect(el.shadowRoot!.querySelector("lit-material-icon-button")!.getAttribute("aria-label")).to.equal("Copy URL");
  });

  it("copies from the element named in `for`", async () => {
    const wrap = await fixture<HTMLDivElement>(html`<div>
      <input id="cmd" value="rws --config rws.toml" />
      <pre id="pre"> kubectl get pods </pre>
      <lit-material-copy-button for="cmd"></lit-material-copy-button>
      <lit-material-copy-button for="pre"></lit-material-copy-button>
    </div>`);
    const [a, b] = Array.from(wrap.querySelectorAll("lit-material-copy-button"));
    await a!.copy();
    await b!.copy();
    expect(written).to.deep.equal(["rws --config rws.toml", "kubectl get pods"]);
  });

  it("copies on click", async () => {
    const el = await fixture<LitMaterialCopyButton>(html`<lit-material-copy-button value="abc"></lit-material-copy-button>`);
    await el.shadowRoot!.querySelector("lit-material-icon-button")!.updateComplete;
    const done = new Promise((r) => el.addEventListener("copy", r));
    click(el);
    await done;
    expect(written).to.deep.equal(["abc"]);
  });

  it("says so when copying fails", async () => {
    clipboardFails = true;
    execResult = false;
    const el = await fixture<LitMaterialCopyButton>(html`<lit-material-copy-button value="abc"></lit-material-copy-button>`);
    expect(await el.copy()).to.be.false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("[role=status]")!.textContent).to.equal("Couldn't copy");
  });
});

describe("lit-material-clipboard-copy", () => {
  it("shows the value read-only and copies it", async () => {
    const el = await fixture<LitMaterialClipboardCopy>(html`<lit-material-clipboard-copy label="API URL" value="https://api.example"></lit-material-clipboard-copy>`);
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input.readOnly).to.be.true;
    expect(input.value).to.equal("https://api.example");
    expect(input.getAttribute("aria-label")).to.equal("API URL");
    const button = el.shadowRoot!.querySelector("lit-material-copy-button")!;
    expect(button.label).to.equal("Copy API URL");
    await button.copy();
    expect(written).to.deep.equal(["https://api.example"]);
  });

  it("masks a secret until revealed, and still copies it", async () => {
    const el = await fixture<LitMaterialClipboardCopy>(html`<lit-material-clipboard-copy label="Token" value="s3cr3t" masked></lit-material-clipboard-copy>`);
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input.type).to.equal("password");
    const toggle = el.shadowRoot!.querySelector("lit-material-icon-button")!;
    await toggle.updateComplete;
    toggle.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(input.type).to.equal("text");
    await el.shadowRoot!.querySelector("lit-material-copy-button")!.copy();
    expect(written).to.deep.equal(["s3cr3t"]);
  });
});
