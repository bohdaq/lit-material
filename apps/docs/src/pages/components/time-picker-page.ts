import "@lit-material/time-picker";
import "@lit-material/button";
import type { LitMaterialTimePicker } from "@lit-material/time-picker";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query, state } from "lit/decorators.js";

@customElement("docs-time-picker-page")
export class DocsTimePickerPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-time-picker")
  private timePicker?: LitMaterialTimePicker;

  @query("#demo-time-picker-24")
  private timePicker24?: LitMaterialTimePicker;

  @state()
  private valueLog = "";

  @state()
  private valueLog24 = "";

  private readonly open = (): void => this.timePicker?.show();
  private readonly open24 = (): void => this.timePicker24?.show();
  private readonly handleChange = (): void => {
    this.valueLog = `Selected: ${this.timePicker?.value}`;
  };
  private readonly handleChange24 = (): void => {
    this.valueLog24 = `Selected: ${this.timePicker24?.value}`;
  };

  override render() {
    return html`
      <h1>Time Picker</h1>
      <p>
        Clock-dial dialog. Tap a number, or press and drag anywhere on the dial — the value
        follows the pointer continuously.
      </p>

      <section>
        <h2>12-hour</h2>
        <lit-material-button variant="outlined" @click=${this.open}>Choose time</lit-material-button>
        <span style="margin-inline-start: 12px;">${this.valueLog}</span>
        <lit-material-time-picker id="demo-time-picker" value="14:30" @change=${this.handleChange}></lit-material-time-picker>
      </section>

      <section>
        <h2>24-hour</h2>
        <p>A second, inner dial ring (13–23, 00) appears for the hour selection.</p>
        <lit-material-button variant="outlined" @click=${this.open24}>Choose time</lit-material-button>
        <span style="margin-inline-start: 12px;">${this.valueLog24}</span>
        <lit-material-time-picker
          id="demo-time-picker-24"
          hour-cycle="24"
          value="14:30"
          @change=${this.handleChange24}
        ></lit-material-time-picker>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-time-picker-page": DocsTimePickerPage;
  }
}
