export type AriaElementsProperty = "ariaLabelledByElements" | "ariaDescribedByElements" | "ariaControlsElements";

/**
 * Points an element inside a shadow root at elements outside it, by ids
 * given to the host (`aria-labelledby="name-label"` on the component).
 *
 * An id attribute on the inner element can't do it: ids resolve within one
 * tree, so `aria-labelledby` on a button in the shadow root names nothing in
 * the page. ARIA element reflection can reference elements in the host's
 * trees, so this resolves `ids` (space-separated) where the host lives and
 * sets `property` on `target`. Browsers without element reflection get no
 * reference — as before in effect, since the id never resolved there either.
 */
export function setAriaElements(target: Element | null | undefined, property: AriaElementsProperty, ids: string | null | undefined, host: Element): void {
  if (!target || !(property in target)) return;
  const root = host.getRootNode() as Document | ShadowRoot;
  const elements = (ids ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => root.getElementById?.(id) ?? null)
    .filter((el): el is HTMLElement => el !== null);
  (target as unknown as Record<AriaElementsProperty, Element[] | null>)[property] = elements.length ? elements : null;
}
