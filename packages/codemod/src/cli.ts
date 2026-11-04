// `lit-material-codemod md-web <paths...> [--dry-run]`
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { kindOf, transform } from "./transform.js";

export interface RunResult {
  exitCode: number;
  messages: string[];
}

const USAGE = `Usage: npx @lit-material/codemod md-web <files or folders...> [--dry-run]

  md-web     Rewrite @material/web (md-*) usage to lit-material in HTML, Lit templates (.ts/.js),
             JSX/TSX and CSS: tags, attributes, slots, events and imports. Anything without a
             confident mapping is reported as file:line and left as it is.
  --dry-run  Report what would change; write nothing.

Folders are searched for .html .htm .ts .tsx .js .jsx .mjs .cjs .mts .cts .css .scss .sass .less,
skipping node_modules, dist and hidden folders. Commit first: files are rewritten in place.`;

const SKIP_DIRS = new Set(["node_modules", "dist", "build", "coverage"]);

function collect(path: string, out: string[], explicit: boolean) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const name of readdirSync(path).sort()) {
      if (name.startsWith(".") || SKIP_DIRS.has(name)) continue;
      collect(join(path, name), out, false);
    }
  } else if (explicit || kindOf(path)) out.push(path);
}

export function run(argv: string[], options: { cwd?: string } = {}): RunResult {
  const cwd = options.cwd ?? process.cwd();
  const messages: string[] = [];
  if (argv.includes("--help") || argv.includes("-h") || argv.length === 0) return { exitCode: argv.length === 0 ? 1 : 0, messages: [USAGE] };
  const [command, ...rest] = argv;
  if (command !== "md-web") return { exitCode: 1, messages: [`Unknown codemod "${command}".`, USAGE] };
  const dryRun = rest.includes("--dry-run");
  const unknown = rest.filter((a) => a.startsWith("-") && a !== "--dry-run");
  if (unknown.length) return { exitCode: 1, messages: [`Unknown option ${unknown.join(", ")}.`, USAGE] };
  const paths = rest.filter((a) => !a.startsWith("-"));
  if (!paths.length) return { exitCode: 1, messages: ["Give at least one file or folder.", USAGE] };

  const files: string[] = [];
  for (const p of paths) {
    const abs = resolve(cwd, p);
    if (!existsSync(abs)) return { exitCode: 1, messages: [`${p}: no such file or folder.`] };
    collect(abs, files, true);
  }

  let changed = 0;
  let changeCount = 0;
  let warningCount = 0;
  const packages = new Set<string>();
  for (const abs of files) {
    const name = relative(cwd, abs) || abs;
    const source = readFileSync(abs, "utf8");
    const result = transform(source, name);
    changeCount += result.changes.length;
    warningCount += result.warnings.length;
    result.packages.forEach((p) => packages.add(p));
    if (result.code !== source) {
      changed++;
      if (!dryRun) writeFileSync(abs, result.code);
    }
    for (const c of result.changes) messages.push(`  ${dryRun ? "would change" : "changed"}  ${c}`);
    for (const w of result.warnings) messages.push(`  warning  ${w}`);
  }

  messages.push(
    "",
    `${files.length} file${files.length === 1 ? "" : "s"} read; ${changed} ${dryRun ? "would be rewritten" : "rewritten"} (${changeCount} change${changeCount === 1 ? "" : "s"}); ${warningCount} warning${warningCount === 1 ? "" : "s"} to resolve by hand.`,
  );
  if (packages.size) {
    messages.push(
      `Install what the rewritten files use:  npm install @lit-material/tokens ${[...packages].sort().join(" ")}`,
      `Link the tokens once (your --md-sys-* theme values keep working): import "@lit-material/tokens/css/index.css";`,
      `Once the warnings are resolved:  npm uninstall @material/web`,
    );
  }
  if (dryRun) messages.push("Dry run: nothing was written.");
  return { exitCode: 0, messages };
}
