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
import "@lit-material/menu";
import type { LitMaterialMenu } from "@lit-material/menu";
import "@lit-material/snackbar";
import type { LitMaterialSnackbar } from "@lit-material/snackbar";
import "@lit-material/select";
import "@lit-material/slider";
import "@lit-material/tabs";
import "@lit-material/top-app-bar";
import type { LitMaterialTopAppBar } from "@lit-material/top-app-bar";

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

const menu = document.querySelector<LitMaterialMenu>("#demo-menu");
document.querySelector("#open-menu-btn")?.addEventListener("click", () => menu?.show());

const snackbar = document.querySelector<LitMaterialSnackbar>("#demo-snackbar");
const snackbarUndo = document.querySelector<LitMaterialSnackbar>("#demo-snackbar-undo");
document.querySelector("#show-snackbar-btn")?.addEventListener("click", () => snackbar?.show());
document.querySelector("#show-snackbar-undo-btn")?.addEventListener("click", () => snackbarUndo?.show());
document.querySelector("#snackbar-undo-btn")?.addEventListener("click", () => console.log("undo clicked"));

const topAppBarScrollDemo = document.querySelector<HTMLDivElement>("#top-app-bar-scroll-demo");
const topAppBarInScrollDemo = topAppBarScrollDemo?.querySelector<LitMaterialTopAppBar>("lit-material-top-app-bar");
if (topAppBarScrollDemo && topAppBarInScrollDemo) {
  topAppBarInScrollDemo.scrollTarget = topAppBarScrollDemo;
}
