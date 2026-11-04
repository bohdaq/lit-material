import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

/**
 * The scaffolder itself: Node built-ins only (`fs`/`path`/`url`), no
 * `commander`/`inquirer`/`chalk` — the same reasoning `@lit-material/router`
 * gives for hand-rolling its own path matching instead of depending on
 * `@lit-labs/router`: the actual need — copy a template directory, substitute
 * one placeholder, print next steps — doesn't need a dependency for it.
 *
 * Lives in its own file (not inlined in `bin/create-lit-material-app.js`)
 * so it's testable without actually invoking a subprocess.
 */

/** Resolves to the package root regardless of whether this runs from `src/` (tests) or the compiled `dist/`. */
function packageRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

export const TEMPLATES = {
  spa: "A client-rendered app: router, store, top app bar, theme toggle.",
  ssr: "A server-rendered app on @lit-material/vite: route loaders, prerendering, a Node server.",
} as const;
export type TemplateName = keyof typeof TEMPLATES;

export interface RunResult {
  /** 0 on success, 1 if the target directory already exists and isn't empty, or the arguments are wrong. */
  exitCode: number;
  targetDir: string;
  projectName: string;
  template?: TemplateName;
  messages: string[];
}

function parseArgs(argv: string[]): { target?: string; template: string; help: boolean } {
  let target: string | undefined;
  let template = "spa";
  let help = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--help" || arg === "-h") help = true;
    else if (arg === "--template" || arg === "-t") template = argv[++i] ?? "";
    else if (arg.startsWith("--template=")) template = arg.slice("--template=".length);
    else if (!arg.startsWith("-") && target === undefined) target = arg;
  }
  return { target, template, help };
}

function usage(): string[] {
  return [
    "Usage: create-lit-material-app [directory] [--template <name>]",
    "",
    "Templates:",
    ...Object.entries(TEMPLATES).map(([name, description]) => `  ${name.padEnd(5)} ${description}`),
    "",
  ];
}

/** Current @lit-material versions, snapshotted at build time (see scripts/versions.mjs). */
function versions(): Record<string, string> {
  const file = path.join(packageRoot(), "dist", "versions.json");
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, string>) : {};
}

/**
 * Scaffolds a new project at the directory argument (or `./my-lit-material-app` if omitted) by copying
 * `templates/<name>/` into it (`--template spa`, the default, or `ssr`), substituting `{{PROJECT_NAME}}` with
 * the target directory's basename and `{{version:<package>}}` with `^<version>` of that lit-material package.
 *
 * @param argv Command-line arguments, e.g. `process.argv.slice(2)`.
 * @param cwd Base directory the target path is resolved against — a parameter (not always `process.cwd()`)
 *   so tests can scaffold into a throwaway directory without actually changing the process's cwd.
 */
export function run(argv: string[], cwd: string = process.cwd()): RunResult {
  const args = parseArgs(argv);
  const targetDir = path.resolve(cwd, args.target || "my-lit-material-app");
  const projectName = path.basename(targetDir);
  const messages: string[] = [];

  if (args.help) return { exitCode: 0, targetDir, projectName, messages: usage() };
  if (!(args.template in TEMPLATES)) {
    messages.push(`Error: unknown template "${args.template}".`, "", ...usage());
    return { exitCode: 1, targetDir, projectName, messages };
  }
  const template = args.template as TemplateName;

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    messages.push(`Error: "${targetDir}" already exists and is not empty.`);
    return { exitCode: 1, targetDir, projectName, messages };
  }

  const templateDir = path.join(packageRoot(), "templates", template);
  copyTemplate(templateDir, targetDir, { projectName, versions: versions() });

  messages.push(`Created ${projectName} at ${targetDir} from the ${template} template.`, "", "Next steps:", "");
  const relativeDir = path.relative(cwd, targetDir) || ".";
  messages.push(`  cd ${relativeDir}`, "  npm install", "  npm run dev");
  if (template === "ssr") messages.push("", "For production:", "", "  npm run build", "  npm start");
  messages.push("");

  return { exitCode: 0, targetDir, projectName, template, messages };
}

interface Substitutions {
  projectName: string;
  versions: Record<string, string>;
}

function copyTemplate(src: string, dest: string, subs: Substitutions): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    // npm never publishes a file named .gitignore, so templates carry it as `gitignore`.
    const destPath = path.join(dest, entry.name === "gitignore" ? ".gitignore" : entry.name);
    if (entry.isDirectory()) {
      copyTemplate(srcPath, destPath, subs);
    } else {
      const content = fs
        .readFileSync(srcPath, "utf8")
        .replaceAll("{{PROJECT_NAME}}", subs.projectName)
        .replace(/\{\{version:(@lit-material\/[\w-]+)\}\}/g, (token, name: string) => {
          const version = subs.versions[name];
          return version ? `^${version}` : token;
        });
      fs.writeFileSync(destPath, content);
    }
  }
}
