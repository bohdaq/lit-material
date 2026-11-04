import "@lit-material/button";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Post } from "../posts.js";

@customElement("post-page")
export class PostPage extends LitElement {
  @property({ attribute: false }) post?: Post;

  override render() {
    if (!this.post) return html`<h1>No such post</h1>`;
    return html`<article>
        <h1>${this.post.title}</h1>
        <p>${this.post.body}</p>
      </article>
      <lit-material-button variant="tonal" href="/">All posts</lit-material-button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "post-page": PostPage;
  }
}
