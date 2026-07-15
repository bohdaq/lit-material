import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import litPlugin from "eslint-plugin-lit";
import wcPlugin from "eslint-plugin-wc";
import chaiFriendly from "eslint-plugin-chai-friendly";
import globals from "globals";

export default defineConfig([
  globalIgnores(["**/dist/**", "**/node_modules/**", "**/*.d.ts", "**/.turbo/**"]),
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommended, litPlugin.configs["flat/recommended"], wcPlugin.configs["flat/recommended"]],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Not type-aware (no `parserOptions.project`) on purpose: `turbo run typecheck` already runs the real
      // compiler with full strictness across every package; wiring 31+ tsconfig project references into one
      // lint pass would mean keeping two overlapping sources of type information in sync for no real benefit.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    // `@open-wc/testing`'s chai assertions (`expect(x).to.be.true`, `.to.exist`, ...) are property-access
    // expression statements as far as the parser is concerned — chai's side effects happen inside getters, which
    // neither ESLint's core rule nor the typescript-eslint one know about, so they'd otherwise all get flagged as
    // "unused expressions". `chai-friendly`'s version of the rule specifically carves out that pattern.
    files: ["**/*.test.ts"],
    plugins: { "chai-friendly": chaiFriendly },
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "chai-friendly/no-unused-expressions": "error",
    },
  },
]);
