import { html } from "lit";
import type { RouteConfig } from "@lit-material/router";

export const routes: RouteConfig<unknown>[] = [
  { path: "/", title: "Home", render: () => html`<p id="home">Home page</p><a href="/users/3">User 3</a>` },
  {
    path: "/users/:id",
    loader: async ({ params }) => ({ name: `User ${params.id}`, loadedOn: typeof window === "undefined" ? "server" : "browser" }),
    title: ({ data }) => (data as { name: string }).name,
    render: (_params, _outlet, { data }) => {
      const user = data as { name: string; loadedOn: string };
      return html`<p id="user">${user.name} (loaded on the ${user.loadedOn})</p>`;
    },
  },
  { path: "/old", redirect: "/users/1" },
  { path: "/*", status: 404, title: "Not found", render: () => html`<p id="missing">Not found</p>` },
];
