// Copy into a package dir as wtr.local.config.js, run `npx web-test-runner --config wtr.local.config.js`, delete after.
import base from "./web-test-runner.config.js";
import { playwrightLauncher } from "@web/test-runner-playwright";
export default { ...base, browsers: [playwrightLauncher({ product: "chromium", launchOptions: { executablePath: "/opt/pw-browsers/chromium" } })] };
