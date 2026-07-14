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
import "@lit-material/navigation";
import type { LitMaterialNavigationDrawer } from "@lit-material/navigation";
import "@lit-material/progress";
import type { LitMaterialLinearProgress, LitMaterialCircularProgress } from "@lit-material/progress";
import "@lit-material/fab";
import type { LitMaterialFab } from "@lit-material/fab";
import "@lit-material/badge";
import "@lit-material/date-picker";
import type { LitMaterialDatePicker } from "@lit-material/date-picker";

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

const navDrawer = document.querySelector<LitMaterialNavigationDrawer>("#demo-nav-drawer");
document.querySelector("#open-nav-drawer-btn")?.addEventListener("click", () => navDrawer?.show());

const linearProgress = document.querySelector<LitMaterialLinearProgress>("#demo-linear-progress");
const circularProgress = document.querySelector<LitMaterialCircularProgress>("#demo-circular-progress");
document.querySelector("#animate-progress-btn")?.addEventListener("click", () => {
  if (!linearProgress || !circularProgress) return;
  const start = performance.now();
  const duration = 1500;
  linearProgress.value = 0;
  circularProgress.value = 0;
  const tick = (now: number) => {
    const elapsed = Math.min(1, (now - start) / duration);
    linearProgress.value = elapsed;
    circularProgress.value = elapsed;
    if (elapsed < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const extendedFab = document.querySelector<LitMaterialFab>("#demo-extended-fab");
document.querySelector("#toggle-extended-fab-btn")?.addEventListener("click", () => {
  if (extendedFab) extendedFab.extended = !extendedFab.extended;
});

const datePicker = document.querySelector<LitMaterialDatePicker>("#demo-date-picker");
const datePickerLog = document.querySelector<HTMLSpanElement>("#date-picker-value-log");
document.querySelector("#open-date-picker-btn")?.addEventListener("click", () => datePicker?.show());
datePicker?.addEventListener("change", () => {
  if (datePickerLog) datePickerLog.textContent = `Selected: ${datePicker.value}`;
});
