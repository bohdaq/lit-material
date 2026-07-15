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

export interface RunResult {
  /** 0 on success, 1 if the target directory already exists and isn't empty. */
  exitCode: number;
  targetDir: string;
  projectName: string;
  messages: string[];
}

/**
 * Scaffolds a new project at `argv[0]` (or `./my-lit-material-app` if
 * omitted) by copying `template/` into it, substituting `{{PROJECT_NAME}}`
 * in every file's contents with the target directory's own basename.
 *
 * @param argv Command-line arguments, e.g. `process.argv.slice(2)`.
 * @param cwd Base directory the target path is resolved against — a parameter (not always `process.cwd()`)
 *   so tests can scaffold into a throwaway directory without actually changing the process's cwd.
 */
export function run(argv: string[], cwd: string = process.cwd()): RunResult {
  const targetArg = argv[0];
  const targetDir = path.resolve(cwd, targetArg || "my-lit-material-app");
  const projectName = path.basename(targetDir);
  const messages: string[] = [];

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    messages.push(`Error: "${targetDir}" already exists and is not empty.`);
    return { exitCode: 1, targetDir, projectName, messages };
  }

  const templateDir = path.join(packageRoot(), "template");
  copyTemplate(templateDir, targetDir, projectName);

  messages.push(`Created ${projectName} at ${targetDir}`, "", "Next steps:", "");
  const relativeDir = path.relative(cwd, targetDir) || ".";
  messages.push(`  cd ${relativeDir}`, "  npm install", "  npm run dev", "");

  return { exitCode: 0, targetDir, projectName, messages };
}

function copyTemplate(src: string, dest: string, projectName: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyTemplate(srcPath, destPath, projectName);
    } else {
      const content = fs.readFileSync(srcPath, "utf8").replaceAll("{{PROJECT_NAME}}", projectName);
      fs.writeFileSync(destPath, content);
    }
  }
}
