import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { LitMaterialAccordionPanel } from "./accordion-panel.js";
import { styles } from "./accordion-styles.js";

/**
 * Groups `lit-material-accordion-panel` elements, adding single-vs-multi
 * expand policy and Up/Down/Home/End roving focus across panel headers, per
 * the WAI-ARIA [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
 * pattern. A panel works fine standalone without this wrapper — this only
 * adds cross-panel coordination.
 *
 * @element lit-material-accordion
 *
 * @slot - `lit-material-accordion-panel` elements.
 *
 * @csspart accordion - The container.
 */
@customElement("lit-material-accordion")
export class LitMaterialAccordion extends LitElement {
  static override styles = styles;

  /** Allows more than one panel to be expanded at once. Default: expanding a panel collapses any other open one. */
  @property({ type: Boolean }) multi = false;

  constructor() {
    super();
    this.addEventListener("toggle", this.handleToggle as EventListener);
    this.addEventListener("keydown", this.handleKeydown);
  }

  private get panels(): LitMaterialAccordionPanel[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during the render phase — degrade to no panels rather than
    // throwing, since there's no cross-panel coordination to do server-side
    // anyway (each panel already renders its own SSR-visible `expanded` state).
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-accordion-panel"));
  }

  private get enabledPanels(): LitMaterialAccordionPanel[] {
    return this.panels.filter((panel) => !panel.disabled);
  }

  override render() {
    return html`<div class="accordion" part="accordion"><slot></slot></div>`;
  }

  private readonly handleToggle = (event: CustomEvent<{ expanded: boolean }>): void => {
    if (this.multi || !event.detail.expanded) return;
    const target = event.target as LitMaterialAccordionPanel;
    for (const panel of this.panels) {
      if (panel !== target && panel.expanded) panel.expanded = false;
    }
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const panels = this.enabledPanels;
    if (panels.length === 0) return;
    // Not `document.activeElement`: panels are this element's own light-DOM
    // children, but `document.activeElement` retargets to the outermost
    // shadow host whenever this accordion is itself used inside another
    // component's shadow root (the normal case) rather than reporting the
    // actually-focused panel. `getRootNode()` — the tree this accordion and
    // its panels both actually live in — resolves correctly regardless of
    // how deeply that tree itself is nested.
    const current = (this.getRootNode() as Document | ShadowRoot).activeElement as LitMaterialAccordionPanel | null;
    const index = current ? panels.indexOf(current) : -1;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        panels[index === -1 ? 0 : (index + 1) % panels.length]!.focus();
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        panels[index === -1 ? panels.length - 1 : (index - 1 + panels.length) % panels.length]!.focus();
        break;
      }
      case "Home": {
        event.preventDefault();
        panels[0]!.focus();
        break;
      }
      case "End": {
        event.preventDefault();
        panels[panels.length - 1]!.focus();
        break;
      }
      default:
        break;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-accordion": LitMaterialAccordion;
  }
}
