import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@material/web/list/list.js";
import "@material/web/list/list-item.js";
import "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/iconbutton/filled-tonal-icon-button.js";
import "@material/web/fab/fab.js";
import "@material/web/tabs/tabs.js";
import "@material/web/tabs/primary-tab.js";
import "@material/web/progress/linear-progress.js";
import "@material/web/divider/divider.js";
import "@material/web/slider/slider.js";
import { MdMenu } from "@material/web/menu/menu.js";

@customElement("inbox-view")
export class InboxView extends LitElement {
  static override styles = css`
    md-list {
      --md-list-container-color: transparent;
      background: var(--md-sys-color-surface-container);
    }
  `;

  @state() private tab = 0;
  @state() private loading = false;
  private readonly items: { id: string; title: string; from: string }[] = [];

  override render() {
    const unread: Array<string> = [];
    return html`
      <md-tabs .activeTabIndex=${this.tab} @change=${(e: Event) => (this.tab = (e.target as HTMLElement & { activeTabIndex: number }).activeTabIndex)}>
        <md-primary-tab has-icon><md-icon slot="icon">inbox</md-icon>Inbox</md-primary-tab>
        <md-primary-tab>Sent</md-primary-tab>
      </md-tabs>
      <md-linear-progress indeterminate ?hidden=${!this.loading} four-color></md-linear-progress>
      <md-list>
        ${this.items.map(
          (item) => html`
            <md-list-item type="button" @click=${() => this.open(item.id)}>
              <div slot="headline">${item.title}</div>
              <div slot="supporting-text">${item.from}</div>
              <md-icon slot="start">mail</md-icon>
              <span slot="end">${unread.length > 0 ? "new" : ""}</span>
            </md-list-item>
            <md-divider inset></md-divider>
          `,
        )}
      </md-list>
      <span style="position: relative">
        <md-icon-button id="more" aria-label="More" @click=${() => this.menu?.show()}>
          <md-icon>more_vert</md-icon>
        </md-icon-button>
        <md-menu anchor="more" positioning="popover" @closed=${() => this.focus()}>
          <md-menu-item @click=${this.archive}><div slot="headline">Archive</div></md-menu-item>
          <md-menu-item keep-open><div slot="headline">Mark read</div></md-menu-item>
        </md-menu>
      </span>
      <md-filled-tonal-icon-button toggle aria-label="Star">
        <md-icon>star_outline</md-icon>
        <md-icon slot="selected">star</md-icon>
      </md-filled-tonal-icon-button>
      <md-slider labeled min="0" max="10" .value=${3}></md-slider>
      <md-fab variant="primary" size="small" label=${this.tab === 0 ? "Compose" : ""} aria-label="Compose">
        <md-icon slot="icon">edit</md-icon>
      </md-fab>
    `;
  }

  private get menu(): MdMenu | null {
    return this.renderRoot.querySelector("md-menu");
  }

  private open(_id: string) {}
  private archive() {}
}
