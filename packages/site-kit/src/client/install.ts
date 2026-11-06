// Install panels: `[data-install-toggle]` shows and hides the panel its
// `aria-controls` names; the panel gets `.open` a frame after it unhides, so
// CSS can transition it. Every `lit-material-tabs` whose tabs carry
// `data-os="windows|mac|linux"` starts on the visitor's OS. Without JS the
// panel stays hidden and the toggle does nothing, so link the install docs
// next to it.

export type Os = "windows" | "mac" | "linux" | "";

interface NavigatorWithUAData extends Navigator {
  userAgentData?: { platform?: string };
}

/** The visitor's desktop OS from the platform string, or `""` when it's none of the three. */
export function guessOs(nav: NavigatorWithUAData = navigator): Os {
  const p = (nav.userAgentData?.platform || nav.platform || "").toLowerCase();
  if (p.includes("win")) return "windows";
  if (p.includes("mac")) return "mac";
  if (p.includes("linux")) return "linux";
  return "";
}

export interface InstallOptions {
  /** Overrides the detected OS, e.g. from a `?os=` parameter. */
  os?: Os;
}

export function initInstall({ os = guessOs() }: InstallOptions = {}): void {
  if (os) {
    for (const tabs of document.querySelectorAll<HTMLElement & { selected: number }>("lit-material-tabs")) {
      const index = [...tabs.querySelectorAll<HTMLElement>("lit-material-tab")].findIndex((t) => t.dataset.os === os);
      if (index > 0) void customElements.whenDefined("lit-material-tabs").then(() => (tabs.selected = index));
    }
  }
  for (const button of document.querySelectorAll<HTMLElement>("[data-install-toggle]")) {
    const panel = document.getElementById(button.getAttribute("aria-controls") ?? "");
    if (!panel) continue;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      if (open) requestAnimationFrame(() => panel.classList.add("open"));
      else panel.classList.remove("open");
    });
  }
}
