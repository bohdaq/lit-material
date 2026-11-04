import { html } from "lit";
import "./app-shell.js";
export { routes } from "./routes.js";

export const render = () => html`<fixture-app-shell></fixture-app-shell>`;
export const head = () => `<meta name="generator" content="lit-material">`;
