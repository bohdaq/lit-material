import { html, LitElement, nothing, svg, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { langOf, LocalizeController } from "@lit-material/core/localize.js";
import { formatBytes } from "@lit-material/format";
import "@lit-material/button/button.js";
import { hexRows, viewOf, type BinaryView } from "./binary.js";
import { styles } from "./binary-viewer-styles.js";

/** What `data` takes. */
export type BinaryData = Uint8Array | ArrayBuffer | Blob;

/** `detail` of the `download` event. */
export interface BinaryDownloadDetail {
  blob: Blob;
  filename: string;
}

const ICONS: Record<BinaryView, ReturnType<typeof svg>> = {
  image: svg`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><circle cx="9" cy="10" r="2" fill="currentColor"></circle><path d="M4 18l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`,
  pdf: svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l5 5v15H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M14 2v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M9 13h6M9 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
  binary: svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l5 5v15H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M14 2v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><text x="12.5" y="17.5" font-size="6" text-anchor="middle" fill="currentColor" font-family="monospace">01</text></svg>`,
};
const DOWNLOAD_ICON = svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

/**
 * Shows binary content, like a response body or an uploaded file, by its
 * content type:
 *
 * - an image as an `<img>`, with its pixel size;
 * - a PDF in the browser's own PDF viewer (an `<object>` typed
 *   `application/pdf` on a blob URL of that type, so the bytes can only be
 *   shown as a PDF; Chromium refuses PDFs in a sandboxed iframe), with a
 *   link that opens it on its own;
 * - anything else as its size and type, a Download button, and a hex dump
 *   (offset, hex and ASCII columns) of the first `max-bytes` bytes.
 *
 * Every view says what it is (Image · 12.4 KiB · image/png · 640 × 480) and
 * offers Download. `data` is a `Uint8Array`, an `ArrayBuffer` or a `Blob`
 * (only the bytes the dump shows are read from a Blob). Object URLs are made
 * in the browser only, replaced when the content changes and revoked when
 * the element leaves the page.
 *
 * Download fires a cancelable `download` event first (`detail: {blob,
 * filename}`): cancel it to save the file your own way (a desktop app's
 * save dialog).
 *
 * @element lit-material-binary-viewer
 *
 * @csspart facts - The line saying what the content is, with the Download button.
 * @csspart image - The `<img>`.
 * @csspart frame - The PDF viewer (`<object>`).
 * @csspart dump - The hex dump's scrolling box.
 *
 * @cssprop --lit-material-binary-viewer-max-height - The tallest the image, frame or hex dump gets (default `480px`).
 *
 * @fires download - Download was pressed; `detail: {blob, filename}`, cancelable.
 */
@customElement("lit-material-binary-viewer")
export class LitMaterialBinaryViewer extends LitElement {
  static override styles = styles;

  /** The content: bytes or a Blob. Property only. */
  @property({ attribute: false }) data: BinaryData | null = null;
  /** Its content type, e.g. `image/png` (parameters such as `; charset` are ignored). Default: a Blob's own type. */
  @property({ attribute: "content-type" }) contentType = "";
  /** The file name Download saves as, and the name the views use. */
  @property() filename = "";
  /** How many bytes the hex dump shows (rounded up to whole rows of 16). */
  @property({ type: Number, attribute: "max-bytes" }) maxBytes = 4096;

  @state() private size: number | null = null;
  @state() private head: Uint8Array | null = null;
  @state() private url = "";
  @state() private dimensions: { width: number; height: number } | null = null;

  private readonly localize = new LocalizeController(this);
  /** The Blob behind `url` (and Download). */
  private blob: Blob | null = null;
  private loading = 0;
  private started = false;
  /** A Blob's own type, once read (not during the first render, which must match the server's). */
  @state() private blobType = "";
  private downloadUrls: string[] = [];

  /** The content type in use: `content-type`, else a Blob's own type. */
  get type(): string {
    return this.contentType || this.blobType || "application/octet-stream";
  }

  /** The view the content gets. */
  get view(): BinaryView {
    return viewOf(this.type);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Back on the page after a disconnect revoked the URL.
    if (this.hasUpdated && this.data && !this.url) void this.load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.loading++;
    this.revoke();
    for (const u of this.downloadUrls) URL.revokeObjectURL(u);
    this.downloadUrls = [];
  }

  protected override updated(changed: PropertyValues<this>): void {
    // After the first render, not during it: the server rendered no content, so neither may the hydrating render.
    if (!this.started || changed.has("data") || changed.has("contentType") || changed.has("maxBytes")) {
      this.started = true;
      void this.load();
    }
  }

  private revoke(): void {
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = "";
  }

  /** Reads what the views need from `data`: the size, the dump's bytes, an object URL for an image or PDF. */
  private async load(): Promise<void> {
    if (!this.isConnected) return;
    const run = ++this.loading;
    const data = this.data;
    this.revoke();
    this.dimensions = null;
    if (!data) {
      this.blobType = "";
      this.blob = null;
      this.size = null;
      this.head = null;
      return;
    }
    this.blobType = data instanceof Blob ? data.type : "";
    const type = this.type;
    const blob = data instanceof Blob ? (data.type === type ? data : data.slice(0, data.size, type)) : new Blob([data as BlobPart], { type });
    this.blob = blob;
    this.size = blob.size;
    const view = this.view;
    if (view === "binary") {
      const max = Math.ceil(Math.max(0, this.maxBytes) / 16) * 16;
      const head =
        data instanceof Blob
          ? new Uint8Array(await data.slice(0, max).arrayBuffer())
          : data instanceof Uint8Array
            ? data.subarray(0, max)
            : new Uint8Array(data as ArrayBuffer, 0, Math.min(max, (data as ArrayBuffer).byteLength));
      if (run !== this.loading) return;
      this.head = head;
    } else {
      this.head = null;
      this.url = URL.createObjectURL(blob);
    }
  }

  private name(): string {
    return this.filename || this.localize.term("binaryViewer.untitled", "Untitled");
  }

  private readonly handleDownload = (): void => {
    const blob = this.blob;
    if (!blob) return;
    const filename = this.filename || "download";
    const detail: BinaryDownloadDetail = { blob, filename };
    if (!this.dispatchEvent(new CustomEvent("download", { bubbles: true, composed: true, cancelable: true, detail }))) return;
    const url = URL.createObjectURL(blob);
    this.downloadUrls.push(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.hidden = true;
    this.renderRoot.append(a);
    a.click();
    a.remove();
    // Long enough for the browser to start saving it.
    setTimeout(() => {
      URL.revokeObjectURL(url);
      this.downloadUrls = this.downloadUrls.filter((u) => u !== url);
    }, 60_000);
  };

  private readonly handleImageLoad = (event: Event): void => {
    const img = event.currentTarget as HTMLImageElement;
    this.dimensions = { width: img.naturalWidth, height: img.naturalHeight };
  };

  private facts() {
    const view = this.view;
    const locale = langOf(this);
    const kind =
      view === "image"
        ? this.localize.term("binaryViewer.image", "Image")
        : view === "pdf"
          ? this.localize.term("binaryViewer.pdf", "PDF")
          : this.localize.term("binaryViewer.binary", "Binary");
    return html`<div class="facts" part="facts">
      <span class="icon">${ICONS[view]}</span>
      <span class="what">
        <span class="kind">${kind}</span>
        ${this.size !== null ? html`<span class="sep" aria-hidden="true">·</span><span>${formatBytes(this.size, { locale })}</span>` : nothing}
        <span class="sep" aria-hidden="true">·</span><span class="mono">${this.type.split(";")[0]}</span>
        ${this.dimensions
          ? html`<span class="sep" aria-hidden="true">·</span><span class="mono">${this.dimensions.width} × ${this.dimensions.height}</span>`
          : nothing}
      </span>
      <lit-material-button variant="text" class="download" ?disabled=${!this.blob} @click=${this.handleDownload}
        ><span slot="icon" class="button-icon">${DOWNLOAD_ICON}</span>${this.localize.term("binaryViewer.download", "Download")}</lit-material-button
      >
    </div>`;
  }

  private content() {
    if (!this.blob) return html`<p class="empty">${this.localize.term("binaryViewer.empty", "No content")}</p>`;
    const view = this.view;
    if (view === "image" && this.url) {
      return html`<div class="image-frame">
        <img part="image" src=${this.url} alt=${this.localize.term("binaryViewer.imageAlt", "{name} ({type})", { name: this.name(), type: this.type.split(";")[0]! })} @load=${this.handleImageLoad} />
      </div>`;
    }
    if (view === "pdf" && this.url) {
      return html`<object part="frame" class="pdf" type="application/pdf" title=${this.name()} data=${this.url}>
          <p class="note">${this.localize.term("binaryViewer.noPdfViewer", "This browser can't show PDFs here.")}</p>
        </object>
        <a class="open" href=${this.url} target="_blank" rel="noopener noreferrer">${this.localize.term("binaryViewer.openPdf", "Open the PDF on its own")}</a>`;
    }
    if (view === "binary" && this.head) {
      const total = this.size ?? 0;
      const locale = langOf(this);
      const rows = hexRows(this.head);
      const label = this.localize.term("binaryViewer.hexLabel", "Hex dump of {name}", { name: this.name() });
      return html`${total > this.head.length
          ? html`<p class="note">
              ${this.localize.term("binaryViewer.firstBytes", "The first {shown} of {total}", {
                shown: formatBytes(this.head.length, { locale }),
                total: formatBytes(total, { locale }),
              })}
            </p>`
          : nothing}
        <div class="dump" part="dump" tabindex="0" role="region" aria-label=${label} dir="ltr">
          <pre>${rows.map(
            (r) => html`<span class="row"><span class="offset">${r.offset}</span>  <span class="hex">${r.hex[0].padEnd(23)}  ${r.hex[1].padEnd(23)}</span>  <span class="ascii">${r.ascii}</span>
</span>`,
          )}</pre>
        </div>`;
    }
    return nothing;
  }

  override render() {
    return html`<div class="viewer">${this.facts()}${this.content()}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-binary-viewer": LitMaterialBinaryViewer;
  }
}
