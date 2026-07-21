import "@lit-material/accordion";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [{ kind: "boolean", key: "multi", label: "Multi-expand", default: false }];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-accordion ?multi=${state.multi as boolean} style="max-width: 420px;">
      <lit-material-accordion-panel expanded>
        <span slot="header">Shipping</span>
        <p>Orders ship within 3-5 business days. Express shipping is available at checkout.</p>
      </lit-material-accordion-panel>
      <lit-material-accordion-panel>
        <span slot="header">Returns</span>
        <p>Returns are accepted within 30 days of delivery, in original packaging.</p>
      </lit-material-accordion-panel>
      <lit-material-accordion-panel disabled>
        <span slot="header">Warranty (unavailable in your region)</span>
        <p>Warranty terms.</p>
      </lit-material-accordion-panel>
    </lit-material-accordion>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = state.multi ? " multi" : "";
  return `<lit-material-accordion${attrs}>\n  <lit-material-accordion-panel expanded>\n    <span slot="header">Shipping</span>\n    <p>...</p>\n  </lit-material-accordion-panel>\n  ...\n</lit-material-accordion>`;
}

@customElement("docs-accordion-page")
export class DocsAccordionPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Accordion</h1>
      <p>A disclosure widget group — header + collapsible content, single- or multi-expand.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Standalone panel</h2>
        <p>A panel works without a wrapping accordion — set <code>divider</code> to stack a few flush.</p>
        <lit-material-accordion-panel divider style="max-width: 420px;">
          <span slot="header">FAQ item</span>
          <p>No wrapping accordion needed for a single collapsible panel.</p>
        </lit-material-accordion-panel>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-accordion-page": DocsAccordionPage;
  }
}
