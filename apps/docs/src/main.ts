import "@lit-material/tokens/css/index.css";
import "@lit-material/button";
import "@lit-material/icon-button";
import "@lit-material/text-field";
import "@lit-material/checkbox";
import "@lit-material/radio";
import "@lit-material/switch";
import "@lit-material/chip";
import "@lit-material/card";
import "@lit-material/list";
import "@lit-material/dialog";
import type { LitMaterialDialog } from "@lit-material/dialog";

const form = document.querySelector<HTMLFormElement>("#demo-form");
const log = document.querySelector<HTMLPreElement>("#submit-log");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  log!.textContent = `submitted: ${JSON.stringify(Object.fromEntries(data))}`;
});

const dialog = document.querySelector<LitMaterialDialog>("#demo-dialog");
document.querySelector("#open-dialog-btn")?.addEventListener("click", () => dialog?.show());
document.querySelector("#dialog-cancel")?.addEventListener("click", () => dialog?.close("cancel"));
document.querySelector("#dialog-delete")?.addEventListener("click", () => dialog?.close("delete"));
