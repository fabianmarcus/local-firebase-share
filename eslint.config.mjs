import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", ".github/**", ".vscode/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
  },
  {
    files: ["packages/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["react", "react/*", "react-dom", "react-dom/*", "@angular/*", "**/packages/react/**"],
        },
      ],
    },
  },
  {
    files: ["packages/react/**/*.ts", "packages/react/**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@fabianmarcus/local-firebase-share/*", "**/core/**", "@angular/*"],
        },
      ],
    },
  },
);
