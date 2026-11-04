/** Anything queries can start from. */
export type QueryRoot = Document | Element | ShadowRoot | DocumentFragment;

/**
 * Every element under `root` in document order, descending into open shadow roots (a host's shadow tree
 * comes before its light children, like the rendered order). Slotted light children are visited once,
 * as children of their host.
 */
export function* walk(root: QueryRoot): Generator<Element> {
  const children = root instanceof Element && root.shadowRoot ? [root.shadowRoot, ...root.children] : [...root.children];
  for (const child of children) {
    if (child instanceof ShadowRoot) {
      yield* walk(child);
      continue;
    }
    yield child;
    yield* walk(child);
  }
}

/** The first element matching `selector` anywhere under `root`, shadow roots included. */
export function queryDeep<E extends Element = Element>(selector: string, root: QueryRoot = document): E | null {
  for (const el of walk(root)) if (el.matches(selector)) return el as E;
  return null;
}

/** Every element matching `selector` under `root`, shadow roots included. */
export function queryAllDeep<E extends Element = Element>(selector: string, root: QueryRoot = document): E[] {
  return [...walk(root)].filter((el) => el.matches(selector)) as E[];
}

/** An element's parent in the composed tree: through shadow roots to their hosts. */
export function composedParent(el: Element): Element | null {
  if (el.assignedSlot) return el.assignedSlot;
  if (el.parentElement) return el.parentElement;
  const root = el.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

/**
 * Whether the element is hidden from assistive technology: `hidden`, `display: none`, `visibility: hidden`,
 * `aria-hidden="true"`, `inert` on it or any composed ancestor, or a light child no slot shows.
 */
export function isHidden(el: Element): boolean {
  for (let node: Element | null = el; node; node = composedParent(node)) {
    if (node.getAttribute("aria-hidden") === "true" || node.hasAttribute("inert")) return true;
    if (node instanceof HTMLElement && node.hidden) return true;
    const style = getComputedStyle(node);
    if (style.display === "none" || (node === el && style.visibility === "hidden")) return true;
    // A light child of a shadow host that no slot renders isn't shown.
    const parent = node.parentElement;
    if (parent?.shadowRoot && !node.assignedSlot) return true;
  }
  return false;
}
