import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  angleFromCenter,
  angleToIndex,
  formatTime,
  hour12To24,
  hour24To12,
  pad2,
  parseTime,
  pointAtAngle,
  ringAngles,
} from "./time-utils.js";
import { styles } from "./time-picker-styles.js";

export type TimePickerHourCycle = "12" | "24";
type PickerMode = "hour" | "minute";

const OUTER_RADIUS = 100;
const INNER_RADIUS = 62;
const RING_THRESHOLD = (OUTER_RADIUS + INNER_RADIUS) / 2;

function defaultTime(): { hour: number; minute: number } {
  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes() };
}

/**
 * Material Design 3 time picker — a clock-dial dialog, built on the native
 * `<dialog>` element like `lit-material-dialog` (scrim, Escape-to-close,
 * focus trap all come from the browser). No prior pattern in this repo to
 * build on — the dial is a fresh design, the most novel interaction of any
 * component here.
 *
 * Tap a number, or press and drag anywhere on the dial (mouse, touch, or
 * pen — it's built on Pointer Events, one code path for all three) to pick
 * a value continuously; releasing after a drag started in hour mode
 * auto-advances to minute mode, the same progressive flow native OS time
 * pickers use. Every number is a real `<button>`, so Tab + Enter/Space
 * reaches all of them without any custom keyboard handling on the dial
 * itself. In `hourCycle="24"`, the dial grows a second, inner ring (13–23,
 * 00) the way the MD3 spec's 24-hour dial does — tapping/dragging into the
 * inner ring vs. the outer one is disambiguated by distance from center,
 * not just angle.
 *
 * Tapping a value highlights it immediately but doesn't commit it — the
 * same two-step "pick, then confirm" flow `lit-material-date-picker` uses.
 * `change` only fires once "OK" is clicked; "Cancel" (Escape, a backdrop
 * click, or the Cancel button) discards the in-progress pick and leaves
 * `value` untouched.
 *
 * Deliberately out of scope for this first pass: the manual keyboard-entry
 * text field mode MD3 lets you toggle to (dial-only here, matching
 * `lit-material-date-picker`'s own identical scope cut) — and, since MD3's
 * own spec doesn't define one, there's no `docked` variant either.
 *
 * @element lit-material-time-picker
 *
 * @csspart dialog - The native `<dialog>` element.
 * @csspart container - The visible card.
 * @csspart label - The small label above the time display.
 * @csspart time-display - The row holding the hour/minute fields and AM/PM toggle.
 * @csspart hour-field - The hour display/selector button.
 * @csspart minute-field - The minute display/selector button.
 * @csspart period-toggle - The AM/PM button pair. Only rendered for `hourCycle="12"`.
 * @csspart dial - The clock face.
 * @csspart dial-number - Each selectable number on the dial.
 * @csspart actions - The Cancel/OK row.
 *
 * @fires change - Fires when a time is confirmed via "OK" and `value` actually changed.
 * @fires cancel - Re-dispatched from the native `cancel` event. Cancelable: calling
 *   `preventDefault()` stops the dialog from closing.
 * @fires close - Re-dispatched from the native `close` event, after the dialog has closed.
 */
@customElement("lit-material-time-picker")
export class LitMaterialTimePicker extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;
  /** The confirmed time, as a 24-hour "HH:MM" string (e.g. "14:05"). */
  @property() value?: string;
  @property({ attribute: "hour-cycle" }) hourCycle: TimePickerHourCycle = "12";
  @property() label = "Select time";

  @state() private mode: PickerMode = "hour";
  @state() private pendingHour: number;
  @state() private pendingMinute: number;
  @state() private dragging = false;

  @query("dialog") private readonly dialogElement?: HTMLDialogElement;
  @query(".dial") private readonly dialElement?: HTMLElement;
  private reopenOnClose = false;
  private hasInitializedFromValue = false;

  constructor() {
    super();
    // Placeholder defaults only — attribute-derived initial property values
    // (e.g. value="14:05") aren't applied until after the constructor runs,
    // so the real sync to `value` happens in willUpdate() below.
    const initial = defaultTime();
    this.pendingHour = initial.hour;
    this.pendingMinute = initial.minute;
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    // Sync the pending selection from `value` on first render — including
    // SSR, which willUpdate() runs during but connectedCallback() and
    // updated() do not usefully affect — and again whenever `value` changes
    // externally while closed (a controlled-component pattern). Skipped
    // while `open`, so an in-progress pick isn't yanked out from under the
    // user; show() handles resetting state for a fresh open.
    if (this.hasInitializedFromValue && (!changed.has("value") || this.open)) return;
    this.hasInitializedFromValue = true;
    const parsed = (this.value && parseTime(this.value)) || defaultTime();
    this.pendingHour = parsed.hour;
    this.pendingMinute = parsed.minute;
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open") || !this.dialogElement) return;
    if (this.open && !this.dialogElement.open) {
      this.dialogElement.showModal();
    } else if (!this.open && this.dialogElement.open) {
      this.dialogElement.close();
    }
  }

  /** Opens the picker, resetting its selection to `value` (or the current time). Equivalent to setting `.open = true` after that reset. */
  show(): void {
    const parsed = (this.value && parseTime(this.value)) || defaultTime();
    this.pendingHour = parsed.hour;
    this.pendingMinute = parsed.minute;
    this.mode = "hour";
    this.open = true;
  }

  /** Closes the picker without confirming a selection. Equivalent to setting `.open = false`. */
  close(returnValue?: string): void {
    this.open = false;
    if (returnValue !== undefined && this.dialogElement) {
      this.dialogElement.returnValue = returnValue;
    }
  }

  private get displayHour(): string {
    if (this.hourCycle === "24") return pad2(this.pendingHour);
    return String(hour24To12(this.pendingHour).hour12);
  }

  private getSelectionAngle(): number {
    if (this.mode === "minute") return this.pendingMinute * 6;
    if (this.hourCycle === "24") {
      if (this.pendingHour === 0) return 0;
      if (this.pendingHour <= 12) return this.pendingHour === 12 ? 0 : this.pendingHour * 30;
      return (this.pendingHour - 12) * 30;
    }
    const { hour12 } = hour24To12(this.pendingHour);
    return hour12 === 12 ? 0 : hour12 * 30;
  }

  private getSelectionRadius(): number {
    if (this.mode === "minute" || this.hourCycle !== "24") return OUTER_RADIUS;
    return this.pendingHour === 0 || this.pendingHour >= 13 ? INNER_RADIUS : OUTER_RADIUS;
  }

  override render() {
    return html`
      <dialog
        class="dialog"
        part="dialog"
        aria-labelledby="time-headline"
        @close=${this.handleClose}
        @cancel=${this.handleCancel}
        @click=${this.handleBackdropClick}
      >
        <div class="container" part="container" tabindex="-1" autofocus>
          <div class="label" part="label" id="time-headline">${this.label}</div>
          <div class="time-display" part="time-display">
            <button
              class="field hour ${this.mode === "hour" ? "active" : ""}"
              part="hour-field"
              type="button"
              aria-label="Hour"
              @click=${this.handleHourFieldClick}
            >
              ${this.displayHour}
            </button>
            <span class="colon" aria-hidden="true">:</span>
            <button
              class="field minute ${this.mode === "minute" ? "active" : ""}"
              part="minute-field"
              type="button"
              aria-label="Minutes"
              @click=${this.handleMinuteFieldClick}
            >
              ${pad2(this.pendingMinute)}
            </button>
            ${this.hourCycle === "12" ? this.renderPeriodToggle() : nothing}
          </div>
          <div class="dial-wrapper" part="dial-wrapper">
            <div
              class="dial"
              part="dial"
              role="group"
              aria-label=${this.mode === "hour" ? "Hour" : "Minutes"}
              @pointerdown=${this.handlePointerDown}
              @pointermove=${this.handlePointerMove}
              @pointerup=${this.handlePointerUp}
              @pointercancel=${this.handlePointerCancel}
            >
              <div class="center-dot" part="center-dot"></div>
              ${this.renderSelection()}
              ${this.mode === "hour" ? this.renderHourNumbers() : this.renderMinuteNumbers()}
            </div>
          </div>
          <div class="actions" part="actions">
            <button class="text-button" part="cancel-button" type="button" @click=${this.handleCancelClick}>
              Cancel
            </button>
            <button class="text-button" part="ok-button" type="button" @click=${this.handleOkClick}>OK</button>
          </div>
        </div>
      </dialog>
    `;
  }

  private renderPeriodToggle() {
    const { isPM } = hour24To12(this.pendingHour);
    return html`
      <div class="period-toggle" part="period-toggle">
        <button
          class="period ${!isPM ? "selected" : ""}"
          part="am-button"
          type="button"
          aria-pressed=${!isPM}
          @click=${() => this.setPeriod(false)}
        >
          AM
        </button>
        <button
          class="period ${isPM ? "selected" : ""}"
          part="pm-button"
          type="button"
          aria-pressed=${isPM}
          @click=${() => this.setPeriod(true)}
        >
          PM
        </button>
      </div>
    `;
  }

  private renderSelection() {
    const angle = this.getSelectionAngle();
    const radius = this.getSelectionRadius();
    const { x, y } = pointAtAngle(angle, radius);
    return html`
      <div
        class="selection-line"
        part="selection-line"
        style="height: ${radius}px; transform: rotate(${angle}deg);"
      ></div>
      <div class="selection-dot" part="selection-dot" style="transform: translate(${x}px, ${y}px);"></div>
    `;
  }

  private renderHourNumbers() {
    const angles = ringAngles(12);
    if (this.hourCycle !== "24") {
      const { isPM } = hour24To12(this.pendingHour);
      return angles.map((angle, i) => {
        const hour12 = i === 0 ? 12 : i;
        const value = hour12To24(hour12, isPM);
        return this.renderDialButton(value, String(hour12), angle, OUTER_RADIUS);
      });
    }
    const outer = angles.map((angle, i) => {
      const value = i === 0 ? 12 : i;
      return this.renderDialButton(value, String(value), angle, OUTER_RADIUS);
    });
    const inner = angles.map((angle, i) => {
      const value = i === 0 ? 0 : i + 12;
      return this.renderDialButton(value, pad2(value), angle, INNER_RADIUS);
    });
    return [...outer, ...inner];
  }

  private renderMinuteNumbers() {
    const angles = ringAngles(12);
    return angles.map((angle, i) => this.renderDialButton(i * 5, pad2(i * 5), angle, OUTER_RADIUS));
  }

  private renderDialButton(value: number, label: string, angleDeg: number, radius: number) {
    const { x, y } = pointAtAngle(angleDeg, radius);
    const selected = this.mode === "hour" ? value === this.pendingHour : value === this.pendingMinute;
    return html`
      <button
        class="dial-number ${selected ? "selected" : ""}"
        part="dial-number"
        type="button"
        style="transform: translate(${x}px, ${y}px);"
        @click=${() => this.handleNumberClick(value)}
      >
        ${label}
      </button>
    `;
  }

  private setPeriod(isPM: boolean): void {
    const { hour12 } = hour24To12(this.pendingHour);
    this.pendingHour = hour12To24(hour12, isPM);
  }

  private updateFromPointer(clientX: number, clientY: number): void {
    const rect = this.dialElement?.getBoundingClientRect();
    if (!rect) return;
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const angle = angleFromCenter(dx, dy);

    if (this.mode === "minute") {
      this.pendingMinute = angleToIndex(angle, 60) % 60;
      return;
    }

    if (this.hourCycle !== "24") {
      const index = angleToIndex(angle, 12);
      const hour12 = index === 0 ? 12 : index;
      const { isPM } = hour24To12(this.pendingHour);
      this.pendingHour = hour12To24(hour12, isPM);
      return;
    }

    const radius = Math.sqrt(dx * dx + dy * dy);
    const index = angleToIndex(angle, 12);
    const isInner = radius < RING_THRESHOLD;
    this.pendingHour = isInner ? (index === 0 ? 0 : index + 12) : index === 0 ? 12 : index;
  }

  private readonly handleHourFieldClick = (): void => {
    this.mode = "hour";
  };

  private readonly handleMinuteFieldClick = (): void => {
    this.mode = "minute";
  };

  private readonly handleNumberClick = (value: number): void => {
    if (this.mode === "minute") {
      this.pendingMinute = value;
    } else {
      this.pendingHour = value;
      this.mode = "minute";
    }
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    try {
      this.dialElement?.setPointerCapture(event.pointerId);
    } catch {
      // A pointer id without a currently-"active" pointer (synthetic events,
      // as tests dispatch, or certain non-standard input sources) can't be
      // captured — dragging still works via bubbling pointermove/pointerup
      // in that case, just without the guarantee of continuing to receive
      // them if the pointer strays outside the dial's own bounds.
    }
    this.dragging = true;
    this.updateFromPointer(event.clientX, event.clientY);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;
    this.updateFromPointer(event.clientX, event.clientY);
  };

  private readonly handlePointerUp = (): void => {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.mode === "hour") this.mode = "minute";
  };

  private readonly handlePointerCancel = (): void => {
    this.dragging = false;
  };

  private readonly handleCancelClick = (): void => {
    this.close("cancel");
  };

  private readonly handleOkClick = (): void => {
    const nextValue = formatTime(this.pendingHour, this.pendingMinute);
    const changed = nextValue !== this.value;
    this.value = nextValue;
    if (changed) this.dispatchEvent(new Event("change", { bubbles: true }));
    this.close("ok");
  };

  private handleClose(): void {
    if (this.reopenOnClose) {
      // Some browsers don't honor preventDefault() on the native `cancel`
      // event despite documenting it as cancelable — see lit-material-dialog
      // for the same workaround.
      this.reopenOnClose = false;
      this.dialogElement?.showModal();
      return;
    }
    this.open = false;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  }

  private handleCancel(event: Event): void {
    const proceed = this.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true, composed: true }));
    if (!proceed) {
      event.preventDefault();
      this.reopenOnClose = true;
    }
  }

  private handleBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogElement) {
      this.dialogElement?.close();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-time-picker": LitMaterialTimePicker;
  }
}
