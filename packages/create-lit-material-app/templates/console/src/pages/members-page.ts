import "@lit-material/data-table";
import "@lit-material/select";
import "@lit-material/dialog";
import "@lit-material/text-field";
import "@lit-material/button";
import "@lit-material/icon-button";
import "@lit-material/empty-state";
import "@lit-material/skeleton";
import "@lit-material/alert";
import { confirm } from "@lit-material/confirm";
import { TaskController } from "@lit-material/task";
import type { LitMaterialDialog } from "@lit-material/dialog";
import { LitElement, css, html, nothing } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { invite, listMembers, removeMember, setRole, type Member, type Role } from "../api.js";
import { notify } from "../notify.js";
import { removeIcon } from "../icons.js";
import { pageStyles } from "./page-styles.js";

const roles: Role[] = ["member", "admin", "owner"];

/** A list people act on: skeleton while loading, empty state, inline role change, invite dialog, confirm on remove. */
@customElement("members-page")
export class MembersPage extends LitElement {
  static override styles = [
    pageStyles,
    css`
      .who {
        display: grid;
      }
      .email {
        color: var(--md-sys-color-on-surface-variant);
        font-size: 0.8125rem;
      }
      .pending {
        margin-inline-start: 8px;
        font-size: 0.75rem;
        color: var(--md-sys-color-on-surface-variant);
      }
      form {
        display: grid;
        gap: 16px;
        min-width: min(360px, 80vw);
      }
      lit-material-data-table lit-material-select {
        --lit-material-select-min-width: 120px;
      }
      .email {
        overflow-wrap: anywhere;
      }
      lit-material-skeleton {
        margin: 12px 0;
      }
    `,
  ];

  private readonly members = new TaskController(this, {
    task: (_args, signal) => listMembers(signal),
    args: () => [] as const,
  });

  @query("lit-material-dialog") private readonly dialog!: LitMaterialDialog;
  @state() private inviteError = "";
  @state() private sending = false;

  override render() {
    return html`
      <div class="title-row">
        <h1>Members</h1>
        <lit-material-button @click=${() => this.dialog.show()}>Invite</lit-material-button>
      </div>
      ${this.members.render({
        pending: () => html`${[1, 2, 3].map(() => html`<lit-material-skeleton height="44px"></lit-material-skeleton>`)}`,
        error: (error) => html`<lit-material-alert variant="error">${String(error)}</lit-material-alert>`,
        complete: (members) => (members.length ? this.table(members) : this.empty()),
      })}
      ${this.inviteDialog()}
    `;
  }

  private empty() {
    return html`<lit-material-empty-state headline="No members yet">
      Invite the people you work with. They get an email with a link to join.
      <lit-material-button slot="actions" @click=${() => this.dialog.show()}>Invite</lit-material-button>
    </lit-material-empty-state>`;
  }

  private table(members: Member[]) {
    return html`<lit-material-data-table aria-label="Members">
      <lit-material-data-table-row header>
        <lit-material-data-table-cell header flex>Name</lit-material-data-table-cell>
        <lit-material-data-table-cell header>Role</lit-material-data-table-cell>
        <lit-material-data-table-cell header></lit-material-data-table-cell>
      </lit-material-data-table-row>
      ${members.map(
        (m) => html`<lit-material-data-table-row data-row-id=${m.id}>
          <lit-material-data-table-cell flex>
            <span class="who"
              ><span>${m.name}${m.pending ? html`<span class="pending">Invited</span>` : nothing}</span
              ><span class="email">${m.email}</span></span
            >
          </lit-material-data-table-cell>
          <lit-material-data-table-cell>
            <lit-material-select
              variant="outlined"
              aria-label="Role of ${m.name}"
              .value=${m.role}
              @change=${(e: Event) => this.changeRole(m, (e.target as HTMLInputElement).value as Role)}
            >
              ${roles.map((r) => html`<lit-material-select-option value=${r}>${r}</lit-material-select-option>`)}
            </lit-material-select>
          </lit-material-data-table-cell>
          <lit-material-data-table-cell>
            <lit-material-icon-button aria-label="Remove ${m.name}" @click=${() => this.confirmRemove(m)}>
              <span slot="icon">${removeIcon}</span>
            </lit-material-icon-button>
          </lit-material-data-table-cell>
        </lit-material-data-table-row>`,
      )}
    </lit-material-data-table>`;
  }

  private inviteDialog() {
    return html`<lit-material-dialog @close=${() => (this.inviteError = "")}>
      <span slot="headline">Invite people</span>
      <form id="invite-form" @submit=${this.sendInvite}>
        ${this.inviteError ? html`<lit-material-alert variant="error">${this.inviteError}</lit-material-alert>` : nothing}
        <lit-material-text-field name="email" type="email" label="Email" required></lit-material-text-field>
        <lit-material-select name="role" label="Role" value="member">
          ${roles.map((r) => html`<lit-material-select-option value=${r}>${r}</lit-material-select-option>`)}
        </lit-material-select>
      </form>
      <lit-material-button slot="actions" variant="text" @click=${() => this.dialog.close()}>Cancel</lit-material-button>
      <lit-material-button slot="actions" type="submit" form="invite-form" ?disabled=${this.sending}>
        ${this.sending ? "Sending…" : "Send invite"}
      </lit-material-button>
    </lit-material-dialog>`;
  }

  private async sendInvite(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const email = String(data.get("email"));
    this.sending = true;
    this.inviteError = "";
    try {
      await invite(email, String(data.get("role")) as Role);
      this.dialog.close();
      form.reset();
      notify(`Invite sent to ${email}`);
      this.members.refresh();
    } catch (error) {
      this.inviteError = error instanceof Error ? error.message : String(error);
    } finally {
      this.sending = false;
    }
  }

  private async changeRole(member: Member, role: Role): Promise<void> {
    if (role === member.role) return;
    await setRole(member.id, role);
    notify(`${member.name} is now ${role === "admin" ? "an" : "a"} ${role}`);
    this.members.refresh();
  }

  private async confirmRemove(member: Member): Promise<void> {
    const ok = await confirm({
      headline: `Remove ${member.name}?`,
      message: "They lose access right away. You can invite them again later.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    await removeMember(member.id);
    notify(`${member.name} removed`);
    this.members.refresh();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "members-page": MembersPage;
  }
}
