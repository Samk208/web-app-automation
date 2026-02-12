import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Production overrides: downgrade legacy patterns to warnings so CI
  // catches real errors while giving the team time to fix these gradually.
  {
    rules: {
      // 200+ pre-existing 'any' usages — warn, don't block PRs
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused vars are warnings (auto-fixable during refactor)
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      // Pre-existing unescaped entities in JSX (cosmetic, low-risk)
      "react/no-unescaped-entities": "warn",
      // Pre-existing empty interface pattern
      "@typescript-eslint/no-empty-object-type": "warn",
      // Pre-existing React patterns that need careful refactoring
      // TODO: Fix these and re-enable as errors
      "react-hooks/set-state-in-effect": "warn",
      // Allow @ts-nocheck for orchestrator file (LangGraph type compat)
      // TODO: Remove once LangGraph types are fixed
      "@typescript-eslint/ban-ts-comment": ["warn", {
        "ts-nocheck": "allow-with-description",
        "ts-expect-error": "allow-with-description",
        "minimumDescriptionLength": 10,
      }],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Project ignores: utility scripts, migrations, docs
    "scripts/**",
    "db/**",
    "supabase/**",
    "docs/**",
    "*.config.*",
    // Root-level utility scripts (CommonJS)
    "check_*.js",
    "test_*.ts",
  ]),
]);

export default eslintConfig;
