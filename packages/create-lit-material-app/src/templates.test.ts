// End to end: scaffold the ssr template, point its dependencies at this workspace's packages, build it with
// Vite (client, server, prerender) and serve pages from the build, as `npm run build && npm start` would.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { after, before, describe, it } from "node:test";
import { run } from "./cli.js";

const here = import.meta.dirname;
const packageDir = path.join(here, "..");
// Inside the package (not the OS temp dir) so Node resolves the build's imports from linked node_modules.
const e2e = path.join(packageDir, ".e2e");
const app = path.join(e2e, "ssr-app");

const tsc = createRequire(path.join(packageDir, "package.json")).resolve("typescript/bin/tsc");
const typecheck = (dir: string) => execFileSync(process.execPath, [tsc, "-p", path.join(dir, "tsconfig.json")], { stdio: "pipe" });

function linkDependencies(app: string): void {
  const pkg = JSON.parse(fs.readFileSync(path.join(app, "package.json"), "utf8")) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  for (const name of [...Object.keys(pkg.dependencies), "vite"]) {
    const source = fs.realpathSync(path.join(packageDir, "node_modules", name));
    const target = path.join(app, "node_modules", name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.symlinkSync(source, target, "dir");
  }
}

describe("ssr template, built and served", () => {
  let handler: (request: Request) => Promise<Response>;

  before(async () => {
    fs.rmSync(e2e, { recursive: true, force: true });
    assert.equal(run([app, "--template", "ssr"], e2e).exitCode, 0);
    linkDependencies(app);
    const { build } = await import("vite");
    await build({ root: app, configFile: path.join(app, "vite.config.ts"), logLevel: "silent" });
    const server = await import(pathToFileURL(path.join(app, "node_modules", "@lit-material", "vite", "dist", "server.js")).href);
    handler = server.createRequestHandler({
      template: fs.readFileSync(path.join(app, "dist", "server", "template.html"), "utf8"),
      entry: () => import(pathToFileURL(path.join(app, "dist", "server", "entry-server.js")).href),
    });
  });
  after(() => fs.rmSync(e2e, { recursive: true, force: true }));

  it("typechecks", () => {
    typecheck(app);
  });

  it("renders the post list from the home route's loader", async () => {
    const response = await handler(new Request("http://localhost/"));
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<app-shell>/);
    assert.match(html, /Hello, world/);
    assert.match(html, /<title>ssr-app<\/title>/);
    assert.match(html, /lit-material-route-data/);
  });

  it("renders a post with its loader data and title", async () => {
    const html = await (await handler(new Request("http://localhost/posts/loaders"))).text();
    assert.match(html, /<title>Route loaders<\/title>/);
    assert.match(html, /A route's loader runs before it renders/);
  });

  it("answers redirects and unknown pages with the routes' statuses", async () => {
    const redirect = await handler(new Request("http://localhost/home"));
    assert.equal(redirect.status, 302);
    assert.equal(redirect.headers.get("location"), "/");
    assert.equal((await handler(new Request("http://localhost/nope"))).status, 404);
  });

  it("prerendered the listed pages, and the client bundle references the CSS tokens", () => {
    for (const file of ["index.html", "about/index.html", "posts/hello/index.html", "404.html"]) {
      assert.ok(fs.existsSync(path.join(app, "dist", file)), file);
    }
    assert.match(fs.readFileSync(path.join(app, "dist", "posts", "hello", "index.html"), "utf8"), /rendered on the server/);
    const assets = fs.readdirSync(path.join(app, "dist", "assets"));
    assert.ok(assets.some((f) => f.endsWith(".css")), "tokens CSS emitted");
  });
});

describe("spa template, built", () => {
  const spa = path.join(e2e, "spa-app");
  before(async () => {
    fs.mkdirSync(e2e, { recursive: true });
    assert.equal(run([spa], e2e).exitCode, 0);
    linkDependencies(spa);
    const { build } = await import("vite");
    await build({ root: spa, logLevel: "silent" });
  });
  after(() => fs.rmSync(e2e, { recursive: true, force: true }));

  it("typechecks", () => {
    typecheck(spa);
  });

  it("builds to a client bundle", () => {
    const html = fs.readFileSync(path.join(spa, "dist", "index.html"), "utf8");
    assert.match(html, /<app-shell><\/app-shell>/);
    assert.match(html, /<script type="module" crossorigin src="\/assets\/index-[\w-]+\.js">/);
  });
});
