import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as M from "./model.js";

const clean = (html: string): string => M.docToHtml(M.htmlToDoc(html));

describe("sanitizer (htmlToDoc → docToHtml)", () => {
  it("keeps the schema as it is", () => {
    const html =
      '<h2>Title</h2><h3>Sub</h3><p>a <strong>b</strong> <em>c</em> <u>d</u> <s>e</s> <code>f</code> <a href="https://x.test/">g</a><br>h</p>' +
      "<blockquote><p>q1</p><p>q2</p></blockquote><pre>line 1\n  line 2</pre><ul><li>one<ul><li>nested</li></ul></li><li>two</li></ul><ol><li>first</li></ol>";
    assert.equal(clean(html), html);
  });

  it("drops scripts, styles and other active content with their contents", () => {
    assert.equal(clean("<p>a<script>alert(1)</script>b</p><style>p{}</style><iframe src=x></iframe>"), "<p>ab</p>");
    assert.equal(clean('<p>x<img src=x onerror="alert(1)">y</p><svg><script>alert(1)</script></svg>'), "<p>xy</p>");
    assert.equal(clean("<template><p>t</p></template><noscript>n</noscript><p>ok</p>"), "<p>ok</p>");
  });

  it("strips event handlers, style, class and id attributes", () => {
    assert.equal(clean('<p onclick="alert(1)" style="color:red" class="c" id="i">t</p>'), "<p>t</p>");
    assert.equal(clean('<strong onmouseover="x()">b</strong>'), "<p><strong>b</strong></p>");
    assert.equal(clean('<a href="https://ok.test" onclick="x()" target="_blank" style="x">l</a>'), '<p><a href="https://ok.test">l</a></p>');
  });

  it("removes javascript: and other unsafe link targets but keeps the text", () => {
    assert.equal(clean('<a href="javascript:alert(1)">x</a>'), "<p>x</p>");
    assert.equal(clean('<a href=" JaVaScRiPt:alert(1)">x</a>'), "<p>x</p>");
    assert.equal(clean('<a href="java&#x09;script:alert(1)">x</a>'), "<p>x</p>");
    assert.equal(clean('<a href="jav&#10;ascript:alert(1)">x</a>'), "<p>x</p>");
    assert.equal(clean('<a href="data:text/html,<script>alert(1)</script>">x</a>'), "<p>x</p>");
    assert.equal(clean('<a href="vbscript:x">x</a>'), "<p>x</p>");
    assert.equal(clean('<a href="mailto:a@b.test">m</a>'), '<p><a href="mailto:a@b.test">m</a></p>');
    assert.equal(clean('<a href="/docs?a=1&amp;b=2#x">r</a>'), '<p><a href="/docs?a=1&amp;b=2#x">r</a></p>');
    assert.equal(clean('<a href="http://x.test">h</a>'), '<p><a href="http://x.test">h</a></p>');
  });

  it("safeHref allows http(s), mailto and relative URLs only", () => {
    for (const ok of ["https://a.test", "http://a.test", "mailto:x@y.test", "/a", "./a", "../a", "#top", "?q=1", "page.html", "//cdn.test/x"]) {
      assert.ok(M.safeHref(ok), ok);
    }
    for (const bad of ["javascript:alert(1)", "JAVASCRIPT:x", "\u0000javascript:x", "java\nscript:x", "data:text/html,x", "file:///etc/passwd", "vbscript:x", "blob:x", "", "   "]) {
      assert.equal(M.safeHref(bad), null, JSON.stringify(bad));
    }
  });

  it("unwraps unknown inline tags and maps aliases (b, i, strike, del, h1, h4)", () => {
    assert.equal(clean("<p><span>a</span><font color=red>b</font><mark>c</mark><x-custom>d</x-custom></p>"), "<p>abcd</p>");
    assert.equal(clean("<p><b>b</b><i>i</i><strike>s</strike><del>d</del><ins>u</ins><kbd>k</kbd></p>"), "<p><strong>b</strong><em>i</em><s>sd</s><u>u</u><code>k</code></p>");
    assert.equal(clean("<h1>a</h1><h4>b</h4><h6>c</h6>"), "<h2>a</h2><h3>b</h3><h3>c</h3>");
  });

  it("turns block containers into paragraphs and wraps loose text", () => {
    assert.equal(clean("loose <b>text</b>"), "<p>loose <strong>text</strong></p>");
    assert.equal(clean("<div>one</div><div>two</div><section><article>three</article></section>"), "<p>one</p><p>two</p><p>three</p>");
    assert.equal(clean("<table><tr><td>a</td><td>b</td></tr></table>"), "<p>a</p><p>b</p>");
  });

  it("reads bold/italic/underline from inline styles (pasted from Google Docs and Word)", () => {
    const docs =
      '<b style="font-weight:normal;" id="docs-internal-guid-1"><p><span style="font-weight:700">B</span><span style="font-style:italic">I</span><span style="text-decoration:underline">U</span><span style="text-decoration:line-through">S</span><span>plain</span></p></b>';
    assert.equal(clean(docs), "<p><strong>B</strong><em>I</em><u>U</u><s>S</s>plain</p>");
  });

  it("flattens nested lists and keeps list levels, including list-in-list markup", () => {
    const doc = M.htmlToDoc("<ul><li>a<ol><li>b<ul><li>c</li></ul></li></ol></li><li>d</li></ul>");
    assert.deepEqual(
      doc.map((b) => [b.type, b.list, b.indent, M.blockText(b)]),
      [
        ["li", "ul", 0, "a"],
        ["li", "ol", 1, "b"],
        ["li", "ul", 2, "c"],
        ["li", "ul", 0, "d"],
      ],
    );
    assert.equal(clean("<ul><li>a</li><ul><li>b</li></ul></ul>"), "<ul><li>a<ul><li>b</li></ul></li></ul>");
    assert.equal(clean("<li>stray</li>"), "<ul><li>stray</li></ul>");
  });

  it("joins block content inside an item with line breaks", () => {
    assert.equal(clean("<ul><li><p>a</p><p>b</p></li></ul>"), "<ul><li>a<br>b</li></ul>");
  });

  it("collapses whitespace like HTML and keeps intentional spaces as no-break spaces", () => {
    assert.equal(clean("<p>  a \n  b  </p>\n\n<p>c</p>"), "<p>a b</p><p>c</p>");
    const doc: M.Doc = [{ type: "p", segs: [{ text: " a  b ", marks: [] }] }];
    assert.equal(M.docToHtml(doc), "<p>&nbsp;a &nbsp;b&nbsp;</p>");
    assert.equal(M.docToHtml(M.htmlToDoc(M.docToHtml(doc))), M.docToHtml(doc));
  });

  it("keeps code block text verbatim and drops marks inside it", () => {
    assert.equal(clean("<pre>\n  <b>x</b>  y\n</pre>"), "<pre>  x  y\n</pre>");
    assert.equal(clean("<pre><code>let a = 1;</code></pre>"), "<pre>let a = 1;</pre>");
  });

  it("decodes entities and escapes text on output", () => {
    assert.equal(clean("<p>&lt;b&gt; &amp; &#x41;&#66; &copy; &unknown;</p>"), "<p>&lt;b&gt; &amp; AB © &amp;unknown;</p>");
  });

  it("survives malformed markup", () => {
    assert.equal(clean("<p>a<b>b<i>c</p><p>d"), "<p>a<strong>b<em>c</em></strong></p><p>d</p>");
    assert.equal(clean("<p>a < b</p>"), "<p>a &lt; b</p>");
    assert.equal(clean("<!-- c --><p>x</p><!doctype html><?php ?>"), "<p>x</p>");
  });

  it("an empty document is the empty string", () => {
    assert.equal(clean(""), "");
    assert.equal(clean("<p></p>"), "");
    assert.equal(clean("<p><br></p>"), "");
    assert.equal(clean("<script>x</script>"), "");
  });

  it("drops a trailing placeholder <br> but keeps a real line break", () => {
    assert.equal(clean("<p>a<br></p>"), "<p>a</p>");
    assert.equal(clean("<p>a<br><br></p>"), "<p>a<br></p>");
  });
});

describe("text and Markdown", () => {
  const doc = M.htmlToDoc(
    '<h2>T</h2><p>a <strong>b</strong> <em>c</em> <s>d</s> <code>e</code> <a href="https://x.test">f</a></p><ul><li>one<ul><li>two</li></ul></li></ul><ol><li>x</li><li>y</li></ol><blockquote><p>q</p></blockquote><pre>code</pre>',
  );

  it("getText separates blocks with newlines", () => {
    assert.equal(M.docToText(doc), "T\na b c d e f\none\ntwo\nx\ny\nq\ncode");
  });

  it("writes CommonMark", () => {
    assert.equal(M.docToMarkdown(doc), "## T\n\na **b** *c* ~~d~~ `e` [f](https://x.test)\n\n- one\n   - two\n1. x\n2. y\n\n> q\n\n```\ncode\n```");
  });

  it("escapes Markdown syntax in text", () => {
    assert.equal(M.docToMarkdown(M.htmlToDoc("<p># not a heading *x*</p>")), "\\# not a heading \\*x\\*");
  });
});

describe("editing operations", () => {
  const p = (text: string): M.Block => ({ type: "p", segs: [{ text, marks: [] }] });

  it("setMark toggles a mark on a range and merges segments", () => {
    const doc: M.Doc = [p("hello world")];
    M.setMark(doc, { b: 0, o: 0 }, { b: 0, o: 5 }, "strong", true);
    assert.equal(M.docToHtml(doc), "<p><strong>hello</strong> world</p>");
    assert.deepEqual([...M.marksIn(doc, { b: 0, o: 1 }, { b: 0, o: 4 })], ["strong"]);
    assert.equal(M.marksIn(doc, { b: 0, o: 3 }, { b: 0, o: 8 }).size, 0);
    M.setMark(doc, { b: 0, o: 2 }, { b: 0, o: 3 }, "strong", false);
    assert.equal(M.docToHtml(doc), "<p><strong>he</strong>l<strong>lo</strong> world</p>");
  });

  it("deleteRange joins blocks across the range", () => {
    const doc: M.Doc = [p("abc"), p("def"), p("ghi")];
    const pos = M.deleteRange(doc, { b: 0, o: 1 }, { b: 2, o: 2 });
    assert.deepEqual(pos, { b: 0, o: 1 });
    assert.equal(M.docToHtml(doc), "<p>ai</p>");
  });

  it("splitBlock and joinBackward are inverses", () => {
    const doc: M.Doc = [{ type: "h2", segs: [{ text: "Title", marks: [] }] }];
    M.splitBlock(doc, { b: 0, o: 5 });
    assert.equal(M.docToHtml(doc), "<h2>Title</h2><p></p>");
    M.joinBackward(doc, 1);
    assert.equal(M.docToHtml(doc), "<h2>Title</h2>");
  });

  it("setBlockType merges into a code block and splits it back into lines", () => {
    const doc: M.Doc = [p("a"), p("b")];
    M.setBlockType(doc, 0, 1, "pre");
    assert.equal(M.docToHtml(doc), "<pre>a\nb</pre>");
    M.setBlockType(doc, 0, 0, "p");
    assert.equal(M.docToHtml(doc), "<p>a</p><p>b</p>");
  });

  it("indentItems nests list items no deeper than one level below the previous item", () => {
    const doc = M.htmlToDoc("<ul><li>a</li><li>b</li><li>c</li></ul>");
    assert.equal(M.indentItems(doc, 0, 0, 1), false);
    M.indentItems(doc, 1, 2, 1);
    assert.equal(M.docToHtml(doc), "<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>");
    M.indentItems(doc, 2, 2, 1);
    assert.equal(M.docToHtml(doc), "<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li></ul>");
    M.indentItems(doc, 0, 0, -1);
    assert.equal(M.docToHtml(doc), "<p>a</p><ul><li>b<ul><li>c</li></ul></li></ul>");
  });

  it("linkAt finds the whole link around a caret", () => {
    const doc = M.htmlToDoc('<p>go <a href="/x">to <b>the</b> page</a> now</p>');
    assert.deepEqual(M.linkAt(doc, { b: 0, o: 6 }, { b: 0, o: 6 }), { from: { b: 0, o: 3 }, to: { b: 0, o: 14 }, href: "/x" });
    assert.equal(M.linkAt(doc, { b: 0, o: 1 }, { b: 0, o: 1 }), null);
  });
});
