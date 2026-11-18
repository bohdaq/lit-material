import { expect, fixture, html, waitUntil } from "@open-wc/testing";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./binary-viewer.js";
import type { LitMaterialBinaryViewer } from "./binary-viewer.js";
import { hexDump, hexRows, viewOf } from "./binary.js";

// A 3×2 PNG (red pixels).
const PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAEUlEQVR4nGP4z8DwH4YZkDkAm34L9XKwuTwAAAAASUVORK5CYII=",
  ),
  (c) => c.charCodeAt(0),
);

async function viewer(data: Uint8Array | ArrayBuffer | Blob | null, type: string, extra = {}) {
  const el = await fixture<LitMaterialBinaryViewer>(html`<lit-material-binary-viewer content-type=${type} filename="file.bin"></lit-material-binary-viewer>`);
  Object.assign(el, { data, ...extra });
  await el.updateComplete;
  // The content loads after the first render (a Blob is read asynchronously).
  await new Promise((r) => setTimeout(r, 20));
  await el.updateComplete;
  return el;
}

const $ = (el: LitMaterialBinaryViewer, s: string) => el.shadowRoot!.querySelector(s);

describe("binary helpers", () => {
  it("picks a view by content type", () => {
    expect(viewOf("image/png")).to.equal("image");
    expect(viewOf("Application/PDF; x=y")).to.equal("pdf");
    expect(viewOf("application/zip")).to.equal("binary");
    expect(viewOf("")).to.equal("binary");
  });

  it("dumps bytes as offset, hex and ASCII", () => {
    const bytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x41, 0x42, 0, 0, 0, 0, 0, 0, 0x7f, 0x20]);
    const rows = hexRows(bytes);
    expect(rows.length).to.equal(2);
    expect(rows[0]).to.deep.equal({ offset: "00000000", hex: ["89 50 4e 47 0d 0a 1a 0a", "41 42 00 00 00 00 00 00"], ascii: ".PNG....AB......" });
    expect(rows[1]!.offset).to.equal("00000010");
    expect(rows[1]!.ascii).to.equal(". ");
    expect(hexDump(bytes, 16).split("\n")).to.deep.equal(["00000000  89 50 4e 47 0d 0a 1a 0a  41 42 00 00 00 00 00 00  |.PNG....AB......|"]);
  });
});

describe("lit-material-binary-viewer", () => {
  it("shows an image with its size and pixel dimensions", async () => {
    const el = await viewer(PNG, "image/png");
    const img = $(el, "img") as HTMLImageElement;
    expect(img.src).to.match(/^blob:/);
    await waitUntil(() => $(el, ".facts")!.textContent!.includes("3 × 2"), "dimensions appear once the image loads");
    expect($(el, ".facts")!.textContent).to.contain("Image");
    expect($(el, ".facts")!.textContent).to.contain(`${PNG.length} B`);
    expect(img.alt).to.equal("file.bin (image/png)");
  });

  it("shows a PDF in an object typed application/pdf from a blob URL, with a link to open it", async () => {
    const el = await viewer(new Blob(["%PDF-1.4\n%%EOF"], { type: "application/pdf" }), "");
    const frame = $(el, "object") as HTMLObjectElement;
    expect(frame.type).to.equal("application/pdf");
    expect(frame.data).to.match(/^blob:/);
    expect(frame.title).to.equal("file.bin");
    expect(($(el, "a.open") as HTMLAnchorElement).href).to.equal(frame.data);
    expect(el.view).to.equal("pdf", "a Blob's own type when content-type is empty");
  });

  it("dumps the first max-bytes of anything else, and says how much it shows", async () => {
    const bytes = new Uint8Array(1000).map((_, i) => i % 256);
    const el = await viewer(bytes.buffer, "application/octet-stream", { maxBytes: 64 });
    const rows = el.shadowRoot!.querySelectorAll(".dump .row");
    expect(rows.length).to.equal(4);
    expect(rows[1]!.querySelector(".offset")!.textContent).to.equal("00000010");
    expect($(el, ".note")!.textContent!.trim()).to.equal("The first 64 B of 1,000 B");
    const dump = $(el, ".dump") as HTMLElement;
    expect(dump.getAttribute("role")).to.equal("region");
    expect(dump.getAttribute("aria-label")).to.equal("Hex dump of file.bin");
    expect(dump.tabIndex).to.equal(0);
  });

  it("reads only the head of a Blob", async () => {
    const el = await viewer(new Blob([new Uint8Array(10_000)]), "application/zip", { maxBytes: 32 });
    expect(el.shadowRoot!.querySelectorAll(".dump .row").length).to.equal(2);
    expect($(el, ".facts")!.textContent).to.contain("9.8 KiB");
  });

  it("fires a cancelable download with the blob and file name", async () => {
    const el = await viewer(Uint8Array.from([1, 2, 3]), "application/octet-stream");
    let detail: { blob: Blob; filename: string } | undefined;
    el.addEventListener("download", (e) => {
      detail = (e as CustomEvent).detail;
      e.preventDefault();
    });
    ($(el, ".download") as HTMLElement).click();
    expect(detail!.filename).to.equal("file.bin");
    expect(detail!.blob.size).to.equal(3);
  });

  it("replaces and revokes object URLs", async () => {
    const revoked: string[] = [];
    const original = URL.revokeObjectURL;
    URL.revokeObjectURL = (url: string) => {
      revoked.push(url);
      original.call(URL, url);
    };
    try {
      const el = await viewer(PNG, "image/png");
      const first = ($(el, "img") as HTMLImageElement).src;
      el.data = PNG.slice();
      await el.updateComplete;
      await el.updateComplete;
      const second = ($(el, "img") as HTMLImageElement).src;
      expect(second).to.not.equal(first);
      expect(revoked).to.include(first);
      el.remove();
      expect(revoked).to.include(second);
    } finally {
      URL.revokeObjectURL = original;
    }
  });

  it("shows nothing loaded without data", async () => {
    const el = await viewer(null, "image/png");
    expect($(el, ".empty")!.textContent).to.equal("No content");
    expect(($(el, ".download") as HTMLElement & { disabled: boolean }).disabled).to.be.true;
  });

  it("keeps the hex dump left to right on a right-to-left page", async () => {
    const wrap = await fixture<HTMLElement>(html`<div dir="rtl"><lit-material-binary-viewer content-type="application/zip"></lit-material-binary-viewer></div>`);
    const el = wrap.firstElementChild as LitMaterialBinaryViewer;
    el.data = Uint8Array.from([65, 66, 67]);
    await el.updateComplete;
    await el.updateComplete;
    expect(getComputedStyle($(el, ".dump")!).direction).to.equal("ltr");
    expect(getComputedStyle($(el, ".facts")!).direction).to.equal("rtl");
  });

  it("translates its words", async () => {
    registerTranslation({ $code: "x-binary", "binaryViewer.binary": "Binärdaten", "binaryViewer.download": "Herunterladen" });
    const el = await fixture<LitMaterialBinaryViewer>(html`<lit-material-binary-viewer lang="x-binary" content-type="application/zip"></lit-material-binary-viewer>`);
    expect($(el, ".kind")!.textContent).to.equal("Binärdaten");
    expect($(el, ".download")!.textContent!.trim()).to.equal("Herunterladen");
  });

  it("is accessible in each view", async () => {
    for (const [data, type] of [
      [PNG, "image/png"],
      [Uint8Array.from([1, 2, 3]), "application/zip"],
    ] as const) {
      const el = await viewer(data, type);
      await expect(el).to.be.accessible();
    }
  });
});
