import { queryDeep } from "./dom.js";
import { waitForUpdate } from "./wait.js";

/** The element that receives input for `target`: itself if editable, else the first input/textarea inside it. */
function editable(target: Element): HTMLInputElement | HTMLTextAreaElement | HTMLElement {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return target;
  if (target instanceof HTMLElement && target.isContentEditable) return target;
  const inner = queryDeep<HTMLInputElement | HTMLTextAreaElement>("input:not([type=hidden]), textarea", target);
  if (!inner) throw new Error(`type: no input or textarea in <${target.localName}>`);
  return inner;
}

/** The innermost focused element, through shadow roots. */
export function activeElement(): Element | null {
  let el: Element | null = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

/**
 * Small, synchronous stand-ins for user actions, dispatching the events a browser would and then waiting for
 * Lit updates. For real keyboard input and focus behaviour, prefer your test runner's own commands
 * (`@web/test-runner-commands`' `sendKeys`, Playwright's `page.keyboard`); these work anywhere.
 */
export const user = {
  /** Focuses (if focusable) and clicks, as a pointer would. */
  async click(target: Element): Promise<void> {
    const init = { bubbles: true, composed: true, cancelable: true, button: 0 };
    target.dispatchEvent(new PointerEvent("pointerdown", init));
    target.dispatchEvent(new MouseEvent("mousedown", init));
    if (target instanceof HTMLElement) target.focus();
    target.dispatchEvent(new PointerEvent("pointerup", init));
    target.dispatchEvent(new MouseEvent("mouseup", init));
    if (target instanceof HTMLElement) target.click();
    else target.dispatchEvent(new MouseEvent("click", init));
    await waitForUpdate();
  },

  /** Types `text` at the end of the field (an input, textarea, or an element containing one), one `input` event per character. */
  async type(target: Element, text: string): Promise<void> {
    const field = editable(target);
    field.focus();
    for (const char of text) {
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value += char;
      else field.textContent += char;
      field.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true, data: char, inputType: "insertText" }));
    }
    await waitForUpdate();
  },

  /** Empties the field and fires `input`. */
  async clear(target: Element): Promise<void> {
    const field = editable(target);
    field.focus();
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = "";
    else field.textContent = "";
    field.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true, inputType: "deleteContentBackward" }));
    await waitForUpdate();
  },

  /** Fires `change` on the field, as leaving it after typing would. */
  async commit(target: Element): Promise<void> {
    editable(target).dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await waitForUpdate();
  },

  /** `keydown` + `keyup` for `key` (`"Enter"`, `"ArrowDown"`, `"a"`) on the focused element, or `target`. */
  async press(key: string, target: Element | null = activeElement()): Promise<void> {
    if (!target) throw new Error("press: nothing is focused; pass a target");
    const init = { key, bubbles: true, composed: true, cancelable: true };
    target.dispatchEvent(new KeyboardEvent("keydown", init));
    target.dispatchEvent(new KeyboardEvent("keyup", init));
    await waitForUpdate();
  },
};
