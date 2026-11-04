import { render, type TemplateResult } from "lit";
import { waitForUpdate } from "./wait.js";

const mounted = new Set<HTMLElement>();

export interface FixtureOptions {
  /** Where to attach the fixture. Default: a new `<div>` appended to `document.body`. */
  container?: HTMLElement;
}

/**
 * Renders a Lit template (or an HTML string) into the page, waits until every element in it — and every
 * element they render, through shadow roots — has finished updating, and returns the first element. Remove
 * everything with `cleanup()`, e.g. in `afterEach`.
 *
 * ```ts
 * const field = await fixture<LitMaterialTextField>(html`<lit-material-text-field label="Email"></lit-material-text-field>`);
 * ```
 */
export async function fixture<E extends Element = HTMLElement>(content: TemplateResult | string, options: FixtureOptions = {}): Promise<E> {
  const container = options.container ?? document.createElement("div");
  if (!options.container) {
    container.dataset.litMaterialFixture = "";
    document.body.append(container);
  }
  mounted.add(container);
  if (typeof content === "string") container.append(document.createRange().createContextualFragment(content));
  else render(content, container);
  await waitForUpdate(container);
  const first = container.firstElementChild;
  if (!first) throw new Error("fixture: the template rendered no element");
  return first as E;
}

/** Removes everything `fixture()` added (and clears containers it was given). */
export function cleanup(): void {
  for (const container of mounted) {
    if (container.dataset.litMaterialFixture !== undefined) container.remove();
    else render(null, container);
  }
  mounted.clear();
}
