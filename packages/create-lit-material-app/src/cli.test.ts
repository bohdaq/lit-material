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
