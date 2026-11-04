import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Post } from "../posts.js";

@customElement("home-page")
export class HomePage extends LitElement {
  @property({ attribute: false }) posts: Post[] = [];

  override render() {
    return html`<h1>Posts</h1>
      <ul>
        ${this.posts.map((post) => html`<li><a href="/posts/${post.slug}">${post.title}</a></li>`)}
      </ul>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "home-page": HomePage;
  }
}
