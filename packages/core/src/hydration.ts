/**
 * True while `element` holds server-rendered (declarative) shadow DOM that
 * Lit has not hydrated yet.
 *
 * Hydration adopts the server's DOM as it is: a value set on the element
 * before its first (hydrating) update is recorded as already rendered but
 * never written, so the page keeps showing the server's value. A parent
 * that derives a child's state from the light DOM (a stepper numbering its
 * steps, a select showing its chosen option) must wait for this to turn
 * false, then set the state, so a real update writes it.
 */
export function awaitingHydration(element: Element): boolean {
  const el = element as Element & { hasUpdated?: boolean };
  // `hasUpdated` is undefined before the element is upgraded: still waiting.
  return el.hasUpdated !== true && (el.shadowRoot?.childNodes.length ?? 0) > 0;
}

/** Runs `apply` now, or right after `element` has hydrated if it is still server-rendered. */
export function afterHydration(element: Element, apply: () => void): void {
  if (!awaitingHydration(element)) {
    apply();
    return;
  }
  const el = element as Element & { updateComplete?: Promise<unknown> };
  // Not upgraded yet: wait for the definition, then for the hydrating update.
  void customElements
    .whenDefined(element.localName)
    .then(() => el.updateComplete)
    .then(apply);
}
