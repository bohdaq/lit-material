import { composedParent, isHidden } from "./dom.js";

const INPUT_ROLES: Record<string, string> = {
  button: "button",
  submit: "button",
  reset: "button",
  image: "button",
  checkbox: "checkbox",
  radio: "radio",
  range: "slider",
  number: "spinbutton",
  search: "searchbox",
  email: "textbox",
  tel: "textbox",
  text: "textbox",
  url: "textbox",
  password: "textbox",
};

/** The element's role: its `role` attribute (first token), else the implicit role of common HTML elements. */
export function roleOf(el: Element): string | null {
  const explicit = el.getAttribute("role")?.trim().split(/\s+/)[0];
  if (explicit) return explicit;
  const tag = el.localName;
  switch (tag) {
    case "a":
    case "area":
      return el.hasAttribute("href") ? "link" : null;
    case "button":
      return "button";
    case "input": {
      const type = (el.getAttribute("type") ?? "text").toLowerCase();
      if (type === "hidden") return null;
      if ((type === "text" || type === "search" || type === "email" || type === "tel" || type === "url") && el.hasAttribute("list")) {
        return "combobox";
      }
      return INPUT_ROLES[type] ?? "textbox";
    }
    case "textarea":
      return "textbox";
    case "select":
      return el.hasAttribute("multiple") || Number(el.getAttribute("size") ?? 0) > 1 ? "listbox" : "combobox";
    case "option":
      return "option";
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return "heading";
    case "ul":
    case "ol":
    case "menu":
      return "list";
    case "li":
      return "listitem";
    case "nav":
      return "navigation";
    case "main":
      return "main";
    case "header":
      return "banner";
    case "footer":
      return "contentinfo";
    case "aside":
      return "complementary";
    case "form":
      return "form";
    case "section":
      return el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby") ? "region" : null;
    case "dialog":
      return "dialog";
    case "img":
      return el.getAttribute("alt") === "" ? "presentation" : "img";
    case "table":
      return "table";
    case "tr":
      return "row";
    case "td":
      return "cell";
    case "th":
      return "columnheader";
    case "progress":
      return "progressbar";
    case "meter":
      return "meter";
    case "hr":
      return "separator";
    case "details":
      return "group";
    case "summary":
      return "button";
    case "fieldset":
      return "group";
    case "output":
      return "status";
    default:
      return null;
  }
}

// Roles whose name may come from their content.
const NAME_FROM_CONTENT = new Set([
  "button", "cell", "checkbox", "columnheader", "gridcell", "heading", "link", "menuitem", "menuitemcheckbox",
  "menuitemradio", "option", "radio", "row", "rowheader", "switch", "tab", "tooltip", "treeitem",
]);

function byId(el: Element, id: string): Element | null {
  const root = el.getRootNode() as Document | ShadowRoot;
  return root.getElementById?.(id) ?? null;
}

/** Visible text of an element, through shadow roots and slots, as it reads. */
function textOf(node: Node, visited: Set<Node>): string {
  if (visited.has(node)) return "";
  visited.add(node);
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof Element)) return "";
  if (node instanceof HTMLSlotElement) {
    const assigned = node.assignedNodes({ flatten: true });
    return (assigned.length ? assigned : [...node.childNodes]).map((n) => textOf(n, visited)).join("");
  }
  if (node.localName === "style" || node.localName === "script" || node.localName === "template") return "";
  if (isHiddenSelf(node)) return "";
  const own = node.getAttribute("aria-label")?.trim();
  if (own) return ` ${own} `;
  if (node.localName === "img") return node.getAttribute("alt") ?? "";
  if (node.localName === "input" || node.localName === "textarea" || node.localName === "select") return (node as HTMLInputElement).value ?? "";
  const kids = node.shadowRoot ? [...node.shadowRoot.childNodes] : [...node.childNodes];
  const block = getComputedStyle(node).display.startsWith("block") || node.localName === "br";
  const text = kids.map((n) => textOf(n, visited)).join("");
  return block ? ` ${text} ` : text;
}

function isHiddenSelf(el: Element): boolean {
  if (el.getAttribute("aria-hidden") === "true" || (el instanceof HTMLElement && el.hidden)) return true;
  return getComputedStyle(el).display === "none";
}

const clean = (text: string) => text.replace(/\s+/g, " ").trim();

/**
 * The element's accessible name, following the main steps of the accessible-name algorithm:
 * `aria-labelledby`, `aria-label`, `<label>`s (and form-associated custom elements' labels), `alt`/`title`/
 * `placeholder`, and content for roles named from content. Enough for test queries; not a full implementation.
 */
export function accessibleName(el: Element): string {
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => byId(el, id))
      .filter((x): x is Element => x !== null)
      .map((x) => textOf(x, new Set()))
      .join(" ");
    if (clean(text)) return clean(text);
  }
  const ariaLabelledByElements = (el as Element & { ariaLabelledByElements?: readonly Element[] | null }).ariaLabelledByElements;
  if (ariaLabelledByElements?.length) {
    const text = ariaLabelledByElements.map((x) => textOf(x, new Set())).join(" ");
    if (clean(text)) return clean(text);
  }
  const label = el.getAttribute("aria-label");
  if (label?.trim()) return clean(label);
  const labels = (el as HTMLInputElement).labels;
  if (labels && labels.length) {
    const text = [...labels].map((l) => textOf(l, new Set([el]))).join(" ");
    if (clean(text)) return clean(text);
  }
  if (el.localName === "img" || (el.localName === "input" && el.getAttribute("type") === "image")) {
    const alt = el.getAttribute("alt");
    if (alt) return clean(alt);
  }
  if (el.localName === "fieldset") {
    const legend = el.querySelector(":scope > legend");
    if (legend) return clean(textOf(legend, new Set()));
  }
  if (el.localName === "table") {
    const caption = el.querySelector(":scope > caption");
    if (caption) return clean(textOf(caption, new Set()));
  }
  const role = roleOf(el);
  if (role && NAME_FROM_CONTENT.has(role)) {
    const kids = el.shadowRoot ? [...el.shadowRoot.childNodes] : [...el.childNodes];
    const text = clean(kids.map((n) => textOf(n, new Set([el]))).join(""));
    if (text) return text;
    if (el.localName === "input") {
      const value = (el as HTMLInputElement).value;
      if (value && ["button", "submit", "reset"].includes((el as HTMLInputElement).type)) return clean(value);
    }
  }
  const title = el.getAttribute("title") ?? (el.localName === "input" || el.localName === "textarea" ? el.getAttribute("placeholder") : null);
  return title ? clean(title) : "";
}

/** True if the element can be operated by the user: not `disabled` and not inside a disabled fieldset. */
export function isDisabled(el: Element): boolean {
  for (let node: Element | null = el; node; node = composedParent(node)) {
    if (node.getAttribute("aria-disabled") === "true") return true;
    if ((node as HTMLButtonElement).disabled === true && node === el) return true;
  }
  return false;
}

export { isHidden };
