import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./key-value-editor.js";
import { parseKeyValues, type LitMaterialKeyValueEditor } from "./key-value-editor.js";

const editor = (entries = [{ key: "app", value: "web" }]) =>
  fixture<LitMaterialKeyValueEditor>(html`<lit-material-key-value-editor .entries=${entries}></lit-material-key-value-editor>`);

const fields = (el: LitMaterialKeyValueEditor) =>
  Array.from(el.shadowRoot!.querySelectorAll("lit-material-text-field")) as (HTMLElement & {
    value: string;
    error: boolean;
    errorText: string;
  })[];

function type(field: HTMLElement & { value: string }, text: string) {
  field.value = text;
  field.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
}

describe("lit-material-key-value-editor", () => {
  it("renders a key and value field per entry", async () => {
    const el = await editor([
      { key: "app", value: "web" },
      { key: "tier", value: "front" },
    ]);
    expect(fields(el).map((f) => f.value)).to.deep.equal(["app", "web", "tier", "front"]);
    expect(el.toObject()).to.deep.equal({ app: "web", tier: "front" });
  });

  it("fires change with the edited entries", async () => {
    const el = await editor();
    const listener = oneEvent(el, "change");
    type(fields(el)[1], "api");
    expect((await listener).detail.entries).to.deep.equal([{ key: "app", value: "api" }]);
  });

  it("adds a row, focuses its key and leaves it out of entries while blank", async () => {
    const el = await editor();
    await el.addRow();
    expect(fields(el)).to.have.length(4);
    expect(el.shadowRoot!.activeElement).to.equal(fields(el)[2]);
    expect(el.entries).to.have.length(1);
  });

  it("removes a row and fires change", async () => {
    const el = await editor([
      { key: "a", value: "1" },
      { key: "b", value: "2" },
    ]);
    const remove = el.shadowRoot!.querySelector<HTMLElement>('[aria-label="Remove a"]')!;
    const listener = oneEvent(el, "change");
    remove.click();
    expect((await listener).detail.entries).to.deep.equal([{ key: "b", value: "2" }]);
  });

  it("flags duplicate and missing keys", async () => {
    const el = await editor([
      { key: "a", value: "1" },
      { key: "a", value: "2" },
      { key: "", value: "3" },
    ]);
    const keys = fields(el).filter((_, i) => i % 2 === 0);
    expect(keys.map((k) => k.errorText)).to.deep.equal(["Duplicate key", "Duplicate key", "Key required"]);
    expect(el.valid).to.be.false;
    expect(el.checkValidity()).to.be.false;
  });

  it("checks keys against key-pattern", async () => {
    const el = await editor([{ key: "Bad Key", value: "" }]);
    el.keyPattern = "[a-z0-9]([-a-z0-9._/]*[a-z0-9])?";
    el.keyPatternMessage = "Lowercase letters, digits, - . _ /";
    await el.updateComplete;
    expect(fields(el)[0].errorText).to.equal("Lowercase letters, digits, - . _ /");
    type(fields(el)[0], "app.kubernetes.io/name");
    await el.updateComplete;
    expect(el.valid).to.be.true;
  });

  it("turns pasted KEY=value lines into rows", async () => {
    const el = await editor([]);
    await el.addRow();
    const data = new DataTransfer();
    data.setData("text/plain", "# env\nPORT=8080\nexport NAME=\"web app\"\n");
    const paste = new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true, composed: true });
    fields(el)[0].dispatchEvent(paste);
    await el.updateComplete;
    expect(paste.defaultPrevented).to.be.true;
    expect(el.entries).to.deep.equal([
      { key: "PORT", value: "8080" },
      { key: "NAME", value: "web app" },
    ]);
  });

  it("has no add or remove buttons when readonly", async () => {
    const el = await editor();
    el.readonly = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".add, .remove")).to.be.null;
  });
});

describe("parseKeyValues", () => {
  it("parses .env, label and YAML-ish shapes", () => {
    expect(parseKeyValues("A=1\nB='two'")).to.deep.equal([
      { key: "A", value: "1" },
      { key: "B", value: "two" },
    ]);
    expect(parseKeyValues("app=web,tier=front")).to.deep.equal([
      { key: "app", value: "web" },
      { key: "tier", value: "front" },
    ]);
    expect(parseKeyValues("app: web")).to.deep.equal([{ key: "app", value: "web" }]);
    expect(parseKeyValues("URL=http://x/?a=b")).to.deep.equal([{ key: "URL", value: "http://x/?a=b" }]);
  });

  it("returns nothing for plain text", () => {
    expect(parseKeyValues("just-a-key")).to.deep.equal([]);
    expect(parseKeyValues("https://example.com")).to.deep.equal([]);
  });
});
