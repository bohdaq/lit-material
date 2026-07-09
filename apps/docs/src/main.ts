import "@lit-material/tokens/css/index.css";
import "@lit-material/button";
import "@lit-material/icon-button";

const form = document.querySelector<HTMLFormElement>("#demo-form");
const log = document.querySelector<HTMLPreElement>("#submit-log");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  log!.textContent = `submitted: ${JSON.stringify(Object.fromEntries(data))}`;
});
