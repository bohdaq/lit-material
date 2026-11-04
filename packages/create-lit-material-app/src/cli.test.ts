import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { run } from "./cli.js";

const cleanupDirs: string[] = [];

function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "create-lit-material-app-test-"));
  cleanupDirs.push(dir);
  return dir;
}

describe("create-lit-material-app CLI", () => {
  afterEach(() => {
    while (cleanupDirs.length > 0) {
      fs.rmSync(cleanupDirs.pop()!, { recursive: true, force: true });
    }
  });

  it("scaffolds a new project into the given directory", () => {
    const cwd = tmpDir();
    const result = run(["my-app"], cwd);

    assert.equal(result.exitCode, 0);
    assert.equal(result.projectName, "my-app");
    assert.ok(fs.existsSync(path.join(cwd, "my-app", "package.json")));
    assert.ok(fs.existsSync(path.join(cwd, "my-app", "index.html")));
    assert.ok(fs.existsSync(path.join(cwd, "my-app", "src", "app-shell.ts")));
    assert.ok(fs.existsSync(path.join(cwd, "my-app", "src", "home-page.ts")));
    assert.ok(fs.existsSync(path.join(cwd, "my-app", "src", "about-page.ts")));
    assert.ok(fs.existsSync(path.join(cwd, "my-app", "src", "store.ts")));
    assert.ok(fs.existsSync(path.join(cwd, "my-app", "tsconfig.json")));
    assert.ok(fs.existsSync(path.join(cwd, "my-app", ".gitignore")));
    assert.ok(!fs.existsSync(path.join(cwd, "my-app", "gitignore")));
  });

  it("fills in the current version of every lit-material package", () => {
    const cwd = tmpDir();
    for (const template of ["spa", "ssr", "console"]) {
      run([template, "--template", template], cwd);
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, template, "package.json"), "utf8")) as {
        dependencies: Record<string, string>;
      };
      for (const [name, range] of Object.entries(pkg.dependencies)) {
        if (!name.startsWith("@lit-material/")) continue;
        const dir = name.slice("@lit-material/".length);
        const current = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "..", dir, "package.json"), "utf8")).version;
        assert.equal(range, `^${current}`, `${template}: ${name}`);
      }
      const all = fs.readdirSync(path.join(cwd, template), { recursive: true, withFileTypes: true });
      for (const entry of all) {
        if (!entry.isFile()) continue;
        const text = fs.readFileSync(path.join(entry.parentPath, entry.name), "utf8");
        assert.doesNotMatch(text, /\{\{/, `${template}: placeholder left in ${entry.name}`);
      }
    }
  });

  it("scaffolds the ssr template with --template ssr (and --template=ssr)", () => {
    const cwd = tmpDir();
    const result = run(["blog", "--template", "ssr"], cwd);
    assert.equal(result.exitCode, 0);
    assert.equal(result.template, "ssr");
    for (const file of ["vite.config.ts", "server.js", "src/entry-server.ts", "src/routes.ts", "src/main.ts"]) {
      assert.ok(fs.existsSync(path.join(cwd, "blog", file)), file);
    }
    assert.ok(result.messages.some((m) => m.includes("npm start")));
    assert.equal(run(["blog2", "--template=ssr"], cwd).template, "ssr");
  });

  it("rejects an unknown template and lists the ones there are", () => {
    const cwd = tmpDir();
    const result = run(["x", "--template", "nope"], cwd);
    assert.equal(result.exitCode, 1);
    assert.ok(result.messages.some((m) => m.includes("unknown template")));
    assert.ok(result.messages.some((m) => m.includes("ssr")));
    assert.ok(!fs.existsSync(path.join(cwd, "x")));
  });

  it("prints usage for --help without scaffolding", () => {
    const cwd = tmpDir();
    const result = run(["--help"], cwd);
    assert.equal(result.exitCode, 0);
    assert.ok(result.messages[0]!.startsWith("Usage:"));
    assert.equal(fs.readdirSync(cwd).length, 0);
  });

  it("substitutes {{PROJECT_NAME}} in every copied file", () => {
    const cwd = tmpDir();
    run(["my-app"], cwd);

    const packageJson = fs.readFileSync(path.join(cwd, "my-app", "package.json"), "utf8");
    assert.match(packageJson, /"name": "my-app"/);
    assert.doesNotMatch(packageJson, /\{\{PROJECT_NAME\}\}/);

    const indexHtml = fs.readFileSync(path.join(cwd, "my-app", "index.html"), "utf8");
    assert.match(indexHtml, /<title>my-app<\/title>/);

    const appShell = fs.readFileSync(path.join(cwd, "my-app", "src", "app-shell.ts"), "utf8");
    assert.doesNotMatch(appShell, /\{\{PROJECT_NAME\}\}/);
  });

  it("defaults the target directory to my-lit-material-app when no argument is given", () => {
    const cwd = tmpDir();
    const result = run([], cwd);

    assert.equal(result.projectName, "my-lit-material-app");
    assert.ok(fs.existsSync(path.join(cwd, "my-lit-material-app", "package.json")));
  });

  it("derives the project name from the target path, not just the raw argument", () => {
    const cwd = tmpDir();
    const result = run(["./nested/my-app"], cwd);

    assert.equal(result.projectName, "my-app");
    const packageJson = fs.readFileSync(path.join(cwd, "nested", "my-app", "package.json"), "utf8");
    assert.match(packageJson, /"name": "my-app"/);
  });

  it("refuses to scaffold into a non-empty existing directory", () => {
    const cwd = tmpDir();
    const targetDir = path.join(cwd, "my-app");
    fs.mkdirSync(targetDir);
    fs.writeFileSync(path.join(targetDir, "existing-file.txt"), "hello");

    const result = run(["my-app"], cwd);

    assert.equal(result.exitCode, 1);
    assert.ok(result.messages.some((m) => m.includes("already exists")));
    // The existing file must be untouched, and no template files added.
    assert.ok(fs.existsSync(path.join(targetDir, "existing-file.txt")));
    assert.ok(!fs.existsSync(path.join(targetDir, "package.json")));
  });

  it("succeeds scaffolding into an existing but empty directory", () => {
    const cwd = tmpDir();
    const targetDir = path.join(cwd, "my-app");
    fs.mkdirSync(targetDir);

    const result = run(["my-app"], cwd);

    assert.equal(result.exitCode, 0);
    assert.ok(fs.existsSync(path.join(targetDir, "package.json")));
  });
});
