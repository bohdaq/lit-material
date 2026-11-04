#!/usr/bin/env node
// Snapshots the current version of every @lit-material package into dist/versions.json at build time, so the
// templates' `{{version:@lit-material/x}}` placeholders scaffold the versions released alongside this CLI.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const packages = join(here, "..", "..");
const versions = {};
for (const dir of readdirSync(packages)) {
  const file = join(packages, dir, "package.json");
  if (!existsSync(file)) continue;
  const pkg = JSON.parse(readFileSync(file, "utf8"));
  if (pkg.name?.startsWith("@lit-material/") && !pkg.private) versions[pkg.name] = pkg.version;
}
mkdirSync(join(here, "..", "dist"), { recursive: true });
writeFileSync(join(here, "..", "dist", "versions.json"), `${JSON.stringify(versions, null, 2)}\n`);
