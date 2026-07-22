import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./data-list-item-styles.js";

/**
 * One row within `lit-material-data-list`. The default slot holds this
 * row's `lit-material-data-list-cell` elements (or any content — cells are
 * a convenience, not a requirement), laid out as a flex row.
 *
 * `expandable` switches the row to a native `<details>`/`<summary>` — the
 * row's own content becomes the always-visible `<summary>`, and
 * `expanded-content` reveals underneath it — rather than reimplementing
 * disclosure state, ARIA, and keyboard handling by hand the way
 * `lit-material-accordion` does with its own expand/collapse machinery.
 * `<details>` doesn't fire its native `toggle` event across a shadow
 * boundary (it neither bubbles nor composes), so this re-dispatches its own
 * `toggle` from the host — listen for that, not the inner one you can't
 * reach anyway.
 *
 * @element lit-material-data-list-item
 *
 * @slot - The row's content — typically `lit-material-data-list-cell` elements.
 * @slot expanded-content - Extra content revealed when `expandable` and `open`.
 *
 * @csspart row - The row (or, when `expandable`, the `<details>` itself).
 * @csspart summary - The `<summary>`. Only rendered when `expandable`.
 * @csspart expanded - The expanded-content container. Only rendered when `expandable`.
 *
 * @fires toggle - When `expandable`, fires after `open` changes via user interaction.
 */
@customElement("lit-material-data-list-item")
export class LitMaterialDataListItem extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) expandable = false;

  /** Whether an `expandable` row's extra content is showing. Ignored otherwise. */
  @property({ type: Boolean, reflect: true }) open = false;

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "listitem");
    }
  }

  override render() {
    if (this.expandable) {
      return html`
        <details class="row expandable" part="row" ?open=${this.open} @toggle=${this.handleToggle}>
          <summary class="summary" part="summary"><slot></slot></summary>
          <div class="expanded" part="expanded"><slot name="expanded-content"></slot></div>
        </details>
      `;
    }
    return html`<div class="row" part="row"><slot></slot></div>`;
  }

  private readonly handleToggle = (event: Event): void => {
    this.open = (event.target as HTMLDetailsElement).open;
    this.dispatchEvent(new Event("toggle", { bubbles: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-list-item": LitMaterialDataListItem;
  }
}
