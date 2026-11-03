// Mobile menu: `[data-menu-toggle]` opens the panel its `aria-controls`
// names (default `#mobile-menu`). The panel gets `.open` a frame after it
// unhides, so CSS can transition it; `<html>` gets `.menu-open` to lock
// scrolling. Escape and widening past `breakpoint` close it.

export interface MenuOptions {
  /** Media query width at which the menu closes by itself. */
  breakpoint?: string;
}

export function initMenu({ breakpoint = "768px" }: MenuOptions = {}): void {
  const toggle = document.querySelector<HTMLElement>("[data-menu-toggle]");
  const panel = document.getElementById(toggle?.getAttribute("aria-controls") || "mobile-menu");
  if (!toggle || !panel) return;
  const set = (open: boolean) => {
    const was = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("menu-open", open);
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add("open"));
    } else {
      panel.classList.remove("open");
      const hide = () => {
        if (!panel.classList.contains("open")) panel.hidden = true;
      };
      panel.addEventListener("transitionend", hide, { once: true });
      setTimeout(hide, 500);
      if (was && panel.contains(document.activeElement)) toggle.focus();
    }
  };
  toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") set(false);
  });
  matchMedia(`(min-width: ${breakpoint})`).addEventListener("change", (e) => e.matches && set(false));
}
