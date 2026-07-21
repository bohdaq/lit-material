import "@lit-material/carousel";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";

const SLIDES = [
  { label: "Lake", emoji: "🏞️", color: "#4a6fa5" },
  { label: "Forest", emoji: "🌲", color: "#3f7d5c" },
  { label: "Mountains", emoji: "⛰️", color: "#6b5b95" },
  { label: "Desert", emoji: "🏜️", color: "#c97b3d" },
  { label: "Ocean", emoji: "🌊", color: "#2b6f8e" },
];

@customElement("docs-carousel-page")
export class DocsCarouselPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Carousel</h1>
      <p>
        Native CSS scroll-snap, no prior pattern in this repo to build on. Scroll, drag, use the
        overlaid buttons, or focus the track and press ArrowLeft/ArrowRight.
      </p>

      <lit-material-carousel item-width="240px">
        ${SLIDES.map(
          (slide) => html`
            <lit-material-carousel-item>
              <div
                style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; background-color: ${slide.color};"
              >
                ${slide.emoji}
              </div>
              <span slot="label">${slide.label}</span>
            </lit-material-carousel-item>
          `,
        )}
      </lit-material-carousel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-carousel-page": DocsCarouselPage;
  }
}
