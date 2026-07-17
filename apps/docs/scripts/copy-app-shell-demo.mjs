// Copies apps/app-shell-demo's built static site into apps/docs/dist so it can be embedded
// via <iframe> in the "Building apps" guide. Runs after `vite build`, once both this app's
// and app-shell-demo's `dist/` already exist (turbo.json orders app-shell-demo's build first).
import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const docsDir = fileURLToPath(new URL("..", import.meta.url));
const source = fileURLToPath(new URL("../../app-shell-demo/dist", import.meta.url));
const destination = `${docsDir}dist/app-shell-demo`;

if (!existsSync(source)) {
  throw new Error(
    `apps/app-shell-demo/dist not found — build it first (turbo.json should order ` +
      `"@lit-material/app-shell-demo#build" before "@lit-material/docs#build"; if you're ` +
      `running this script directly, run \`pnpm --filter @lit-material/app-shell-demo build\` first).`,
  );
}

cpSync(source, destination, { recursive: true });
