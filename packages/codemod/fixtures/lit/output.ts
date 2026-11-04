import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@lit-material/list";
import "@lit-material/menu";
import "@lit-material/icon-button";
import "@lit-material/fab";
import "@lit-material/tabs";
import "@lit-material/progress";
import "@lit-material/divider";
import "@lit-material/slider";
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
      <lit-material-tabs .selected=${this.tab} @change=${(e: Event) => (this.tab = (e.target as HTMLElement & { activeTabIndex: number }).activeTabIndex)}>
        <lit-material-tab><lit-material-icon slot="icon">inbox</lit-material-icon>Inbox</lit-material-tab>
        <lit-material-tab>Sent</lit-material-tab>
      </lit-material-tabs>
      <lit-material-linear-progress indeterminate ?hidden=${!this.loading} four-color></lit-material-linear-progress>
      <lit-material-list>
        ${this.items.map(
          (item) => html`
            <lit-material-list-item interactive @click=${() => this.open(item.id)}>
              <div>${item.title}</div>
              <div slot="supporting-text">${item.from}</div>
              <lit-material-icon slot="leading">mail</lit-material-icon>
              <span slot="trailing">${unread.length > 0 ? "new" : ""}</span>
            </lit-material-list-item>
            <lit-material-divider inset-start inset-end></lit-material-divider>
          `,
        )}
      </lit-material-list>
      <span style="position: relative">
        <lit-material-icon-button id="more" aria-label="More" @click=${() => this.menu?.show()}>
          <lit-material-icon slot="icon">more_vert</lit-material-icon>
        </lit-material-icon-button>
        <lit-material-menu anchor="more" positioning="popover" @close=${() => this.focus()}>
          <lit-material-list-item interactive @click=${this.archive}><div>Archive</div></lit-material-list-item>
          <lit-material-list-item interactive keep-open><div>Mark read</div></lit-material-list-item>
        </lit-material-menu>
      </span>
      <lit-material-icon-button variant="tonal" toggle aria-label="Star">
        <lit-material-icon slot="icon">star_outline</lit-material-icon>
        <lit-material-icon slot="selected-icon">star</lit-material-icon>
      </lit-material-icon-button>
      <lit-material-slider labeled min="0" max="10" .value=${3}></lit-material-slider>
      <lit-material-fab extended color="primary" size="small" aria-label="Compose">${this.tab === 0 ? "Compose" : ""}
        <lit-material-icon slot="icon">edit</lit-material-icon>
      </lit-material-fab>
    `;
  }

  private get menu(): MdMenu | null {
    return this.renderRoot.querySelector("md-menu");
  }

  private open(_id: string) {}
  private archive() {}
}
