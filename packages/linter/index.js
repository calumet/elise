import { createRequire } from "node:module";

import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const require = createRequire(import.meta.url);

const loadBetterTailwindcssPlugin = () => {
  try {
    const plugin = require("eslint-plugin-better-tailwindcss");
    return plugin.default ?? plugin;
  } catch {
    throw new Error(
      "Tailwind preset requires 'eslint-plugin-better-tailwindcss' and 'tailwindcss'. " +
        "Install them with: pnpm add -D eslint-plugin-better-tailwindcss tailwindcss",
    );
  }
};

/**
 * Base config for TypeScript projects
 */
const base = [
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "writable",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      import: importPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/newline-after-import": ["warn", { count: 1 }],
      "import/no-unresolved": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  eslintConfigPrettier,
];

/**
 * React config extends base with React-specific rules
 */
const react = [
  ...base,
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      import: importPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/newline-after-import": ["warn", { count: 1 }],
      "import/no-unresolved": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];

/**
 * Tailwind config extends React with Tailwind-specific rules
 */
const createTailwindConfig = () => {
  const betterTailwindcssPlugin = loadBetterTailwindcssPlugin();
  return [
    ...react,
    {
      files: ["**/*.{jsx,tsx}"],
      plugins: {
        "@typescript-eslint": typescriptPlugin,
        import: importPlugin,
        react: reactPlugin,
        "react-hooks": reactHooksPlugin,
        "better-tailwindcss": betterTailwindcssPlugin,
      },
      settings: {
        react: { version: "detect" },
        tailwindcss: {
          callees: ["cn", "clsx", "cva", "tw"],
          config: "tailwind.config.cjs",
        },
      },
      rules: {
        ...typescriptPlugin.configs.recommended.rules,
        ...reactPlugin.configs.recommended.rules,
        ...reactHooksPlugin.configs.recommended.rules,
        "import/order": [
          "warn",
          {
            groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
            "newlines-between": "always",
            alphabetize: { order: "asc", caseInsensitive: true },
          },
        ],
        "import/newline-after-import": ["warn", { count: 1 }],
        "import/no-unresolved": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "better-tailwindcss/enforce-consistent-class-order": "warn",
        "better-tailwindcss/no-unregistered-classes": "warn",
        "better-tailwindcss/no-conflicting-classes": "warn",
        "better-tailwindcss/no-duplicate-classes": "warn",
      },
    },
  ];
};

export const configs = {
  base,
  react,
  get tailwind() {
    return createTailwindConfig();
  },
};
