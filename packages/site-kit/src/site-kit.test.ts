import { expect, fixture, html } from "@open-wc/testing";
import { render } from "lit";
import { initMenu } from "./client/menu.js";
import { initSearch, type SearchIndex } from "./client/search.js";
import { initThemeToggle, themeBootScript } from "./client/theme.js";
import { faq, menuToggle, searchDialog, shortcuts, steps, themeToggle } from "./templates.js";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const frame = () => new Promise((r) => requestAnimationFrame(r));
const mount = async (t: unknown) => {
  const host = await fixture<HTMLDivElement>(html`<div></div>`);
  render(t, host);
  return host;
};

describe("site-kit theme", () => {
  const key = "site-kit-test-theme";
  afterEach(() => {
    localStorage.removeItem(key);
    delete document.documentElement.dataset.theme;
  });

  it("applies the stored theme from the boot script", () => {
    localStorage.setItem(key, "dark");
    new Function(themeBootScript(key))();
    expect(document.documentElement.dataset.theme).to.equal("dark");
    expect(document.documentElement.classList.contains("js")).to.be.true;
  });

  it("toggles, stores the choice and keeps every toggle in sync", async () => {
    const icons = { light: html`<svg></svg>`, dark: html`<svg></svg>` };
    const host = await mount(html`${themeToggle(icons)}${themeToggle(icons)}`);
    document.documentElement.dataset.theme = "light";
    initThemeToggle({ key });
    const [a, b] = host.querySelectorAll("button");
    expect(a!.getAttribute("aria-pressed")).to.equal("false");
    a!.click();
    expect(document.documentElement.dataset.theme).to.equal("dark");
    expect(localStorage.getItem(key)).to.equal("dark");
    expect(b!.getAttribute("aria-pressed")).to.equal("true");
    expect(b!.getAttribute("aria-label")).to.equal("Switch to light theme");
  });
});

describe("site-kit menu", () => {
  it("opens and closes the panel, returning focus on Escape", async () => {
    const host = await mount(html`${menuToggle()}<div id="mobile-menu" hidden><a href="#a">A</a></div>`);
    initMenu();
    const toggle = host.querySelector("button")!;
    const panel = host.querySelector<HTMLElement>("#mobile-menu")!;
    toggle.click();
    await frame();
    expect(toggle.getAttribute("aria-expanded")).to.equal("true");
    expect(panel.hidden).to.be.false;
    expect(panel.classList.contains("open")).to.be.true;
    panel.querySelector("a")!.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(toggle.getAttribute("aria-expanded")).to.equal("false");
    expect(document.activeElement).to.equal(toggle);
    await wait(550);
    expect(panel.hidden).to.be.true;
    document.documentElement.classList.remove("menu-open");
  });
});

describe("site-kit search", () => {
  const index: SearchIndex = {
    search: async (q: string) => ({
      results: q === "none" ? [] : [{ data: async () => ({ url: "/components/diff/", excerpt: "line <mark>diff</mark>", meta: { title: "Diff <b>" } }) }],
    }),
  };

  it("opens on Ctrl+K and lists results, escaping titles", async () => {
    const host = await mount(searchDialog());
    initSearch({ load: async () => index, delay: 0, emptyHint: "Try <code>table</code>." });
    const dialog = host.querySelector("dialog")!;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    expect(dialog.open).to.be.true;
    const input = dialog.querySelector("input")!;
    input.value = "diff";
    input.dispatchEvent(new Event("input"));
    await wait(20);
    const link = dialog.querySelector(".search-results a")!;
    expect(link.getAttribute("href")).to.equal("/components/diff/");
    expect(link.querySelector("b")!.textContent).to.equal("Diff <b>");
    expect(link.querySelector("mark")!.textContent).to.equal("diff");
    input.value = "none";
    input.dispatchEvent(new Event("input"));
    await wait(20);
    expect(dialog.querySelector(".search-empty")!.innerHTML).to.contain("<code>table</code>");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", cancelable: true }));
    expect(dialog.open, "Escape closes even with text in the field").to.be.false;
  });

  it("says when the index can't load", async () => {
    const host = await mount(searchDialog());
    initSearch({ load: () => Promise.reject(new Error("offline")), delay: 0 });
    const input = host.querySelector("input")!;
    input.value = "x";
    input.dispatchEvent(new Event("input"));
    await wait(20);
    expect(host.querySelector(".search-empty")!.textContent).to.contain("unavailable");
  });
});

describe("site-kit templates", () => {
  it("are accessible", async () => {
    const host = await mount(html`
      ${faq([{ question: "Is it free?", answer: "Yes, MIT." }, { question: "SSR?", answer: "Yes." }], { exclusive: "faq" })}
      ${steps([{ title: "Install", body: "npm install" }, { title: "Run" }], { label: "Getting started" })}
      ${shortcuts([{ action: "Search", keys: [["Ctrl", "K"], ["/"]] }])}`);
    await expect(host).to.be.accessible();
    const details = host.querySelectorAll("details");
    details[0]!.open = true;
    details[1]!.open = true;
    await wait(0);
    expect(details[0]!.open, "name makes them exclusive").to.be.false;
  });
});
