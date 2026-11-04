import { walk, type QueryRoot } from "./dom.js";
import { accessibleName, isHidden, roleOf } from "./roles.js";
import { waitFor } from "./wait.js";

export type TextMatch = string | RegExp;

export interface RoleOptions {
  /** The accessible name: exact (whitespace-normalized) string, or a RegExp. */
  name?: TextMatch;
  /** Where to search. Default: `document`. */
  root?: QueryRoot;
  /** Include elements hidden from assistive technology. Default `false`. */
  hidden?: boolean;
  /** Heading level (`<h2>`, `aria-level`). */
  level?: number;
  /** `aria-checked` / `.checked`. */
  checked?: boolean;
  /** `aria-selected`. */
  selected?: boolean;
  /** `aria-expanded`. */
  expanded?: boolean;
  /** `aria-pressed`. */
  pressed?: boolean;
}

export interface TextOptions {
  root?: QueryRoot;
  hidden?: boolean;
  /** CSS selector the element must match. Default: any element whose own text matches. */
  selector?: string;
}

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
const matches = (text: string, match: TextMatch) => (typeof match === "string" ? normalize(text) === normalize(match) : match.test(text));

function stateOf(el: Element, attr: string, prop?: string): boolean | undefined {
  const value = el.getAttribute(attr);
  if (value === "true" || value === "mixed") return true;
  if (value === "false") return false;
  if (prop && prop in el) return Boolean((el as unknown as Record<string, unknown>)[prop]);
  return undefined;
}

function levelOf(el: Element): number | undefined {
  const aria = el.getAttribute("aria-level");
  if (aria) return Number(aria);
  const m = /^h([1-6])$/.exec(el.localName);
  return m ? Number(m[1]) : undefined;
}

function roleMatches(el: Element, role: string, options: RoleOptions): boolean {
  if (roleOf(el) !== role) return false;
  if (!options.hidden && isHidden(el)) return false;
  if (options.name !== undefined && !matches(accessibleName(el), options.name)) return false;
  if (options.level !== undefined && levelOf(el) !== options.level) return false;
  if (options.checked !== undefined && stateOf(el, "aria-checked", "checked") !== options.checked) return false;
  if (options.selected !== undefined && stateOf(el, "aria-selected") !== options.selected) return false;
  if (options.expanded !== undefined && stateOf(el, "aria-expanded") !== options.expanded) return false;
  if (options.pressed !== undefined && stateOf(el, "aria-pressed") !== options.pressed) return false;
  return true;
}

function describe(root: QueryRoot, hidden = false): string {
  const lines: string[] = [];
  for (const el of walk(root)) {
    const role = roleOf(el);
    if (!role || role === "presentation" || role === "none" || (!hidden && isHidden(el))) continue;
    lines.push(`  ${role}${accessibleName(el) ? ` "${accessibleName(el)}"` : ""}`);
    if (lines.length >= 40) {
      lines.push("  …");
      break;
    }
  }
  return lines.length ? `Roles found:\n${lines.join("\n")}` : "No elements with a role found.";
}

const label = (role: string, options: RoleOptions) =>
  `role "${role}"${options.name !== undefined ? ` named ${String(options.name)}` : ""}`;

/** Every element with this role (and name/state), through shadow roots. */
export function getAllByRole<E extends Element = HTMLElement>(role: string, options: RoleOptions = {}): E[] {
  const found = queryAllByRole<E>(role, options);
  if (!found.length) throw new Error(`No element with ${label(role, options)}.\n${describe(options.root ?? document, options.hidden)}`);
  return found;
}

export function queryAllByRole<E extends Element = HTMLElement>(role: string, options: RoleOptions = {}): E[] {
  return [...walk(options.root ?? document)].filter((el) => roleMatches(el, role, options)) as E[];
}

/** The one element with this role (and name/state); throws if there's none or more than one. */
export function getByRole<E extends Element = HTMLElement>(role: string, options: RoleOptions = {}): E {
  const found = getAllByRole<E>(role, options);
  if (found.length > 1) throw new Error(`${found.length} elements with ${label(role, options)}; narrow it with { name } or { root }.`);
  return found[0]!;
}

/** Like `getByRole`, but `null` when there's none. */
export function queryByRole<E extends Element = HTMLElement>(role: string, options: RoleOptions = {}): E | null {
  const found = queryAllByRole<E>(role, options);
  if (found.length > 1) throw new Error(`${found.length} elements with ${label(role, options)}; narrow it with { name } or { root }.`);
  return found[0] ?? null;
}

/** Waits (default 1 s) for exactly one element with this role to appear. */
export function findByRole<E extends Element = HTMLElement>(role: string, options: RoleOptions & { timeout?: number } = {}): Promise<E> {
  return waitFor(() => getByRole<E>(role, options), { timeout: options.timeout });
}

function ownText(el: Element): string {
  let text = "";
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
    else if (node instanceof HTMLSlotElement) text += node.assignedNodes({ flatten: true }).filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join("");
  }
  return text;
}

/** Elements whose own text (not their descendants') matches, through shadow roots. */
export function queryAllByText<E extends Element = HTMLElement>(text: TextMatch, options: TextOptions = {}): E[] {
  return [...walk(options.root ?? document)].filter(
    (el) =>
      (options.selector ? el.matches(options.selector) : !["script", "style", "template"].includes(el.localName)) &&
      matches(ownText(el), text) &&
      (options.hidden || !isHidden(el)),
  ) as E[];
}

export function getByText<E extends Element = HTMLElement>(text: TextMatch, options: TextOptions = {}): E {
  const found = queryAllByText<E>(text, options);
  if (found.length !== 1) throw new Error(`${found.length ? `${found.length} elements` : "No element"} with text ${String(text)}.`);
  return found[0]!;
}

export function queryByText<E extends Element = HTMLElement>(text: TextMatch, options: TextOptions = {}): E | null {
  return queryAllByText<E>(text, options)[0] ?? null;
}

export function findByText<E extends Element = HTMLElement>(text: TextMatch, options: TextOptions & { timeout?: number } = {}): Promise<E> {
  return waitFor(() => getByText<E>(text, options), { timeout: options.timeout });
}

/**
 * The form control (any role) whose accessible name matches: `getByLabel("Email")` finds the `<input>` inside a
 * `<lit-material-text-field label="Email">`.
 */
export function getByLabel<E extends Element = HTMLElement>(name: TextMatch, options: Omit<RoleOptions, "name"> = {}): E {
  const controls = [...walk(options.root ?? document)].filter((el) => {
    const role = roleOf(el);
    return (
      role !== null &&
      ["textbox", "searchbox", "combobox", "listbox", "checkbox", "radio", "switch", "slider", "spinbutton"].includes(role) &&
      (options.hidden || !isHidden(el)) &&
      matches(accessibleName(el), name)
    );
  });
  if (controls.length !== 1) {
    throw new Error(`${controls.length ? `${controls.length} controls` : "No control"} labelled ${String(name)}.\n${describe(options.root ?? document)}`);
  }
  return controls[0] as E;
}
