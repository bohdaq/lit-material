/**
 * Writes `text` to the clipboard and resolves whether it worked.
 *
 * Uses the async Clipboard API where there is one, falling back to a
 * selected off-screen `<textarea>` and `document.execCommand("copy")` —
 * the Clipboard API only exists in secure contexts, and plain-http admin
 * pages and internal tools are common. Never throws.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Denied or unfocused document: try the fallback.
    }
  }
  return fallbackCopy(text);
}

function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined" || !document.body) return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;";
  const active = document.activeElement as HTMLElement | null;
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus?.();
  return ok;
}
