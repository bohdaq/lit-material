import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { after, before, describe, it } from "node:test";
import { build, createServer, type ViteDevServer } from "vite";
import { createRequestHandler } from "./server.js";

const fixture = join(import.meta.dirname, "..", "test-fixture");
const configFile = join(fixture, "vite.config.ts");

describe("@lit-material/vite dev server", () => {
  let server: ViteDevServer;
  let origin: string;
  before(async () => {
    server = await createServer({ root: fixture, configFile, logLevel: "silent", server: { port: 0, host: "127.0.0.1" } });
    await server.listen();
    const address = server.httpServer!.address();
    origin = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
  });
  after(() => server.close());

  it("server-renders a page through the app shell, with the route's title and head", async () => {
    const response = await fetch(`${origin}/`, { headers: { accept: "text/html" } });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<fixture-app-shell>/);
    assert.match(html, /shadowrootmode="open"/);
    assert.match(html, /Home page/);
    assert.match(html, /<title>Home<\/title>/);
    assert.match(html, /<meta name="generator" content="lit-material">/);
    assert.match(html, /\/@vite\/client/); // dev HMR still wired
  });

  it("runs loaders on the server and embeds their data", async () => {
    const html = await (await fetch(`${origin}/users/7`, { headers: { accept: "text/html" } })).text();
    assert.match(html, /User <!--lit-part-->7|User 7/);
    assert.match(html, /loaded on the <!--lit-part-->server|loaded on the server/);
    assert.match(html, /<title>User 7<\/title>/);
    assert.match(html, /<script type="application\/json" id="lit-material-route-data">/);
  });

  it("answers redirects with 302 and unknown pages with the catch-all's 404", async () => {
    const redirect = await fetch(`${origin}/old`, { headers: { accept: "text/html" }, redirect: "manual" });
    assert.equal(redirect.status, 302);
    assert.equal(redirect.headers.get("location"), "/users/1");
    const missing = await fetch(`${origin}/nope`, { headers: { accept: "text/html" } });
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /Not found/);
  });

  it("leaves modules and assets to Vite", async () => {
    const response = await fetch(`${origin}/src/routes.ts`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /javascript/);
  });

  it("hydrates in the browser without re-loading, then navigates client-side", { skip: !process.env.CHROMIUM_PATH && !process.env.CI }, async () => {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    try {
      const page = await browser.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      await page.goto(`${origin}/users/7`);
      await page.waitForFunction(() => (window as unknown as { hydrated?: boolean }).hydrated === true);
      await page.waitForTimeout(300);
      const text = () =>
        page.evaluate(() => {
          const outlet = document.querySelector("fixture-app-shell")!.shadowRoot!.querySelector("lit-material-router-outlet")!;
          return outlet.shadowRoot!.textContent!.replace(/\s+/g, " ");
        });
      assert.match(await text(), /User 7 \(loaded on the server\)/); // the server's data, not loaded again
      await page.goto(`${origin}/`);
      await page.waitForFunction(() => (window as unknown as { hydrated?: boolean }).hydrated === true);
      await page.locator("a[href='/users/3']").click();
      await page.waitForFunction(() => location.pathname === "/users/3");
      await page.waitForTimeout(300);
      assert.match(await text(), /User 3 \(loaded on the browser\)/);
      assert.equal(await page.title(), "User 3");
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });
});

describe("@lit-material/vite build", () => {
  // Inside the project, as a real build is: the server bundle imports lit and friends from node_modules.
  const outDir = join(fixture, "dist");
  before(async () => {
    await build({ root: fixture, configFile, logLevel: "silent", build: { outDir, emptyOutDir: true } });
  });
  after(() => rmSync(outDir, { recursive: true, force: true }));

  it("builds the server entry and keeps the page template", () => {
    assert.ok(existsSync(join(outDir, "server", "entry-server.js")));
    assert.match(readFileSync(join(outDir, "server", "template.html"), "utf8"), /<!--app-html-->/);
  });

  it("prerenders the listed paths, skipping redirects", () => {
    assert.match(readFileSync(join(outDir, "index.html"), "utf8"), /Home page/);
    const user = readFileSync(join(outDir, "users", "1", "index.html"), "utf8");
    assert.match(user, /<title>User 1<\/title>/);
    assert.match(user, /lit-material-route-data/);
    assert.match(readFileSync(join(outDir, "404.html"), "utf8"), /Not found/);
    assert.ok(!existsSync(join(outDir, "old")));
  });

  it("serves the built app with createRequestHandler", async () => {
    const handler = createRequestHandler({
      template: readFileSync(join(outDir, "server", "template.html"), "utf8"),
      entry: () => import(pathToFileURL(join(outDir, "server", "entry-server.js")).href),
    });
    const response = await handler(new Request("http://localhost/users/5"));
    assert.equal(response.status, 200);
    assert.match(await response.text(), /User <!--lit-part-->5|User 5/);
    assert.equal((await handler(new Request("http://localhost/old"))).status, 302);
    assert.equal((await handler(new Request("http://localhost/", { method: "POST" }))).status, 405);
  });
});
