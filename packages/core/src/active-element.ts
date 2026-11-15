/**
 * The chain of focused elements, outermost first: `document.activeElement`,
 * then each shadow root's own `activeElement` down to the element that
 * really has focus.
 *
 * `document.activeElement` alone retargets to the outermost shadow host, so
 * a roving-focus component used inside another component's shadow root
 * (the normal case in an app) would never see which of its items is
 * focused. Every element on this chain is "focused" from the point of view
 * of the tree it lives in.
 */
export function activeElementPath(doc: Document = document): Element[] {
  const path: Element[] = [];
  let active: Element | null = doc.activeElement;
  while (active) {
    path.push(active);
    active = active.shadowRoot?.activeElement ?? null;
  }
  return path;
}

/** The deepest focused element, through open shadow roots. */
export function deepActiveElement(doc: Document = document): Element | null {
  const path = activeElementPath(doc);
  return path[path.length - 1] ?? null;
}

/**
 * Which of `items` holds focus (itself, or something inside its shadow
 * root), wherever the items live: light DOM, nested slots, or another
 * component's shadow root. `undefined` when none does.
 */
export function focusedItem<T extends Element>(items: readonly T[], doc: Document = document): T | undefined {
  const path = activeElementPath(doc);
  for (let i = path.length - 1; i >= 0; i--) {
    const hit = items.find((item) => item === path[i]);
    if (hit) return hit;
  }
  // An item can also hold focus in its light DOM (a native control slotted into it).
  const deepest = path[path.length - 1];
  return deepest ? items.find((item) => item.contains(deepest)) : undefined;
}

/** True when focus is on `host` or anywhere inside it, through shadow roots. */
export function containsFocus(host: Element, doc: Document = document): boolean {
  return activeElementPath(doc).some((el) => el === host || host.contains(el) || host.shadowRoot?.contains(el));
}
