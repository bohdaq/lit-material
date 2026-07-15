import "@lit-material/date-picker";
import "@lit-material/button";
import type { LitMaterialDatePicker } from "@lit-material/date-picker";
import { LitElement, html, css } from "lit";
import { customElement, query, state } from "lit/decorators.js";

@customElement("docs-date-picker-page")
export class DocsDatePickerPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @query("#demo-date-picker")
  private datePicker?: LitMaterialDatePicker;

  @state()
  private valueLog = "";

  private readonly open = (): void => this.datePicker?.show();
  private readonly handleChange = (): void => {
    this.valueLog = `Selected: ${this.datePicker?.value}`;
  };

  override render() {
    return html`
      <h1>Date Picker</h1>
      <p>Calendar-grid dialog (modal), plus text-field entry, single-date scope.</p>

      <lit-material-button variant="outlined" @click=${this.open}>Choose date</lit-material-button>
      <span style="margin-inline-start: 12px;">${this.valueLog}</span>
      <lit-material-date-picker
        id="demo-date-picker"
        value="2026-06-15"
        min="2020-01-01"
        max="2030-12-31"
        @change=${this.handleChange}
      ></lit-material-date-picker>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-date-picker-page": DocsDatePickerPage;
  }
}
