import { html } from "lit";
import type { RouteConfig } from "@lit-material/router";
import { getPost, listPosts, type Post } from "./posts.js";
import "./pages/home-page.js";
import "./pages/post-page.js";

export const routes: RouteConfig<unknown>[] = [
  {
    path: "/",
    title: "{{PROJECT_NAME}}",
    loader: () => listPosts(),
    render: (_params, _outlet, { data }) => html`<home-page .posts=${data as Post[]}></home-page>`,
  },
  {
    path: "/posts/:slug",
    loader: ({ params }) => getPost(params.slug!),
    title: ({ data }) => (data as Post | undefined)?.title ?? "Not found",
    render: (_params, _outlet, { data }) => html`<post-page .post=${data as Post | undefined}></post-page>`,
  },
  {
    path: "/about",
    title: "About",
    render: () => html`<h1>About</h1>
      <p>Built with <a href="https://lit.rws8.tech/">lit-material</a>.</p>`,
  },
  { path: "/home", redirect: "/" },
  // Anything else: a real 404 status from the server.
  { path: "/*", status: 404, title: "Not found", render: () => html`<h1>Not found</h1><p><a href="/">Home</a></p>` },
];
