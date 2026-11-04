import { registerTranslation } from "@lit-material/core/localize.js";
import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./rich-text-editor.js";
import type { LitMaterialRichTextEditor } from "./rich-text-editor.js";

const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => setTimeout(r)));

async function editor(value = "", extra = ""): Promise<LitMaterialRichTextEditor> {
  const el = await fixture<LitMaterialRichTextEditor>(html`<lit-material-rich-text-editor label="Notes" .value=${value} placeholder=${extra}></lit-material-rich-text-editor>`);
  await el.updateComplete;
  return el;
}

const contentOf = (el: LitMaterialRichTextEditor): HTMLElement => el.shadowRoot!.querySelector<HTMLElement>(".content")!;
const tool = (el: LitMaterialRichTextEditor, command: string): HTMLButtonElement => el.shadowRoot!.querySelector<HTMLButtonElement>(`button[data-command="${command}"]`)!;

function textNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) out.push(walker.currentNode as Text);
  return out;
}

/** Focuses the editor and selects `text` (the n-th occurrence's characters), or puts the caret after it. */
async function select(el: LitMaterialRichTextEditor, text: string, mode: "select" | "after" | "before" = "select"): Promise<void> {
  const content = contentOf(el);
  content.focus();
  for (const node of textNodes(content)) {
    const at = node.data.indexOf(text);
    if (at === -1) continue;
    const sel = document.getSelection()!;
    if (mode === "select") sel.setBaseAndExtent(node, at, node, at + text.length);
    else if (mode === "after") sel.setBaseAndExtent(node, at + text.length, node, at + text.length);
    else sel.setBaseAndExtent(node, at, node, at);
    await frame();
    return;
  }
  throw new Error(`text not found: ${text}`);
}

async function caretAtEnd(el: LitMaterialRichTextEditor): Promise<void> {
  const content = contentOf(el);
  content.focus();
  const nodes = textNodes(content);
  const last = nodes[nodes.length - 1];
  if (last) document.getSelection()!.setBaseAndExtent(last, last.data.length, last, last.data.length);
  else document.getSelection()!.setBaseAndExtent(content.firstElementChild!, 0, content.firstElementChild!, 0);
  await frame();
}

function paste(el: LitMaterialRichTextEditor, data: Record<string, string>): void {
  const transfer = new DataTransfer();
  for (const [type, value] of Object.entries(data)) transfer.setData(type, value);
  const event = new ClipboardEvent("paste", { clipboardData: transfer, bubbles: true, cancelable: true, composed: true });
  // Firefox's constructor ignores `clipboardData` (a real paste carries the browser's own).
  if (event.clipboardData !== transfer) Object.defineProperty(event, "clipboardData", { value: transfer });
  contentOf(el).dispatchEvent(event);
}

describe("lit-material-rich-text-editor", () => {
  describe("rendering and value", () => {
    it("renders the value, normalized, in a labelled multi-line textbox", async () => {
      const el = await editor("<b>Hello</b> <i>world</i>");
      const content = contentOf(el);
      expect(el.value).to.equal("<p><strong>Hello</strong> <em>world</em></p>");
      expect(content.getAttribute("role")).to.equal("textbox");
      expect(content.getAttribute("aria-multiline")).to.equal("true");
      expect(content.getAttribute("contenteditable")).to.equal("true");
      const label = el.shadowRoot!.getElementById(content.getAttribute("aria-labelledby")!)!;
      expect(label.textContent).to.equal("Notes");
      expect(content.querySelector("strong")!.textContent).to.equal("Hello");
      await expect(el).shadowDom.to.be.accessible();
    });

    it("sanitizes a value set later and resets the history", async () => {
      const el = await editor("<p>a</p>");
      el.value = '<p onclick="x()">safe<script>alert(1)</script><img src=x onerror=alert(1)></p><a href="javascript:alert(1)">link</a>';
      await el.updateComplete;
      expect(el.value).to.equal("<p>safe</p><p>link</p>");
      expect(contentOf(el).querySelector("script, img, [onclick], a")).to.equal(null);
      expect(el.canUndo).to.be.false;
    });

    it("exposes getText() and getMarkdown()", async () => {
      const el = await editor("<h2>Title</h2><p>Some <strong>bold</strong> text</p><ul><li>one</li></ul>");
      expect(el.getText()).to.equal("Title\nSome bold text\none");
      expect(el.getMarkdown()).to.equal("## Title\n\nSome **bold** text\n\n- one");
    });

    it("shows a placeholder while empty", async () => {
      const el = await editor("", "Write something");
      expect(contentOf(el).classList.contains("empty")).to.be.true;
      expect(contentOf(el).getAttribute("aria-placeholder")).to.equal("Write something");
    });
  });

  describe("inline formatting", () => {
    it("toggles bold on a selection from the toolbar and reflects it in aria-pressed", async () => {
      const el = await editor("<p>hello world</p>");
      await select(el, "hello");
      tool(el, "bold").click();
      await el.updateComplete;
      expect(el.value).to.equal("<p><strong>hello</strong> world</p>");
      expect(tool(el, "bold").getAttribute("aria-pressed")).to.equal("true");
      tool(el, "bold").click();
      await el.updateComplete;
      expect(el.value).to.equal("<p>hello world</p>");
      expect(tool(el, "bold").getAttribute("aria-pressed")).to.equal("false");
    });

    it("applies bold to the whole selection when only part of it is bold", async () => {
      const el = await editor("<p><strong>he</strong>llo</p>");
      await select(el, "llo", "after");
      const content = contentOf(el);
      const [first, second] = textNodes(content);
      document.getSelection()!.setBaseAndExtent(first!, 0, second!, 3);
      await frame();
      expect(tool(el, "bold").getAttribute("aria-pressed")).to.equal("false");
      tool(el, "bold").click();
      expect(el.value).to.equal("<p><strong>hello</strong></p>");
    });

    it("updates aria-pressed as the caret moves", async () => {
      const el = await editor("<p>plain <em>slanted</em></p>");
      await select(el, "slan", "after");
      await el.updateComplete;
      expect(tool(el, "italic").getAttribute("aria-pressed")).to.equal("true");
      await select(el, "pla", "after");
      await el.updateComplete;
      expect(tool(el, "italic").getAttribute("aria-pressed")).to.equal("false");
    });

    it("Ctrl+B / Ctrl+I / Ctrl+U / Ctrl+E / Ctrl+Shift+X toggle marks", async () => {
      const el = await editor("<p>abc</p>");
      await select(el, "abc");
      await sendKeys({ press: "Control+b" });
      await sendKeys({ press: "Control+i" });
      await sendKeys({ press: "Control+u" });
      await sendKeys({ press: "Control+Shift+x" });
      await sendKeys({ press: "Control+e" });
      expect(el.value).to.equal("<p><strong><em><u><s><code>abc</code></s></u></em></strong></p>");
      await sendKeys({ press: "Control+b" });
      expect(el.value).to.equal("<p><em><u><s><code>abc</code></s></u></em></p>");
    });

    it("with a collapsed caret, the toggled mark applies to the next typed text", async () => {
      const el = await editor("<p>ab</p>");
      await select(el, "ab", "after");
      await sendKeys({ press: "Control+b" });
      await el.updateComplete;
      expect(tool(el, "bold").getAttribute("aria-pressed")).to.equal("true");
      await sendKeys({ type: "cd" });
      expect(el.value).to.equal("<p>ab<strong>cd</strong></p>");
    });

    it("announces formatting changes made with shortcuts", async () => {
      const el = await editor("<p>abc</p>");
      await select(el, "abc");
      await sendKeys({ press: "Control+b" });
      await el.updateComplete;
      const status = el.shadowRoot!.querySelector('[role="status"]')!;
      expect(status.textContent!.trim()).to.equal("Bold on");
    });

    it("clears inline formatting and links", async () => {
      const el = await editor('<p><strong>a</strong><a href="/x"><em>b</em></a>c</p>');
      await select(el, "c", "after");
      const nodes = textNodes(contentOf(el));
      document.getSelection()!.setBaseAndExtent(nodes[0]!, 0, nodes[2]!, 1);
      await frame();
      tool(el, "clearFormatting").click();
      expect(el.value).to.equal("<p>abc</p>");
    });
  });

  describe("blocks", () => {
    it("Enter splits a paragraph; a heading continues as a paragraph", async () => {
      const el = await editor("<h2>Title</h2>");
      await select(el, "Title", "after");
      await sendKeys({ press: "Enter" });
      await sendKeys({ type: "body" });
      expect(el.value).to.equal("<h2>Title</h2><p>body</p>");
      await select(el, "bo", "after");
      await sendKeys({ press: "Enter" });
      expect(el.value).to.equal("<h2>Title</h2><p>bo</p><p>dy</p>");
    });

    it("sets headings from the text style select (and its value follows the caret)", async () => {
      const el = await editor("<p>one</p><p>two</p>");
      await select(el, "two", "after");
      const selectEl = el.shadowRoot!.querySelector<HTMLSelectElement>(".block-select")!;
      selectEl.value = "h2";
      selectEl.dispatchEvent(new Event("change"));
      expect(el.value).to.equal("<p>one</p><h2>two</h2>");
      await select(el, "tw", "after");
      await el.updateComplete;
      expect(selectEl.value).to.equal("h2");
      await select(el, "on", "after");
      await el.updateComplete;
      expect(selectEl.value).to.equal("p");
      await select(el, "two", "after");
      await sendKeys({ press: "Control+Alt+3" });
      expect(el.value).to.equal("<p>one</p><h3>two</h3>");
    });

    it("toggles bulleted and numbered lists across paragraphs", async () => {
      const el = await editor("<p>a</p><p>b</p>");
      await select(el, "a", "before");
      const [a, b] = textNodes(contentOf(el));
      document.getSelection()!.setBaseAndExtent(a!, 0, b!, 1);
      await frame();
      tool(el, "bulletList").click();
      expect(el.value).to.equal("<ul><li>a</li><li>b</li></ul>");
      await el.updateComplete;
      expect(tool(el, "bulletList").getAttribute("aria-pressed")).to.equal("true");
      tool(el, "numberedList").click();
      expect(el.value).to.equal("<ol><li>a</li><li>b</li></ol>");
      tool(el, "numberedList").click();
      expect(el.value).to.equal("<p>a</p><p>b</p>");
    });

    it("Shift+Enter inserts a line break inside the block", async () => {
      const el = await editor("<p>ab</p>");
      await select(el, "a", "after");
      await sendKeys({ press: "Shift+Enter" });
      expect(el.value).to.equal("<p>a<br>b</p>");
      await sendKeys({ type: "x" });
      expect(el.value).to.equal("<p>a<br>xb</p>");
    });

    it("normalizes markup the browser inserts natively back into the schema", async () => {
      const el = await editor("<p>ab</p>");
      await select(el, "a", "after");
      // What a browser extension or a native command might leave behind:
      const span = document.createElement("span");
      span.setAttribute("style", "font-weight: 700");
      span.setAttribute("onclick", "alert(1)");
      span.textContent = "X";
      const text = textNodes(contentOf(el))[0]!;
      text.after(span);
      contentOf(el).dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
      expect(el.value).to.equal("<p>ab<strong>X</strong></p>");
      expect(contentOf(el).querySelector("span")).to.equal(null);
    });

    it("Tab and Shift+Tab indent and outdent list items", async () => {
      const el = await editor("<ul><li>one</li><li>two</li></ul>");
      await select(el, "two", "after");
      await sendKeys({ press: "Tab" });
      expect(el.value).to.equal("<ul><li>one<ul><li>two</li></ul></li></ul>");
      const status = el.shadowRoot!.querySelector('[role="status"]')!;
      await el.updateComplete;
      expect(status.textContent!.trim()).to.equal("List level 2");
      await sendKeys({ press: "Shift+Tab" });
      expect(el.value).to.equal("<ul><li>one</li><li>two</li></ul>");
      await sendKeys({ press: "Shift+Tab" });
      expect(el.value).to.equal("<ul><li>one</li></ul><p>two</p>");
    });

    it("Tab outside a list moves focus as usual; Escape then Tab leaves a list", async () => {
      const el = await editor("<ul><li>one</li></ul>");
      const after = document.createElement("button");
      after.textContent = "after";
      el.after(after);
      // What the content saw (and whether it canceled it), to tell a missed Escape from focus that didn't move.
      const seen: string[] = [];
      el.shadowRoot!.addEventListener("keydown", (e) => seen.push(`${(e as KeyboardEvent).key}${e.defaultPrevented ? " (canceled)" : ""}`));
      await select(el, "one", "after");
      await sendKeys({ press: "Escape" });
      await sendKeys({ press: "Tab" });
      expect(el.value).to.equal("<ul><li>one</li></ul>");
      expect(document.activeElement, `focus after Escape, Tab; keys seen: ${seen.join(", ")}`).to.equal(after);
      after.remove();
      await new Promise((resolve) => setTimeout(resolve));
      expect(contentOf(el).getAttribute("contenteditable")).to.equal("true");
      expect(contentOf(el).hasAttribute("tabindex")).to.be.false;
    });

    it("Enter in an empty list item leaves the list; Backspace at an item's start lifts it", async () => {
      const el = await editor("<ul><li>one</li></ul>");
      await select(el, "one", "after");
      await sendKeys({ press: "Enter" });
      await sendKeys({ type: "two" });
      expect(el.value).to.equal("<ul><li>one</li><li>two</li></ul>");
      await sendKeys({ press: "Enter" });
      await sendKeys({ press: "Enter" });
      await sendKeys({ type: "after" });
      expect(el.value).to.equal("<ul><li>one</li><li>two</li></ul><p>after</p>");
      await select(el, "two", "before");
      await sendKeys({ press: "Backspace" });
      expect(el.value).to.equal("<ul><li>one</li></ul><p>two</p><p>after</p>");
      await sendKeys({ press: "Backspace" });
      expect(el.value).to.equal("<ul><li>onetwo</li></ul><p>after</p>");
    });

    it("quote and code block toggle; Enter inside code adds a line, twice leaves it", async () => {
      const el = await editor("<p>q</p>");
      await select(el, "q", "after");
      tool(el, "quote").click();
      expect(el.value).to.equal("<blockquote><p>q</p></blockquote>");
      await el.updateComplete;
      expect(tool(el, "quote").getAttribute("aria-pressed")).to.equal("true");
      tool(el, "quote").click();
      expect(el.value).to.equal("<p>q</p>");
      tool(el, "codeBlock").click();
      expect(el.value).to.equal("<pre>q</pre>");
      await select(el, "q", "after");
      await sendKeys({ press: "Enter" });
      await sendKeys({ type: "r" });
      expect(el.value).to.equal("<pre>q\nr</pre>");
      await sendKeys({ press: "Enter" });
      await sendKeys({ press: "Enter" });
      await sendKeys({ type: "out" });
      expect(el.value).to.equal("<pre>q\nr</pre><p>out</p>");
    });

    it("Markdown-style shortcuts at the start of a paragraph", async () => {
      const el = await editor("");
      await caretAtEnd(el);
      await sendKeys({ type: "## Title" });
      expect(el.value).to.equal("<h2>Title</h2>");
      await sendKeys({ press: "Enter" });
      await sendKeys({ type: "- item" });
      expect(el.value).to.equal("<h2>Title</h2><ul><li>item</li></ul>");
      await sendKeys({ press: "Enter" });
      await sendKeys({ press: "Enter" });
      await sendKeys({ type: "1. first" });
      expect(el.value).to.equal("<h2>Title</h2><ul><li>item</li></ul><ol><li>first</li></ol>");
      await sendKeys({ press: "Enter" });
      await sendKeys({ press: "Enter" });
      await sendKeys({ type: "> quoted" });
      expect(el.value).to.equal("<h2>Title</h2><ul><li>item</li></ul><ol><li>first</li></ol><blockquote><p>quoted</p></blockquote>");
    });

    it("Backspace across a selection spanning blocks joins them", async () => {
      const el = await editor("<h2>abc</h2><p>def</p>");
      await select(el, "abc", "before");
      const [a, d] = textNodes(contentOf(el));
      document.getSelection()!.setBaseAndExtent(a!, 1, d!, 2);
      await frame();
      await sendKeys({ press: "Backspace" });
      expect(el.value).to.equal("<h2>af</h2>");
    });
  });

  describe("links", () => {
    it("Ctrl+K opens the link panel; an unsafe scheme is refused, a bare domain becomes https", async () => {
      const el = await editor("<p>go here</p>");
      await select(el, "here");
      await sendKeys({ press: "Control+k" });
      await el.updateComplete;
      const panel = el.shadowRoot!.querySelector('[role="dialog"]')!;
      expect(panel).to.exist;
      expect(tool(el, "link").getAttribute("aria-expanded")).to.equal("true");
      const input = panel.querySelector("input")!;
      expect(el.shadowRoot!.activeElement).to.equal(input);
      await sendKeys({ type: "javascript:alert(1)" });
      await sendKeys({ press: "Enter" });
      await el.updateComplete;
      expect(el.value).to.equal("<p>go here</p>");
      expect(panel.querySelector(".link-error")!.textContent).to.contain("http");
      expect(input.getAttribute("aria-invalid")).to.equal("true");
      input.select();
      await sendKeys({ type: "example.com" });
      await sendKeys({ press: "Enter" });
      await el.updateComplete;
      expect(el.value).to.equal('<p>go <a href="https://example.com">here</a></p>');
      expect(el.shadowRoot!.querySelector('[role="dialog"]')).to.equal(null);
      expect(el.shadowRoot!.activeElement).to.equal(contentOf(el));
    });

    it("edits and removes an existing link from a caret inside it", async () => {
      const el = await editor('<p>a <a href="https://old.test">link</a> b</p>');
      await select(el, "li", "after");
      tool(el, "link").click();
      await el.updateComplete;
      const input = el.shadowRoot!.querySelector<HTMLInputElement>(".link-input")!;
      expect(input.value).to.equal("https://old.test");
      const remove = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".link-panel button")].find((b) => b.textContent!.includes("Remove"))!;
      remove.click();
      await el.updateComplete;
      expect(el.value).to.equal("<p>a link b</p>");
    });

    it("Escape closes the panel without changes", async () => {
      const el = await editor("<p>text</p>");
      await select(el, "text");
      await sendKeys({ press: "Control+k" });
      await el.updateComplete;
      await sendKeys({ type: "https://x.test" });
      await sendKeys({ press: "Escape" });
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('[role="dialog"]')).to.equal(null);
      expect(el.value).to.equal("<p>text</p>");
    });

    it("command('link', url) validates the scheme", async () => {
      const el = await editor("<p>text</p>");
      await select(el, "text");
      expect(el.command("link", "javascript:alert(1)")).to.be.false;
      expect(el.command("link", "data:text/html,x")).to.be.false;
      expect(el.command("link", "mailto:a@b.test")).to.be.true;
      expect(el.value).to.equal('<p><a href="mailto:a@b.test">text</a></p>');
      expect(el.command("unlink")).to.be.true;
      expect(el.value).to.equal("<p>text</p>");
    });
  });

  describe("paste", () => {
    it("sanitizes pasted HTML to the schema", async () => {
      const el = await editor("<p>ab</p>");
      await select(el, "a", "after");
      paste(el, {
        "text/html": '<meta charset="utf-8"><span style="font-weight:700" onclick="x()">X</span><script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">Y</a>',
        "text/plain": "XY",
      });
      expect(el.value).to.equal("<p>a<strong>X</strong>Yb</p>");
      expect(contentOf(el).querySelector("script, img, span, [onclick], [style]")).to.equal(null);
    });

    it("pastes several blocks, splitting the current one", async () => {
      const el = await editor("<p>start end</p>");
      await select(el, "start ", "after");
      paste(el, { "text/html": "<h1>Head</h1><ul><li>one</li><li>two</li></ul>", "text/plain": "" });
      expect(el.value).to.equal("<p>start Head</p><ul><li>one</li><li>twoend</li></ul>");
    });

    it("pastes plain text as paragraphs, or as text inside a code block", async () => {
      const el = await editor("<p></p>");
      await caretAtEnd(el);
      paste(el, { "text/plain": "line 1\nline 2" });
      expect(el.value).to.equal("<p>line 1</p><p>line 2</p>");
      el.value = "<pre>x</pre>";
      await el.updateComplete;
      await select(el, "x", "after");
      paste(el, { "text/plain": "<b>y</b>\nz" });
      expect(el.value).to.equal("<pre>x&lt;b&gt;y&lt;/b&gt;\nz</pre>");
    });

    it("an undo after paste restores the content", async () => {
      const el = await editor("<p>a</p>");
      await select(el, "a", "after");
      paste(el, { "text/plain": "b" });
      expect(el.value).to.equal("<p>ab</p>");
      await sendKeys({ press: "Control+z" });
      expect(el.value).to.equal("<p>a</p>");
    });
  });

  describe("undo and redo", () => {
    it("undoes and redoes commands with Ctrl+Z and Ctrl+Shift+Z / Ctrl+Y", async () => {
      const el = await editor("<p>abc</p>");
      await select(el, "abc");
      await sendKeys({ press: "Control+b" });
      expect(el.value).to.equal("<p><strong>abc</strong></p>");
      expect(tool(el, "undo").hasAttribute("aria-disabled")).to.be.false;
      await sendKeys({ press: "Control+z" });
      expect(el.value).to.equal("<p>abc</p>");
      await sendKeys({ press: "Control+Shift+z" });
      expect(el.value).to.equal("<p><strong>abc</strong></p>");
      await sendKeys({ press: "Control+z" });
      await sendKeys({ press: "Control+y" });
      expect(el.value).to.equal("<p><strong>abc</strong></p>");
    });

    it("a burst of typing is one undo step; the toolbar buttons work too", async () => {
      const el = await editor("<p>a</p>");
      await select(el, "a", "after");
      await sendKeys({ type: "bcd" });
      expect(el.value).to.equal("<p>abcd</p>");
      tool(el, "undo").click();
      expect(el.value).to.equal("<p>a</p>");
      expect(el.canRedo).to.be.true;
      tool(el, "redo").click();
      expect(el.value).to.equal("<p>abcd</p>");
    });

    it("undo restores the selection", async () => {
      const el = await editor("<p>one two</p>");
      await select(el, "two");
      await sendKeys({ press: "Control+i" });
      await sendKeys({ press: "Control+z" });
      await sendKeys({ type: "2" });
      expect(el.value).to.equal("<p>one 2</p>");
    });
  });

  describe("events and forms", () => {
    it("fires input on each change and change when focus leaves", async () => {
      const el = await editor("<p>a</p>");
      let inputs = 0;
      el.addEventListener("input", () => inputs++);
      await select(el, "a", "after");
      await sendKeys({ type: "bc" });
      expect(inputs).to.equal(2);
      setTimeout(() => contentOf(el).blur());
      await oneEvent(el, "change");
      expect(el.value).to.equal("<p>abc</p>");
    });

    it("submits its HTML value with the form, validates required and resets", async () => {
      const form = await fixture<HTMLFormElement>(html`<form><lit-material-rich-text-editor name="body" required value=${"<p>Hi <b>there</b></p>"}></lit-material-rich-text-editor></form>`);
      const el = form.querySelector("lit-material-rich-text-editor")!;
      await el.updateComplete;
      expect(new FormData(form).get("body")).to.equal("<p>Hi <strong>there</strong></p>");
      expect(el.checkValidity()).to.be.true;
      el.value = "";
      await el.updateComplete;
      expect(el.checkValidity()).to.be.false;
      expect(el.validity.valueMissing).to.be.true;
      expect(el.validationMessage).to.equal("Fill out this field");
      form.reset();
      await el.updateComplete;
      expect(el.value).to.equal("<p>Hi <strong>there</strong></p>");
    });

    it("is excluded from the form and not editable when disabled", async () => {
      const form = await fixture<HTMLFormElement>(html`<form><lit-material-rich-text-editor name="body" disabled value=${"<p>x</p>"}></lit-material-rich-text-editor></form>`);
      const el = form.querySelector("lit-material-rich-text-editor")!;
      await el.updateComplete;
      expect(new FormData(form).has("body")).to.be.false;
      expect(contentOf(el).getAttribute("contenteditable")).to.equal("false");
      expect(contentOf(el).getAttribute("aria-disabled")).to.equal("true");
      expect(tool(el, "bold").disabled).to.be.true;
      expect(el.command("bold")).to.be.false;
    });

    it("readonly content is focusable but not editable", async () => {
      const el = await fixture<LitMaterialRichTextEditor>(html`<lit-material-rich-text-editor readonly value=${"<p>x</p>"}></lit-material-rich-text-editor>`);
      await el.updateComplete;
      expect(contentOf(el).getAttribute("contenteditable")).to.equal("false");
      expect(contentOf(el).getAttribute("tabindex")).to.equal("0");
      expect(contentOf(el).getAttribute("aria-readonly")).to.equal("true");
    });

    it("counts characters and is invalid past maxlength", async () => {
      const el = await fixture<LitMaterialRichTextEditor>(html`<lit-material-rich-text-editor maxlength="3" value=${"<p>abcd</p>"}></lit-material-rich-text-editor>`);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector(".counter")!.textContent).to.equal("4 / 3");
      expect(el.validity.tooLong).to.be.true;
      expect(el.validationMessage).to.equal("Use no more than 3 characters");
    });
  });

  describe("toolbar keyboard", () => {
    const focused = (el: LitMaterialRichTextEditor): string | null => {
      const active = el.shadowRoot!.activeElement as HTMLElement | null;
      return active?.dataset.command ?? (active?.localName === "select" ? "select" : null);
    };

    it("is one tab stop with roving focus: arrows, Home, End", async () => {
      const el = await editor("<p>x</p>");
      const toolbar = el.shadowRoot!.querySelector('[role="toolbar"]')!;
      expect(toolbar.getAttribute("aria-label")).to.equal("Formatting");
      expect(toolbar.querySelectorAll('[tabindex="0"]').length).to.equal(1);
      el.shadowRoot!.querySelector<HTMLElement>(".block-select")!.focus();
      await sendKeys({ press: "ArrowRight" });
      expect(focused(el)).to.equal("bold");
      await sendKeys({ press: "ArrowRight" });
      expect(focused(el)).to.equal("italic");
      await el.updateComplete;
      expect(tool(el, "italic").tabIndex).to.equal(0);
      expect(tool(el, "bold").tabIndex).to.equal(-1);
      await sendKeys({ press: "End" });
      expect(focused(el)).to.equal("redo");
      await sendKeys({ press: "ArrowRight" });
      expect(focused(el)).to.equal("select");
      await sendKeys({ press: "ArrowLeft" });
      expect(focused(el)).to.equal("redo");
      await sendKeys({ press: "Home" });
      expect(focused(el)).to.equal("select");
    });

    it("flips arrow keys in RTL", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div dir="rtl"><lit-material-rich-text-editor value=${"<p>x</p>"}></lit-material-rich-text-editor></div>`);
      const el = wrapper.querySelector("lit-material-rich-text-editor")!;
      await el.updateComplete;
      tool(el, "bold").focus();
      await sendKeys({ press: "ArrowLeft" });
      expect(focused(el)).to.equal("italic");
      await sendKeys({ press: "ArrowRight" });
      expect(focused(el)).to.equal("bold");
    });

    it("toolbar commands from the keyboard apply to the last selection and keep focus on the toolbar", async () => {
      const el = await editor("<p>one two</p>");
      await select(el, "two");
      tool(el, "bold").focus();
      await sendKeys({ press: "Enter" });
      expect(el.value).to.equal("<p>one <strong>two</strong></p>");
      expect(focused(el)).to.equal("bold");
      expect(tool(el, "bold").getAttribute("aria-pressed")).to.equal("true");
    });
  });

  describe("i18n", () => {
    it("labels the toolbar and announcements in the element's language", async () => {
      registerTranslation({
        $code: "x-rt",
        "richText.bold": "Gras (t)",
        "richText.toolbar": "Mise en forme (t)",
        "richText.formatOn": "{format} activé (t)",
      });
      const el = await fixture<LitMaterialRichTextEditor>(html`<lit-material-rich-text-editor lang="x-rt" value=${"<p>abc</p>"}></lit-material-rich-text-editor>`);
      await el.updateComplete;
      expect(tool(el, "bold").getAttribute("aria-label")).to.equal("Gras (t)");
      expect(el.shadowRoot!.querySelector('[role="toolbar"]')!.getAttribute("aria-label")).to.equal("Mise en forme (t)");
      await select(el, "abc");
      await sendKeys({ press: "Control+b" });
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('[role="status"]')!.textContent!.trim()).to.equal("Gras (t) activé (t)");
    });
  });
});
