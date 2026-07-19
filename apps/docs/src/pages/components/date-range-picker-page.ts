import "@lit-material/date-picker";
import "@lit-material/button";
import type { LitMaterialDateRangePicker } from "@lit-material/date-picker";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query, state } from "lit/decorators.js";

@customElement("docs-date-range-picker-page")
export class DocsDateRangePickerPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-date-range-picker")
  private rangePicker?: LitMaterialDateRangePicker;

  @state()
  private valueLog = "";

  private readonly open = (): void => this.rangePicker?.show();
  private readonly handleChange = (): void => {
    this.valueLog = `Selected: ${this.rangePicker?.start} – ${this.rangePicker?.end}`;
  };

  override render() {
    return html`
      <h1>Date Range Picker</h1>
      <p>
        Calendar-grid, modal or docked, two-endpoint scope. Tap a day to set the start, tap again
        to set the end — hover (or move focus with the keyboard) to preview the range first.
      </p>

      <section>
        <h2>Modal</h2>
        <lit-material-button variant="outlined" @click=${this.open}>Choose dates</lit-material-button>
        <span style="margin-inline-start: 12px;">${this.valueLog}</span>
        <lit-material-date-range-picker
          id="demo-date-range-picker"
          start="2026-06-10"
          end="2026-06-20"
          min="2020-01-01"
          max="2030-12-31"
          @change=${this.handleChange}
        ></lit-material-date-range-picker>
      </section>

      <section>
        <h2>Docked</h2>
        <p>Always visible in-flow — no dialog, scrim, or <code>open</code>/<code>show()</code>/<code>close()</code>.</p>
        <lit-material-date-range-picker
          variant="docked"
          start="2026-06-10"
          end="2026-06-20"
          min="2020-01-01"
          max="2030-12-31"
        ></lit-material-date-range-picker>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-date-range-picker-page": DocsDateRangePickerPage;
  }
}
