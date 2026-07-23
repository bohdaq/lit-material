import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./file-upload-styles.js";

let instanceCount = 0;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * A drag-and-drop (or click-to-browse) file picker, for a single file or
 * (with `multiple`) several — mirroring the native `<input type="file"
 * multiple>` attribute rather than being two separate components for the
 * two cases, the same way a native file input handles both with one
 * element. The actual picking is a real `<input type="file">`, visually
 * hidden but still in the tab order and keyboard-operable (Enter/Space
 * opens the native picker) via the `<label>` wrapping it — no custom
 * keyboard handling needed for that part at all.
 *
 * Form-associated via `ElementInternals`: a single file sets the form value
 * directly to that `File`; multiple files build a `FormData` with one entry
 * per file under `name`, matching how a native `<input type="file"
 * multiple>` submits.
 *
 * @element lit-material-file-upload
 *
 * @slot - Overrides the dropzone's instructions text.
 *
 * @csspart upload - The outer container (also the drop target).
 * @csspart dropzone - The clickable/draggable label surface.
 * @csspart input - The native `<input type="file">`.
 * @csspart instructions - The instructions text.
 * @csspart file-list - The `<ul>` of selected files. Only rendered once at least one file is selected.
 * @csspart file-row - One file's row.
 * @csspart file-name - A file row's name.
 * @csspart file-size - A file row's formatted size.
 * @csspart remove - A file row's remove button.
 *
 * @fires change - Fires whenever the file selection changes (add or remove).
 */
@customElement("lit-material-file-upload")
export class LitMaterialFileUpload extends LitElement {
  static override styles = styles;

  static formAssociated = true;

  @property({ type: Boolean, reflect: true }) multiple = false;
  @property() accept = "";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() label = "";
  @property() name = "";

  @state() private fileList: File[] = [];
  @state() private dragging = false;

  private readonly internals: ElementInternals;
  private readonly inputId = `lit-material-file-upload-input-${++instanceCount}`;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** The currently selected files. Assign to replace the selection programmatically. */
  get files(): File[] {
    return this.fileList;
  }

  set files(next: File[]) {
    this.setFiles(next);
  }

  /** Removes one file by index. */
  removeFile(index: number): void {
    this.setFiles(this.fileList.filter((_, i) => i !== index));
  }

  /** Form-associated: clear the selection on form reset. */
  formResetCallback(): void {
    this.fileList = [];
    this.syncFormValue();
  }

  private setFiles(next: File[]): void {
    this.fileList = next;
    this.syncFormValue();
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  private addFiles(incoming: FileList | File[]): void {
    const incomingArray = Array.from(incoming);
    if (incomingArray.length === 0) return;
    if (!this.multiple) {
      this.setFiles([incomingArray[0]!]);
      return;
    }
    this.setFiles([...this.fileList, ...incomingArray]);
  }

  private syncFormValue(): void {
    if (this.fileList.length === 0) {
      this.internals.setFormValue(null);
      return;
    }
    if (!this.multiple) {
      this.internals.setFormValue(this.fileList[0]!);
      return;
    }
    const formData = new FormData();
    for (const file of this.fileList) formData.append(this.name || "files", file);
    this.internals.setFormValue(formData);
  }

  private readonly handleInputChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
    input.value = ""; // allow re-selecting the same file(s) again later
  };

  private readonly handleDragEnter = (event: DragEvent): void => {
    event.preventDefault();
    if (this.disabled) return;
    this.dragging = true;
  };

  private readonly handleDragOver = (event: DragEvent): void => {
    event.preventDefault(); // required for `drop` to fire at all
  };

  private readonly handleDragLeave = (): void => {
    this.dragging = false;
  };

  private readonly handleDrop = (event: DragEvent): void => {
    event.preventDefault();
    this.dragging = false;
    if (this.disabled) return;
    if (event.dataTransfer?.files) this.addFiles(event.dataTransfer.files);
  };

  override render() {
    const defaultInstructions = this.multiple
      ? "Drag and drop files here, or click to browse"
      : "Drag and drop a file here, or click to browse";

    return html`
      <div
        class="upload ${this.dragging ? "dragging" : ""}"
        part="upload"
        @dragenter=${this.handleDragEnter}
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
      >
        <label class="dropzone" part="dropzone" for=${this.inputId}>
          <input
            class="input"
            part="input"
            id=${this.inputId}
            type="file"
            ?multiple=${this.multiple}
            accept=${this.accept || nothing}
            ?disabled=${this.disabled}
            @change=${this.handleInputChange}
          />
          <span class="instructions" part="instructions"><slot>${this.label || defaultInstructions}</slot></span>
        </label>
        ${this.fileList.length > 0
          ? html`
              <ul class="file-list" part="file-list">
                ${this.fileList.map(
                  (file, index) => html`
                    <li class="file-row" part="file-row">
                      <span class="file-name" part="file-name">${file.name}</span>
                      <span class="file-size" part="file-size">${formatFileSize(file.size)}</span>
                      <button
                        class="remove"
                        part="remove"
                        type="button"
                        aria-label="Remove ${file.name}"
                        @click=${() => this.removeFile(index)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                          <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                        </svg>
                      </button>
                    </li>
                  `,
                )}
              </ul>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-file-upload": LitMaterialFileUpload;
  }
}
