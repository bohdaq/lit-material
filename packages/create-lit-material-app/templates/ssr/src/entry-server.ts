// What the server renders for every page (see vite.config.ts and server.js).
import { html } from "lit";
import "./app-shell.js";

export { routes } from "./routes.js";

export const render = () => html`<app-shell></app-shell>`;
