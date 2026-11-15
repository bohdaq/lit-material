/**
 * Page scroll lock for modal surfaces. A modal `<dialog>` makes the rest of
 * the page inert but still lets it scroll behind the scrim (wheel and touch
 * reach the document). Locking sets `overflow: hidden` on `<html>` while
 * any modal is open, keeping the scrollbar's space so nothing shifts.
 */
const owners = new Set<object>();
let saved: { overflow: string; gutter: string } | undefined;

function apply(): void {
  if (typeof document === "undefined") return;
  // A modal removed from the page while open never fires "close": drop it.
  for (const owner of owners) {
    if (owner instanceof HTMLDialogElement && (!owner.isConnected || !owner.open)) owners.delete(owner);
  }
  const root = document.documentElement;
  if (owners.size > 0 && !saved) {
    saved = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    // Keep the gutter only when the page actually had a scrollbar.
    if (root.scrollHeight > root.clientHeight) root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
  } else if (owners.size === 0 && saved) {
    root.style.overflow = saved.overflow;
    root.style.scrollbarGutter = saved.gutter;
    saved = undefined;
  }
}

/** Locks page scrolling for `owner` (any object; locks nest across owners). */
export function lockScroll(owner: object): void {
  owners.add(owner);
  apply();
}

/** Releases `owner`'s lock; scrolling returns when no owner holds one. */
export function unlockScroll(owner: object): void {
  owners.delete(owner);
  apply();
}

/** `dialog.showModal()`, with the page scroll locked until the dialog closes. */
export function showModalLocked(dialog: HTMLDialogElement): void {
  dialog.showModal();
  lockScroll(dialog);
  dialog.addEventListener("close", () => unlockScroll(dialog), { once: true });
}
