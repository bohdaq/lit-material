import "@lit-material/binary-viewer";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

/** A one-page PDF saying `text`, with a correct cross-reference table. */
function makePdf(text: string): Uint8Array {
  const stream = `BT /F1 24 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}

/** Some bytes that look like an archive: a header, a file name, then noise (same every time). */
function makeArchive(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  bytes.set([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00]);
  bytes.set(new TextEncoder().encode("collection/orders/create-order.yaml"), 30);
  let x = 2463534242;
  for (let i = 80; i < size; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    bytes[i] = x & 0xff;
  }
  return bytes;
}

@customElement("docs-binary-viewer-page")
export class DocsBinaryViewerPage extends LitElement {
  static override styles = [pageStyles];

  @state() private image: Blob | null = null;
  private readonly pdf = makePdf("Hello from lit-material");
  private readonly archive = makeArchive(12_000);

  protected override firstUpdated(): void {
    // Drawn in the browser, so the page's server render and its first browser render agree.
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 200;
    const g = canvas.getContext("2d");
    if (!g) return;
    const fill = g.createLinearGradient(0, 0, 320, 200);
    fill.addColorStop(0, "#6750a4");
    fill.addColorStop(1, "#7d5260");
    g.fillStyle = fill;
    g.fillRect(0, 0, 320, 200);
    g.fillStyle = "#ffffff";
    g.font = "bold 28px system-ui, sans-serif";
    g.fillText("chart.png", 24, 110);
    canvas.toBlob((blob) => (this.image = blob), "image/png");
  }

  override render() {
    return html`
      <h1>Binary viewer</h1>
      <p>
        Shows bytes by content type: an image with its pixel size, a PDF in the browser's own PDF viewer, and anything else as a hex dump
        of its first bytes (<code>max-bytes</code>, 4 KiB by default). Every view offers Download. <code>data</code> takes a
        <code>Uint8Array</code>, an <code>ArrayBuffer</code> or a <code>Blob</code>.
      </p>
      <section style="display: block;">
        <h2>Image</h2>
        <lit-material-binary-viewer content-type="image/png" filename="chart.png" .data=${this.image}></lit-material-binary-viewer>
      </section>
      <section style="display: block;">
        <h2>PDF</h2>
        <lit-material-binary-viewer content-type="application/pdf" filename="invoice.pdf" .data=${this.pdf}></lit-material-binary-viewer>
      </section>
      <section style="display: block;">
        <h2>Anything else</h2>
        <lit-material-binary-viewer content-type="application/zip" filename="collection.zip" max-bytes="512" .data=${this.archive}></lit-material-binary-viewer>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-binary-viewer-page": DocsBinaryViewerPage;
  }
}
