import { LitMaterialConfirmDialog } from "./confirm-dialog.js";

export interface ConfirmOptions {
  headline: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Text the visitor must type before confirming. */
  requireText?: string;
  /** Where the dialog is attached while open (default `document.body`). */
  container?: HTMLElement;
}

/**
 * Asks a yes/no question in a `lit-material-confirm-dialog` and resolves
 * `true` if the visitor confirms. The dialog is created for the call and
 * removed afterwards.
 *
 * ```js
 * if (await confirm({ headline: "Delete project web?", destructive: true, requireText: "web", confirmLabel: "Delete" })) { … }
 * ```
 */
export async function confirm(options: ConfirmOptions): Promise<boolean> {
  const el = new LitMaterialConfirmDialog();
  el.headline = options.headline;
  el.message = options.message ?? "";
  if (options.confirmLabel) el.confirmLabel = options.confirmLabel;
  if (options.cancelLabel) el.cancelLabel = options.cancelLabel;
  el.destructive = options.destructive ?? false;
  el.requireText = options.requireText ?? "";
  (options.container ?? document.body).append(el);
  try {
    return await el.show();
  } finally {
    el.remove();
  }
}
