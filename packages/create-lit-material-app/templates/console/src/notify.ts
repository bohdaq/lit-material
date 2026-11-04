import "@lit-material/snackbar";
import type { LitMaterialSnackbar } from "@lit-material/snackbar";

// One snackbar for the whole app: notify("Saved") from anywhere.
let snackbar: LitMaterialSnackbar | undefined;

export function notify(message: string): void {
  if (!snackbar) {
    snackbar = document.createElement("lit-material-snackbar");
    document.body.append(snackbar);
  }
  snackbar.show(message);
}
