import "@lit-material/world-map";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import type { WorldMapChangeDetail } from "@lit-material/world-map";

const visitors = { US: 1240, DE: 310, GB: 260, IN: 240, BR: 150, FR: 120, PL: 95, JP: 80, CA: 70, AU: 44, UA: 40, ZA: 12, SG: 18, MT: 3 };

@customElement("docs-world-map-page")
export class DocsWorldMapPage extends LitElement {
  static override styles = [pageStyles];

  @state() private picked = "";

  override render() {
    return html`
      <h1>World map</h1>
      <p>Countries shaded by a value. Hover, or focus the map and use the arrow keys, to read values highest first.</p>
      <section>
        <h2>Visitors by country</h2>
        <lit-material-world-map label="Visitors by country" unit="visitors" .data=${visitors}></lit-material-world-map>
      </section>
      <section>
        <h2>Selectable</h2>
        <p>Click a country, or press Enter on it, to filter by it; again clears. Picked: ${this.picked || "none"}</p>
        <lit-material-world-map
          label="Visitors by country"
          unit="visitors"
          selectable
          .data=${visitors}
          @change=${(e: CustomEvent<WorldMapChangeDetail>) => (this.picked = e.detail.code)}
        ></lit-material-world-map>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-world-map-page": DocsWorldMapPage;
  }
}
