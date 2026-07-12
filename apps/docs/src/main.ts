import "@lit-material/tokens/css/index.css";
import "@lit-material/button";
import "@lit-material/icon-button";
import "@lit-material/text-field";
import "@lit-material/checkbox";
import "@lit-material/radio";

const form = document.querySelector<HTMLFormElement>("#demo-form");
const log = document.querySelector<HTMLPreElement>("#submit-log");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  log!.textContent = `submitted: ${JSON.stringify(Object.fromEntries(data))}`;
});
