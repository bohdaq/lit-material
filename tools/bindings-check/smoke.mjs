#!/usr/bin/env node
// Runtime check for the React bindings: bundles smoke-app.tsx with esbuild, renders it in Chromium and
// clicks both checkboxes — the @lit/react wrapper must map onChange to the element's `change` event, and
// React 19's native custom-element support must deliver `onchange`. Run after `pnpm build`.
import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const result = await build({
  entryPoints: [join(here, "smoke-app.tsx")],
  bundle: true,
  format: "esm",
  jsx: "automatic",
  write: false,
  logLevel: "error",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "@lit-material/checkbox/react": join(here, "../../packages/checkbox/dist/react.js"),
    "@lit-material/checkbox": join(here, "../../packages/checkbox/dist/index.js"),
  },
  nodePaths: [join(here, "../../node_modules"), join(here, "../../packages/checkbox/node_modules")],
});
const script = result.outputFiles[0].text;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(`<!doctype html><div id="root"></div>`);
  await page.addScriptTag({ content: script, type: "module" });
  await page.waitForFunction(() => window.ready === true);
  await page.click("#wrapped");
  await page.click("#native");
  const log = await page.evaluate(() => window.log);
  const checked = await page.evaluate(() => [...document.querySelectorAll("lit-material-checkbox")].map((el) => el.checked));
  const expected = ["wrapped:change", "native:change"];
  if (errors.length || JSON.stringify(log) !== JSON.stringify(expected) || checked.join() !== "true,true") {
    console.error({ errors, log, checked });
    process.exit(1);
  }
  console.log("React bindings: wrapper and native element both handle change.");
} finally {
  await browser.close();
}
