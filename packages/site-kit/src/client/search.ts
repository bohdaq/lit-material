// Site search in a <dialog>, backed by Pagefind's index (or any `load` that
// returns the same shape), loaded on first use. `[data-search-open]`
// buttons, "/" and Ctrl/Cmd+K open it.
//
// Markup: <dialog class="search-dialog"> with an <input> and an element
// with class `search-results` (see `searchDialog` in templates.js).

export interface SearchResultData {
  url: string;
  excerpt: string;
  meta: { title?: string };
}

export interface SearchIndex {
  search(query: string, options?: object): Promise<{ results: { data(): Promise<SearchResultData> }[] }>;
}

export interface SearchOptions {
  /** Loads the index; by default Pagefind from `/pagefind/pagefind.js`. */
  load?: () => Promise<SearchIndex>;
  /** Search options per query, such as Pagefind filters. */
  options?: () => object;
  /** HTML shown under "No pages match" (trusted: write it yourself). */
  emptyHint?: string;
  /** Results to show. */
  limit?: number;
  /** Debounce in milliseconds. */
  delay?: number;
}

const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const SKELETON = '<div class="search-skeleton"></div>'.repeat(3);

const pagefind = (): Promise<SearchIndex> => {
  // Not bundled: the file only exists after `pagefind --site dist`.
  const url = "/pagefind/pagefind.js";
  return import(/* @vite-ignore */ url);
};

export function initSearch({ load = pagefind, options, emptyHint = "", limit = 8, delay = 150 }: SearchOptions = {}): void {
  const dialog = document.querySelector<HTMLDialogElement>(".search-dialog");
  const input = dialog?.querySelector("input");
  const results = dialog?.querySelector<HTMLElement>(".search-results");
  if (!dialog || !input || !results) return;
  let index: Promise<SearchIndex> | undefined;
  let token = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    input.select();
  };
  for (const b of document.querySelectorAll("[data-search-open]")) b.addEventListener("click", open);
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "") || (document.activeElement as HTMLElement | null)?.isContentEditable;
    if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      open();
    }
  });

  // A search input eats the first Escape to clear itself; a palette should close.
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      dialog.close();
    }
  });

  input.addEventListener("input", () => {
    clearTimeout(timer);
    const query = input.value.trim();
    const mine = ++token;
    if (!query) {
      results.innerHTML = "";
      return;
    }
    results.innerHTML = SKELETON;
    // Our own debounce: Pagefind's debouncedSearch drops the last query when
    // several arrive while the index is still loading.
    timer = setTimeout(async () => {
      try {
        index ??= load();
        const search = await (await index).search(query, options?.() ?? {});
        if (mine !== token) return;
        const items = await Promise.all(search.results.slice(0, limit).map((r) => r.data()));
        if (mine !== token) return;
        // Pagefind's excerpt is HTML it escaped itself, with <mark> around matches.
        results.innerHTML = items.length
          ? `<ul>${items.map((d) => `<li><a href="${escape(d.url)}"><b>${escape(d.meta.title ?? d.url)}</b><span>${d.excerpt}</span></a></li>`).join("")}</ul>`
          : `<p class="search-empty">No pages match “${escape(query)}”.${emptyHint ? ` ${emptyHint}` : ""}</p>`;
      } catch {
        index = undefined;
        if (mine === token) results.innerHTML = '<p class="search-empty">Search is unavailable right now. Use the navigation or reload the page.</p>';
      }
    }, delay);
  });
}
