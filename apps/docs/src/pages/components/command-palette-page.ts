import "@lit-material/command-palette";
import "@lit-material/button";
import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import type { CommandPaletteItem, CommandPaletteSelectDetail, LitMaterialCommandPalette } from "@lit-material/command-palette";

const items: CommandPaletteItem[] = [
  { id: "run", label: "Run collection", section: "Commands", shortcut: ["Ctrl", "R"] },
  { id: "new", label: "New request", section: "Commands", keywords: ["create", "add"] },
  { id: "theme", label: "Toggle dark theme", section: "Commands" },
  { id: "co", label: "Create order", section: "Requests", hint: "orders" },
  { id: "lo", label: "List orders", section: "Requests", hint: "orders" },
  { id: "pay", label: "Pay order", section: "Requests", hint: "payments" },
  { id: "stg", label: "Staging", section: "Environments" },
  { id: "prod", label: "Production", section: "Environments" },
];

@customElement("docs-command-palette-page")
export class DocsCommandPalettePage extends LitElement {
  static override styles = [pageStyles];

  @state() private chosen = "";
  @query("lit-material-command-palette") private palette!: LitMaterialCommandPalette;

  override render() {
    return html`
      <h1>Command palette</h1>
      <p>A modal search over commands and items. Type to filter, arrows to move, Enter to choose, Escape to close. Start with <code>&gt;</code> for commands only or <code>@</code> for environments.</p>
      <section>
        <h2>Try it</h2>
        <lit-material-button @click=${() => this.palette.show()}>Open the palette</lit-material-button>
        <p>Chosen: ${this.chosen || "nothing yet"}</p>
        <lit-material-command-palette
          .items=${items}
          .prefixes=${{ ">": "Commands", "@": "Environments" }}
          @select=${(e: CustomEvent<CommandPaletteSelectDetail>) => (this.chosen = e.detail.item.label)}
        ></lit-material-command-palette>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-command-palette-page": DocsCommandPalettePage;
  }
}
