import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { transform } from "./transform.js";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");

/** Warnings each fixture must produce (substrings), so a fixture can't silently lose one. */
const EXPECTED_WARNINGS: Record<string, string[]> = {
  html: [
    'html/input.html:13: import "@material/web/ripple/ripple.js": <md-ripple> has no lit-material equivalent',
    "html/input.html:18: --md-outlined-text-field-container-shape: @material/web component tokens have no lit-material equivalent. lit-material-text-field has custom properties --lit-material-text-field-min-width",
    "html/input.html:27: <md-checkbox> touch-target:",
    "html/input.html:28: <md-switch> icons:",
    'html/input.html:30: <md-checkbox id="terms"> has a <label for>',
    "html/input.html:33: <md-ripple> has no lit-material equivalent",
    "html/input.html:42: <md-labs-thing> isn't an @material/web element the codemod knows",
    'html/input.html:44: "md-dialog" outside markup',
  ],
  lit: [
    'lit/input.ts:15: import { MdMenu } from "@material/web/menu/menu.js": lit-material\'s class is LitMaterialMenu from "@lit-material/menu"',
    "lit/input.ts:21: --md-list-container-color:",
    "lit/input.ts:37: <md-linear-progress> four-color:",
    "lit/input.ts:44: <md-icon>mail</md-icon> is a Material Symbols ligature",
    "lit/input.ts:55: <md-menu> positioning:",
    "lit/input.ts:57: <md-menu-item> keep-open:",
    "lit/input.ts:64: <md-slider> labeled:",
    "lit/input.ts:65: <md-fab> label is bound and extended is now always set",
    'lit/input.ts:72: "md-menu" outside markup',
  ],
  tsx: [
    'tsx/input.tsx:2: import "@material/web/chips/chip-set.js": <md-chip-set> has no lit-material equivalent',
    "tsx/input.tsx:14: <md-chip-set> has no lit-material equivalent",
    'tsx/input.tsx:26: slot="supporting-text" in <md-select-option>: lit-material-select-option has no supporting-text slot',
    "tsx/input.tsx:32: <md-elevated-button> trailing-icon:",
  ],
  css: [
    "css/input.css:2: --md-ref-typeface-brand: lit-material doesn't read --md-ref-* tokens",
    "css/input.css:4: 1 --md-sys-* token isn't read by any lit-material component (kept; it has no effect): --md-sys-color-surface-bright",
    "css/input.css:9: --md-filled-button-container-shape:",
    "css/input.css:14: --md-focus-ring-color: lit-material has no md-focus-ring element",
  ],
  angular: [
    "angular/input.component.html:7: md-switch's `selected` is lit-material-switch's `checked`",
    "angular/input.component.html:8: <md-icon>delete</md-icon> is a Material Symbols ligature",
  ],
};

describe("fixtures", () => {
  for (const dir of readdirSync(fixtures).sort()) {
    const files = readdirSync(join(fixtures, dir));
    const input = files.find((f) => f.startsWith("input"))!;
    const output = files.find((f) => f.startsWith("output"))!;
    const source = readFileSync(join(fixtures, dir, input), "utf8");
    const result = transform(source, `${dir}/${input}`);

    it(`${dir}: rewrites to ${dir}/${output}`, () => {
      assert.equal(result.code, readFileSync(join(fixtures, dir, output), "utf8"));
    });

    it(`${dir}: reports what needs a person`, () => {
      for (const expected of EXPECTED_WARNINGS[dir] ?? []) {
        assert.ok(
          result.warnings.some((w) => w.startsWith(expected)),
          `missing warning: ${expected}\n\ngot:\n${result.warnings.join("\n")}`,
        );
      }
    });

    it(`${dir}: is idempotent (a second run changes nothing)`, () => {
      const again = transform(result.code, `${dir}/${input}`);
      assert.equal(again.code, result.code);
      assert.deepEqual(again.changes, []);
    });
  }

  it("lists every change with file:line", () => {
    const source = readFileSync(join(fixtures, "lit", "input.ts"), "utf8");
    const { changes } = transform(source, "lit/input.ts");
    assert.ok(changes.length > 30);
    for (const c of changes) assert.match(c, /^lit\/input\.ts:\d+: /);
  });
});

describe("tags", () => {
  it("renames start and end tags and adds the variant", () => {
    const { code, packages } = transform('html`<md-outlined-button>Cancel</md-outlined-button>`;', "a.ts");
    assert.equal(code, 'html`<lit-material-button variant="outlined">Cancel</lit-material-button>`;');
    assert.deepEqual(packages, ["@lit-material/button"]);
  });

  it("maps every variant of the button families", () => {
    const cases: [string, string][] = [
      ["md-filled-button", '<lit-material-button variant="filled">'],
      ["md-text-button", '<lit-material-button variant="text">'],
      ["md-elevated-button", '<lit-material-button variant="elevated">'],
      ["md-filled-tonal-button", '<lit-material-button variant="tonal">'],
      ["md-icon-button", "<lit-material-icon-button>"],
      ["md-filled-icon-button", '<lit-material-icon-button variant="filled">'],
      ["md-filled-tonal-icon-button", '<lit-material-icon-button variant="tonal">'],
      ["md-outlined-icon-button", '<lit-material-icon-button variant="outlined">'],
      ["md-filled-text-field", '<lit-material-text-field variant="filled">'],
      ["md-filled-select", '<lit-material-select variant="filled">'],
      ["md-assist-chip", '<lit-material-chip variant="assist">'],
      ["md-suggestion-chip", '<lit-material-chip variant="suggestion">'],
      ["md-circular-progress", "<lit-material-circular-progress>"],
    ];
    for (const [md, expected] of cases) assert.ok(transform(`<${md}></${md}>`, "a.html").code.startsWith(expected), md);
  });

  it("warns about unknown md-* elements and leaves them", () => {
    const source = "html`<md-navigation-bar></md-navigation-bar>`";
    const result = transform(source, "nav.ts");
    assert.equal(result.code, source);
    assert.match(result.warnings[0]!, /^nav\.ts:1: <md-navigation-bar> isn't an @material\/web element the codemod knows/);
  });

  it("warns about md-* elements with no lit-material equivalent and leaves them", () => {
    const source = '<md-sub-menu><md-menu-item slot="item">x</md-menu-item></md-sub-menu><md-elevation></md-elevation>';
    const result = transform(source, "a.html");
    assert.ok(result.code.includes("<md-sub-menu>") && result.code.includes("<md-elevation>"));
    assert.ok(result.warnings.some((w) => w.includes("<md-sub-menu> has no lit-material equivalent")));
    assert.ok(result.warnings.some((w) => w.includes("<md-elevation> has no lit-material equivalent")));
  });

  it("doesn't mistake TypeScript generics or comparisons for markup", () => {
    const source = "const m = new Map<string, Array<number>>(); if (a<b && c > d) {}\nconst t = html`<md-divider></md-divider>`;";
    const { code } = transform(source, "a.ts");
    assert.equal(code, "const m = new Map<string, Array<number>>(); if (a<b && c > d) {}\nconst t = html`<lit-material-divider></lit-material-divider>`;");
  });

  it("skips expressions that contain > and quotes", () => {
    const source = 'html`<md-checkbox ?checked=${a > b} @change=${() => f("}>", `x${1}`)}></md-checkbox>`';
    assert.equal(transform(source, "a.ts").code, 'html`<lit-material-checkbox ?checked=${a > b} @change=${() => f("}>", `x${1}`)}></lit-material-checkbox>`');
  });

  it("handles nested templates inside an element", () => {
    const source = "html`<md-list>${items.map((i) => html`<md-list-item><span slot=\"end\">${i}</span></md-list-item>`)}</md-list>`";
    assert.equal(
      transform(source, "a.ts").code,
      'html`<lit-material-list>${items.map((i) => html`<lit-material-list-item><span slot="trailing">${i}</span></lit-material-list-item>`)}</lit-material-list>`',
    );
  });

  it("leaves a file without @material/web alone", () => {
    const source = 'import "@lit-material/button";\nhtml`<lit-material-button>Hi</lit-material-button>`;\n';
    assert.deepEqual(transform(source, "a.ts"), { code: source, changes: [], warnings: [], packages: [] });
  });

  it("reports unsupported file types without touching them", () => {
    const result = transform("<md-filled-button></md-filled-button>", "page.vue");
    assert.equal(result.code, "<md-filled-button></md-filled-button>");
    assert.match(result.warnings[0]!, /not a file type the codemod reads/);
  });
});

describe("attributes", () => {
  it("renames attributes in attribute and property form (Lit, Angular, Vue, JSX)", () => {
    assert.equal(transform('<md-filled-text-field prefix-text="$"></md-filled-text-field>', "a.html").code, '<lit-material-text-field variant="filled" prefix="$"></lit-material-text-field>');
    assert.equal(transform("html`<md-filled-text-field .prefixText=${p}></md-filled-text-field>`", "a.ts").code, 'html`<lit-material-text-field variant="filled" .prefix=${p}></lit-material-text-field>`');
    assert.equal(transform('<md-switch [selected]="on"></md-switch>', "a.html").code, '<lit-material-switch [checked]="on"></lit-material-switch>');
    assert.equal(transform('<md-switch :selected="on"></md-switch>', "a.html").code, '<lit-material-switch :checked="on"></lit-material-switch>');
    assert.equal(transform("html`<md-switch ?selected=${on}></md-switch>`", "a.ts").code, "html`<lit-material-switch ?checked=${on}></lit-material-switch>`");
    assert.equal(transform("<md-switch selected={on} />", "a.tsx").code, "<lit-material-switch checked={on} />");
    assert.equal(transform('<md-tabs [activeTabIndex]="i"></md-tabs>', "a.html").code, '<lit-material-tabs [selected]="i"></lit-material-tabs>');
  });

  it("maps values, and warns when a bound value can't be mapped", () => {
    assert.equal(transform('<md-fab variant="tertiary" size="medium"></md-fab>', "a.html").code, '<lit-material-fab color="tertiary" size="regular"></lit-material-fab>');
    const bound = transform("html`<md-fab size=${s}></md-fab>`", "a.ts");
    assert.equal(bound.code, 'html`<lit-material-fab color="surface" size=${s}></lit-material-fab>`');
    assert.ok(bound.warnings.some((w) => w.includes("size is bound: its values differ in lit-material (medium → regular)")));
    const unknown = transform('<md-fab size="huge"></md-fab>', "a.html");
    assert.ok(unknown.warnings.some((w) => w.includes('size="huge" has no lit-material value')));
  });

  it("adds an attribute where @material/web's default differs", () => {
    assert.equal(transform("<md-fab></md-fab>", "a.html").code, '<lit-material-fab color="surface"></lit-material-fab>');
    assert.equal(transform('<md-fab variant="primary"></md-fab>', "a.html").code, '<lit-material-fab color="primary"></lit-material-fab>');
    assert.equal(transform('<md-input-chip label="a"></md-input-chip>', "a.html").code, '<lit-material-chip variant="input" removable>a</lit-material-chip>');
  });

  it("turns label into text content, in every syntax", () => {
    assert.equal(transform('<md-filter-chip label="Spicy" selected></md-filter-chip>', "a.html").code, '<lit-material-chip variant="filter" selected>Spicy</lit-material-chip>');
    assert.equal(transform("html`<md-assist-chip label=${name}></md-assist-chip>`", "a.ts").code, 'html`<lit-material-chip variant="assist">${name}</lit-material-chip>`');
    assert.equal(transform('<md-assist-chip [label]="name"></md-assist-chip>', "a.html").code, '<lit-material-chip variant="assist">{{ name }}</lit-material-chip>');
    assert.equal(transform("<md-assist-chip label={name} />", "a.tsx").code, '<lit-material-chip variant="assist">{name}</lit-material-chip>');
    assert.equal(transform('<md-assist-chip label="a < b" />', "a.tsx").code, '<lit-material-chip variant="assist">{"a < b"}</lit-material-chip>');
    assert.equal(transform('<md-fab label="Compose"><md-icon slot="icon">edit</md-icon></md-fab>', "a.html").code.split(">")[0], '<lit-material-fab extended color="surface"');
  });

  it("picks lit-material-textarea for type=textarea, and warns when type is bound", () => {
    assert.equal(transform('<md-filled-text-field type="textarea" rows="4"></md-filled-text-field>', "a.html").code, '<lit-material-textarea variant="filled" rows="4"></lit-material-textarea>');
    const bound = transform("html`<md-filled-text-field type=${t}></md-filled-text-field>`", "a.ts");
    assert.ok(bound.code.startsWith("html`<lit-material-text-field"));
    assert.ok(bound.warnings.some((w) => w.includes('if it can be "textarea", use <lit-material-textarea>')));
    const prefix = transform('<md-filled-text-field type="textarea" prefix-text="$"></md-filled-text-field>', "a.html");
    assert.equal(prefix.code, '<lit-material-textarea variant="filled" prefix-text="$"></lit-material-textarea>');
    assert.ok(prefix.warnings.some((w) => w.includes("prefix-text: lit-material-textarea has no prefix")));
  });

  it("expands, removes and maps by value", () => {
    assert.equal(transform("<md-divider inset></md-divider>", "a.html").code, "<lit-material-divider inset-start inset-end></lit-material-divider>");
    assert.equal(transform("html`<md-divider ?inset=${x}></md-divider>`", "a.ts").code, "html`<lit-material-divider ?inset-start=${x} ?inset-end=${x}></lit-material-divider>`");
    assert.equal(transform('<md-filled-button has-icon type="submit"></md-filled-button>', "a.html").code, '<lit-material-button variant="filled" type="submit"></lit-material-button>');
    assert.equal(transform('<md-list-item type="link" href="/a"></md-list-item>', "a.html").code, '<lit-material-list-item href="/a"></lit-material-list-item>');
    assert.equal(transform('<md-list-item type="button"></md-list-item>', "a.html").code, "<lit-material-list-item interactive></lit-material-list-item>");
  });

  it("leaves attributes it can't map and says why", () => {
    const result = transform('<md-slider range value-start="1" value-end="5"></md-slider>', "a.html");
    assert.equal(result.code, '<lit-material-slider range value-start="1" value-end="5"></lit-material-slider>');
    assert.equal(result.warnings.filter((w) => w.includes("single-value")).length, 3);
  });

  it("renames events, and warns about ones that don't exist", () => {
    assert.equal(transform("html`<md-dialog @closed=${f}></md-dialog>`", "a.ts").code, "html`<lit-material-dialog @close=${f}></lit-material-dialog>`");
    assert.equal(transform('<md-dialog (closed)="f()"></md-dialog>', "a.html").code, '<lit-material-dialog (close)="f()"></lit-material-dialog>');
    assert.equal(transform("<md-menu onclosed={f} />", "a.tsx").code, "<lit-material-menu onclose={f} />");
    const opened = transform("html`<md-dialog @opened=${f}></md-dialog>`", "a.ts");
    assert.ok(opened.warnings.some((w) => w.includes('event "opened": lit-material-dialog has no event after opening')));
  });
});

describe("slots", () => {
  it("renames, drops and warns about children's slots", () => {
    const source = '<md-list-item><div slot="headline">A</div><img slot="start"><b slot="end">1</b></md-list-item>';
    assert.equal(
      transform(source, "a.html").code,
      '<lit-material-list-item><div>A</div><img slot="leading"><b slot="trailing">1</b></lit-material-list-item>',
    );
    assert.equal(
      transform('<md-dialog><p slot="content">Hi</p><div slot="actions"></div></md-dialog>', "a.html").code,
      '<lit-material-dialog><p>Hi</p><div slot="actions"></div></lit-material-dialog>',
    );
  });

  it("gives an icon button's unslotted icon the icon slot", () => {
    assert.equal(
      transform("html`<md-icon-button toggle><md-icon>a</md-icon><md-icon slot=\"selected\">b</md-icon></md-icon-button>`", "a.ts").code,
      'html`<lit-material-icon-button toggle><lit-material-icon slot="icon">a</lit-material-icon><lit-material-icon slot="selected-icon">b</lit-material-icon></lit-material-icon-button>`',
    );
    const svg = transform('<md-icon-button aria-label="x"><svg></svg></md-icon-button>', "a.html");
    assert.ok(svg.warnings.some((w) => w.includes('add slot="icon" to the icon')));
  });
});

describe("imports", () => {
  it("rewrites side-effect imports, keeping quotes and semicolons, and dedupes", () => {
    const source = [
      "import '@material/web/button/filled-button.js'",
      'import "@material/web/button/outlined-button.js";',
      'import "@material/web/textfield/filled-text-field.js";',
      'import "@material/web/textfield/outlined-text-field";',
      "",
    ].join("\n");
    const result = transform(source, "a.ts");
    assert.equal(result.code, "import '@lit-material/button'\nimport \"@lit-material/text-field\";\n");
    assert.equal(result.changes.length, 4);
  });

  it("drops an import whose package the file already imports", () => {
    const source = 'import { LitMaterialButton } from "@lit-material/button";\nimport "@material/web/button/text-button.js";\n';
    assert.equal(transform(source, "a.ts").code, 'import { LitMaterialButton } from "@lit-material/button";\n');
  });

  it("warns about all.js with the imports to use instead", () => {
    const source = 'import "@material/web/all.js";\nhtml`<md-checkbox></md-checkbox><md-outlined-select></md-outlined-select>`;';
    const result = transform(source, "main.ts");
    assert.ok(result.code.startsWith('import "@material/web/all.js";'));
    const warning = result.warnings.find((w) => w.includes("all.js"))!;
    assert.match(warning, /^main\.ts:1: /);
    assert.ok(warning.includes('import "@lit-material/checkbox"; import "@lit-material/select";'), warning);
  });

  it("warns about all.js with every package when the file has no elements", () => {
    const { warnings } = transform('import "@material/web/all.js";', "main.ts");
    for (const p of ["button", "text-field", "tabs", "progress", "menu", "list"]) assert.ok(warnings[0]!.includes(`"@lit-material/${p}"`), p);
  });

  it("warns about named imports, dynamic imports, typography and unknown modules", () => {
    const source = [
      'import { MdFilledButton } from "@material/web/button/filled-button.js";',
      'import { styles } from "@material/web/typography/md-typescale-styles.js";',
      'import "@material/web/labs/card/elevated-card.js";',
      'const lazy = () => import("@material/web/dialog/dialog.js");',
      "",
    ].join("\n");
    const result = transform(source, "a.ts");
    assert.equal(result.code, source);
    assert.match(result.warnings[0]!, /a\.ts:1: .*LitMaterialButton from "@lit-material\/button"/);
    assert.match(result.warnings[1]!, /a\.ts:2: .*@lit-material\/tokens\/css\/typography\.css/);
    assert.match(result.warnings[2]!, /a\.ts:3: .*not a module the codemod knows/);
    assert.match(result.warnings[3]!, /a\.ts:4: a reference to @material\/web the codemod doesn't rewrite/);
  });
});

describe("tokens", () => {
  it("leaves --md-sys-* tokens alone and points component tokens at the lit-material element", () => {
    const source = ":root { --md-sys-color-primary: red; }\nmd-switch { --md-switch-handle-color: blue; }\n";
    const result = transform(source, "theme.css");
    assert.equal(result.code, source);
    assert.ok(result.warnings.some((w) => w.startsWith("theme.css:2: --md-switch-handle-color: ") && w.includes("lit-material-switch has no custom properties of its own; parts ::part(focus-ring), ::part(ripple), ::part(switch), ::part(thumb), ::part(track)")));
    assert.ok(!result.warnings.some((w) => w.includes("--md-sys-color-primary")));
  });

  it("matches the longest token prefix", () => {
    const { warnings } = transform("a { --md-icon-button-icon-size: 1px; --md-icon-size: 2px; }", "a.css");
    assert.ok(warnings[0]!.includes("lit-material-icon-button has"));
    assert.ok(warnings[1]!.includes("lit-material-icon has"));
  });
});
