import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";

// Chromium-only by default so the local `pnpm test` loop stays fast; CI (and
// `pnpm test:cross-browser`) sets WTR_BROWSERS=all to also run Firefox and WebKit.
const browsers =
  process.env.WTR_BROWSERS === "all"
    ? [
        playwrightLauncher({ product: "chromium" }),
        playwrightLauncher({ product: "firefox" }),
        playwrightLauncher({ product: "webkit" }),
      ]
    : [playwrightLauncher({ product: "chromium" })];

export default {
  files: ["src/**/*.test.ts", "!src/**/*.ssr.test.ts"],
  nodeResolve: true,
  browsers,
  plugins: [
    esbuildPlugin({
      ts: true,
      target: "es2022",
      tsconfig: "tsconfig.test.json",
    }),
  ],
};
