import "@lit-material/navigation";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import type { NavigationDestination } from "@lit-material/navigation";

const destinations: NavigationDestination[] = [
  { label: "Overview", icon: "◎" },
  { label: "Upstreams", icon: "⇄" },
  { label: "Certificates", icon: "⚿" },
  { label: "Logs", icon: "≡" },
];

@customElement("docs-adaptive-navigation-page")
export class DocsAdaptiveNavigationPage extends LitElement {
  static override styles = [pageStyles];

  @state() private selected = 0;

  override render() {
    return html`
      <h1>Adaptive navigation</h1>
      <p>One list of destinations, shown as a bar under 600px, a rail from 600px and a drawer from 840px. Resize the window to see it switch.</p>
      <lit-material-adaptive-navigation
        label="Demo sections"
        .destinations=${destinations}
        .selected=${this.selected}
        @change=${(e: Event) => (this.selected = (e.target as unknown as { selected: number }).selected)}
      ></lit-material-adaptive-navigation>
      <p>Selected: ${destinations[this.selected]?.label}</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-adaptive-navigation-page": DocsAdaptiveNavigationPage;
  }
}
