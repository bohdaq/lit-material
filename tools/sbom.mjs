#!/usr/bin/env node
// A CycloneDX SBOM per published package, from the lockfile: its runtime dependency tree (dependencies,
// not devDependencies; optional peers such as React left out, since the app picks those). Written to
// packages/<name>/dist/sbom.cdx.json, so it ships inside the npm tarball next to the code it describes.
// `pnpm release` runs this after the build.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = mkdtempSync(join(tmpdir(), "lit-material-sbom-"));
execFileSync(
  "pnpm",
  [
    "sbom",
    "--sbom-format",
    "cyclonedx",
    "--prod",
    "--exclude-peers",
    "--lockfile-only",
    "--split",
    "--filter",
    "./packages/*",
    "--sbom-supplier",
    "lit-material",
    "--out",
    join(out, "%s@%v.cdx.json"),
  ],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] },
);

const byName = new Map();
for (const file of readdirSync(out)) {
  const bom = JSON.parse(readFileSync(join(out, file), "utf8"));
  const { group, name } = bom.metadata.component;
  byName.set(group ? `${group}/${name}` : name, bom);
}

// pnpm leaves workspace dependencies (`workspace:*`, e.g. @lit-material/core) out of each SBOM: add them,
// with everything they depend on, so every SBOM lists the package's whole runtime tree.
const pkgs = new Map();
for (const dir of readdirSync(join(root, "packages")).sort()) {
  const pkgFile = join(root, "packages", dir, "package.json");
  if (existsSync(pkgFile)) pkgs.set(JSON.parse(readFileSync(pkgFile, "utf8")).name, { dir, pkg: JSON.parse(readFileSync(pkgFile, "utf8")) });
}
const purl = (name, version) => `pkg:npm/${name.replace("@", "%40")}@${version}`;
const workspaceDeps = (pkg) => Object.entries(pkg.dependencies ?? {}).filter(([, v]) => String(v).startsWith("workspace:")).map(([n]) => n);

function complete(name, seen = new Set()) {
  const bom = byName.get(name);
  const { pkg } = pkgs.get(name);
  const components = new Map((bom.components ?? []).map((c) => [c["bom-ref"] ?? c.purl, c]));
  const dependencies = new Map((bom.dependencies ?? []).map((d) => [d.ref, new Set(d.dependsOn ?? [])]));
  const rootRef = bom.metadata.component["bom-ref"] ?? purl(name, pkg.version);
  if (!dependencies.has(rootRef)) dependencies.set(rootRef, new Set());
  for (const dep of workspaceDeps(pkg)) {
    if (!pkgs.has(dep) || !byName.has(dep)) continue;
    const depPkg = pkgs.get(dep).pkg;
    const ref = purl(dep, depPkg.version);
    dependencies.get(rootRef).add(ref);
    const [group, short] = dep.split("/");
    components.set(ref, { type: "library", "bom-ref": ref, group, name: short, version: depPkg.version, purl: ref, licenses: depPkg.license ? [{ license: { id: depPkg.license } }] : undefined });
    if (seen.has(dep)) continue;
    seen.add(dep);
    const sub = complete(dep, seen);
    for (const c of sub.components) components.set(c["bom-ref"] ?? c.purl, c);
    for (const d of sub.dependencies) {
      const set = dependencies.get(d.ref) ?? new Set();
      for (const r of d.dependsOn ?? []) set.add(r);
      dependencies.set(d.ref, set);
    }
  }
  return {
    ...bom,
    components: [...components.values()],
    dependencies: [...dependencies].map(([ref, set]) => ({ ref, dependsOn: [...set] })),
  };
}

let written = 0;
const missing = [];
for (const [name, { dir, pkg }] of pkgs) {
  if (pkg.private) continue;
  if (!byName.has(name)) {
    missing.push(name);
    continue;
  }
  if (!existsSync(join(root, "packages", dir, "dist"))) {
    missing.push(`${name} (not built)`);
    continue;
  }
  writeFileSync(join(root, "packages", dir, "dist", "sbom.cdx.json"), `${JSON.stringify(complete(name), null, 2)}\n`);
  written++;
}
rmSync(out, { recursive: true, force: true });
if (missing.length) {
  console.error(`No SBOM for: ${missing.join(", ")}`);
  process.exit(1);
}
console.log(`Wrote dist/sbom.cdx.json for ${written} packages.`);
