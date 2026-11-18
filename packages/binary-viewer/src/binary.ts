// Pure helpers for binary content: which view a content type gets, and hex dump rows.

/** How `lit-material-binary-viewer` shows content. */
export type BinaryView = "image" | "pdf" | "binary";

/** One hex dump row: 16 bytes at `offset`. */
export interface HexRow {
  /** The offset, as 8 hex digits. */
  offset: string;
  /** The bytes as two-digit hex, eight per group: `["89 50 4e 47 0d 0a 1a 0a", "00 00 00 0d …"]`. */
  hex: [string, string];
  /** The bytes as text: printable ASCII as is, anything else as `.`. */
  ascii: string;
}

const mime = (contentType: string | null | undefined): string => String(contentType ?? "").split(";")[0]!.trim().toLowerCase();

/**
 * The view for a content type: `image` for raster images the browser shows (`image/svg+xml` too, drawn as an
 * image, so its scripts never run), `pdf` for `application/pdf`, else `binary`.
 */
export function viewOf(contentType: string | null | undefined): BinaryView {
  const type = mime(contentType);
  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf") return "pdf";
  return "binary";
}

/** Hex dump rows for the first `max` bytes of `bytes` (all of them when `max` is omitted). */
export function hexRows(bytes: Uint8Array, max = bytes.length): HexRow[] {
  const end = Math.min(bytes.length, Math.max(0, max));
  const rows: HexRow[] = [];
  for (let at = 0; at < end; at += 16) {
    const row = bytes.subarray(at, Math.min(at + 16, end));
    const hex = Array.from(row, (b) => b.toString(16).padStart(2, "0"));
    rows.push({
      offset: at.toString(16).padStart(8, "0"),
      hex: [hex.slice(0, 8).join(" "), hex.slice(8).join(" ")],
      ascii: Array.from(row, (b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : ".")).join(""),
    });
  }
  return rows;
}

/** The classic text hex dump (`00000000  89 50 4e 47 …  |.PNG....|`), one line per 16 bytes. */
export function hexDump(bytes: Uint8Array, max = bytes.length): string {
  return hexRows(bytes, max)
    .map((r) => `${r.offset}  ${r.hex[0].padEnd(23)}  ${r.hex[1].padEnd(23)}  |${r.ascii}|`)
    .join("\n");
}
