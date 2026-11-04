import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { run } from "./cli.js";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");

function snapshot(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else out[p.slice(dir.length + 1)] = readFileSync(p, "utf8");
    }
  };
  walk(dir);
  return out;
}

describe("cli", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "lit-material-codemod-"));
    for (const name of ["html", "lit", "tsx", "css"]) {
      mkdirSync(join(dir, "src", name), { recursive: true });
      const input = readdirSync(join(fixtures, name)).find((f) => f.startsWith("input"))!;
      cpSync(join(fixtures, name, input), join(dir, "src", name, input));
    }
    mkdirSync(join(dir, "node_modules", "x"), { recursive: true });
    writeFileSync(join(dir, "node_modules", "x", "index.js"), 'import "@material/web/button/filled-button.js";\n');
    writeFileSync(join(dir, "src", "notes.md"), "<md-filled-button>\n");
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("--dry-run reports the changes and writes nothing", () => {
    const before = snapshot(dir);
    const result = run(["md-web", "src", "--dry-run"], { cwd: dir });
    assert.equal(result.exitCode, 0);
    assert.deepEqual(snapshot(dir), before);
    const text = result.messages.join("\n");
    assert.match(text, /would change {2}src\/lit\/input\.ts:3: import "@material\/web\/list\/list\.js" → import "@lit-material\/list"/);
    assert.match(text, /warning {2}src\/html\/input\.html:33: <md-ripple> has no lit-material equivalent/);
    assert.match(text, /4 files read; 3 would be rewritten/);
    assert.match(text, /Dry run: nothing was written\./);
  });

  it("rewrites files in place, skips node_modules and other file types, and a second run changes nothing", () => {
    const result = run(["md-web", "."], { cwd: dir });
    assert.equal(result.exitCode, 0);
    for (const name of ["html", "lit", "tsx", "css"]) {
      const files = readdirSync(join(fixtures, name));
      const input = files.find((f) => f.startsWith("input"))!;
      const output = files.find((f) => f.startsWith("output"))!;
      assert.equal(readFileSync(join(dir, "src", name, input), "utf8"), readFileSync(join(fixtures, name, output), "utf8"), name);
    }
    assert.equal(readFileSync(join(dir, "node_modules", "x", "index.js"), "utf8"), 'import "@material/web/button/filled-button.js";\n');
    assert.equal(readFileSync(join(dir, "src", "notes.md"), "utf8"), "<md-filled-button>\n");
    const text = result.messages.join("\n");
    assert.match(text, /4 files read; 3 rewritten/);
    assert.match(text, /npm install @lit-material\/tokens @lit-material\/button .*@lit-material\/text-field/);

    const after = snapshot(dir);
    const again = run(["md-web", "."], { cwd: dir });
    assert.deepEqual(snapshot(dir), after);
    assert.match(again.messages.join("\n"), /4 files read; 0 rewritten \(0 changes\)/);
  });

  it("takes single files", () => {
    const result = run(["md-web", "src/tsx/input.tsx"], { cwd: dir });
    assert.equal(result.exitCode, 0);
    assert.match(result.messages.join("\n"), /1 file read; 1 rewritten/);
  });

  it("explains its usage and rejects bad arguments", () => {
    assert.equal(run([], { cwd: dir }).exitCode, 1);
    assert.equal(run(["--help"], { cwd: dir }).exitCode, 0);
    assert.match(run(["--help"], { cwd: dir }).messages[0]!, /npx @lit-material\/codemod md-web/);
    assert.equal(run(["angular"], { cwd: dir }).exitCode, 1);
    assert.equal(run(["md-web"], { cwd: dir }).exitCode, 1);
    assert.equal(run(["md-web", "src", "--force"], { cwd: dir }).exitCode, 1);
    assert.deepEqual(run(["md-web", "missing"], { cwd: dir }), { exitCode: 1, messages: ["missing: no such file or folder."] });
  });
});
