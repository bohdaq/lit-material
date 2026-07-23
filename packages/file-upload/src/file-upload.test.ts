import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./file-upload.js";
import type { LitMaterialFileUpload } from "./file-upload.js";

function makeFile(name: string, content = "hello", type = "text/plain"): File {
  return new File([content], name, { type });
}

function setInputFiles(input: HTMLInputElement, files: File[]): void {
  const dataTransfer = new DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  input.files = dataTransfer.files;
}

describe("lit-material-file-upload", () => {
  it("renders a native file input, visually hidden but present", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload></lit-material-file-upload>`);
    const input = el.shadowRoot!.querySelector("input[type='file']") as HTMLInputElement;
    expect(input).to.exist;
    expect(input.multiple).to.be.false;
  });

  it("shows default instructions text, single vs multiple", async () => {
    const single = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload></lit-material-file-upload>`);
    expect(single.shadowRoot!.querySelector(".instructions")!.textContent).to.contain("a file");

    const multi = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload multiple></lit-material-file-upload>`);
    expect(multi.shadowRoot!.querySelector(".instructions")!.textContent).to.contain("files");
  });

  it("shows a custom label instead of the default instructions", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload label="Upload your résumé"></lit-material-file-upload>`);
    expect(el.shadowRoot!.querySelector(".instructions")!.textContent!.trim()).to.equal("Upload your résumé");
  });

  it("forwards multiple, accept, and disabled to the native input", async () => {
    const el = await fixture<LitMaterialFileUpload>(
      html`<lit-material-file-upload multiple accept="image/*" disabled></lit-material-file-upload>`,
    );
    const input = el.shadowRoot!.querySelector("input[type='file']") as HTMLInputElement;
    expect(input.multiple).to.be.true;
    expect(input.accept).to.equal("image/*");
    expect(input.disabled).to.be.true;
  });

  it("selecting a file via the native input adds it and fires change", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload></lit-material-file-upload>`);
    const input = el.shadowRoot!.querySelector("input[type='file']") as HTMLInputElement;
    setInputFiles(input, [makeFile("resume.pdf")]);

    const changed = oneEvent(el, "change");
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await changed;
    await el.updateComplete;

    expect(el.files.map((f) => f.name)).to.deep.equal(["resume.pdf"]);
    expect(el.shadowRoot!.querySelectorAll(".file-row").length).to.equal(1);
  });

  it("selecting a new file replaces the old one when not multiple", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload></lit-material-file-upload>`);
    el.files = [makeFile("first.pdf")];
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector("input[type='file']") as HTMLInputElement;
    setInputFiles(input, [makeFile("second.pdf")]);
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;

    expect(el.files.map((f) => f.name)).to.deep.equal(["second.pdf"]);
  });

  it("appends files when multiple, instead of replacing", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload multiple></lit-material-file-upload>`);
    el.files = [makeFile("first.pdf")];
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector("input[type='file']") as HTMLInputElement;
    setInputFiles(input, [makeFile("second.pdf"), makeFile("third.pdf")]);
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;

    expect(el.files.map((f) => f.name)).to.deep.equal(["first.pdf", "second.pdf", "third.pdf"]);
  });

  it("dropping files onto the upload area adds them", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload multiple></lit-material-file-upload>`);
    const upload = el.shadowRoot!.querySelector(".upload")!;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(makeFile("dropped.txt"));

    const changed = oneEvent(el, "change");
    upload.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
    await changed;
    await el.updateComplete;

    expect(el.files.map((f) => f.name)).to.deep.equal(["dropped.txt"]);
  });

  it("removeFile() removes a file by index and fires change", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload multiple></lit-material-file-upload>`);
    el.files = [makeFile("a.txt"), makeFile("b.txt")];
    await el.updateComplete;

    const changed = oneEvent(el, "change");
    el.removeFile(0);
    await changed;
    await el.updateComplete;

    expect(el.files.map((f) => f.name)).to.deep.equal(["b.txt"]);
  });

  it("clicking a file row's remove button removes that file", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload multiple></lit-material-file-upload>`);
    el.files = [makeFile("a.txt"), makeFile("b.txt")];
    await el.updateComplete;

    const removeButtons = el.shadowRoot!.querySelectorAll(".remove");
    (removeButtons[0] as HTMLButtonElement).click();
    await el.updateComplete;

    expect(el.files.map((f) => f.name)).to.deep.equal(["b.txt"]);
  });

  it("participates in an ancestor form: single file sets the File as the form value", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-file-upload name="resume"></lit-material-file-upload>
      </form>
    `);
    const el = form.querySelector("lit-material-file-upload")! as LitMaterialFileUpload;
    el.files = [makeFile("resume.pdf")];
    await el.updateComplete;

    const data = new FormData(form);
    const value = data.get("resume") as File;
    expect(value).to.be.instanceOf(File);
    expect(value.name).to.equal("resume.pdf");
  });

  it("participates in an ancestor form: multiple files each get their own FormData entry", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-file-upload name="attachments" multiple></lit-material-file-upload>
      </form>
    `);
    const el = form.querySelector("lit-material-file-upload")! as LitMaterialFileUpload;
    el.files = [makeFile("a.txt"), makeFile("b.txt")];
    await el.updateComplete;

    const data = new FormData(form);
    const values = data.getAll("attachments") as File[];
    expect(values.map((f) => f.name)).to.deep.equal(["a.txt", "b.txt"]);
  });

  it("resets to no files when the form is reset", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-file-upload name="resume"></lit-material-file-upload>
      </form>
    `);
    const el = form.querySelector("lit-material-file-upload")! as LitMaterialFileUpload;
    el.files = [makeFile("resume.pdf")];
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    expect(el.files.length).to.equal(0);
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload label="Upload a file"></lit-material-file-upload>`);
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks with files selected", async () => {
    const el = await fixture<LitMaterialFileUpload>(html`<lit-material-file-upload multiple></lit-material-file-upload>`);
    el.files = [makeFile("a.txt"), makeFile("b.txt")];
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
