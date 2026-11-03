// Scroll reveals: `.reveal` elements get `.in` once they enter the viewport.
// CSS should hide them only under `html.js` (see `themeBootScript`), so the
// page reads in full without JS. Each element reveals once; with reduced
// motion all reveal at once.

export interface RevealOptions {
  selector?: string;
  rootMargin?: string;
}

export function initReveal({ selector = ".reveal", rootMargin = "0px 0px -10% 0px" }: RevealOptions = {}): void {
  const els = document.querySelectorAll(selector);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin },
  );
  els.forEach((el) => io.observe(el));
}
