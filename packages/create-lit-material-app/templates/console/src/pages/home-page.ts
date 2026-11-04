import "@lit-material/stepper/checklist.js";
import "@lit-material/stat";
import "@lit-material/clipboard";
import "@lit-material/button";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "./page-styles.js";

/** Getting started until it's done (or dismissed), then the numbers that matter at a glance. */
@customElement("home-page")
export class HomePage extends LitElement {
  static override styles = [
    pageStyles,
    css`
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }
      lit-material-checklist {
        margin-bottom: 32px;
      }
    `,
  ];

  // Read these from your server: the checklist reflects real state, it never ticks itself.
  @state() private connected = true;
  @state() private invited = false;

  override render() {
    return html`
      <div class="title-row"><h1>Home</h1></div>
      <lit-material-checklist heading="Get started" dismissible storage-key="{{PROJECT_NAME}}-getting-started">
        <lit-material-checklist-item label="Connect your app" ?done=${this.connected}>
          <p>Point your app at this endpoint.</p>
          <lit-material-clipboard-copy label="API endpoint" value="https://api.example.com/v1"></lit-material-clipboard-copy>
        </lit-material-checklist-item>
        <lit-material-checklist-item label="Invite a teammate" ?done=${this.invited}>
          <p>People you invite get an email with a link to join.</p>
          <lit-material-button href="/members">Invite people</lit-material-button>
        </lit-material-checklist-item>
        <lit-material-checklist-item label="Choose a plan">
          <p>Free works for one person. Teams need a paid plan.</p>
          <lit-material-button variant="outlined" href="/settings">See plans</lit-material-button>
        </lit-material-checklist-item>
      </lit-material-checklist>
      <section>
        <h2>This week</h2>
        <div class="stats">
          <lit-material-stat label="Members" value="2"></lit-material-stat>
          <lit-material-stat label="Requests" value="1,284" trend="up" trend-label="12% on last week" trend-sentiment="positive"></lit-material-stat>
          <lit-material-stat label="Failed checks" value="0"></lit-material-stat>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "home-page": HomePage;
  }
}
