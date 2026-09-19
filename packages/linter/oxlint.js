// @ts-self-types="./oxlint.d.ts"

export const base = {
  plugins: ["typescript", "import"],
  categories: {
    correctness: "off",
  },
  env: {
    builtin: true,
  },
  rules: {
    "no-array-constructor": "error",
    "no-unused-expressions": "error",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "import/newline-after-import": ["warn", { count: 1 }],
    "typescript/ban-ts-comment": "error",
    "typescript/no-duplicate-enum-values": "error",
    "typescript/no-empty-object-type": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-extra-non-null-assertion": "error",
    "typescript/no-misused-new": "error",
    "typescript/no-namespace": "error",
    "typescript/no-non-null-asserted-optional-chain": "error",
    "typescript/no-require-imports": "error",
    "typescript/no-this-alias": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-unsafe-declaration-merging": "error",
    "typescript/no-unsafe-function-type": "error",
    "typescript/no-wrapper-object-types": "error",
    "typescript/prefer-as-const": "error",
    "typescript/prefer-namespace-keyword": "error",
    "typescript/triple-slash-reference": "error",
    "typescript/explicit-module-boundary-types": "off",
  },
};

export const react = {
  plugins: [...base.plugins, "react"],
  categories: base.categories,
  env: base.env,
  rules: {
    ...base.rules,
    "react/react-in-jsx-scope": "off",
    "react/jsx-pascal-case": "error",
    "react/set-state-in-effect": "error",
    "react/refs": "error",
    "react/purity": "error",
    "react/rules-of-hooks": "error",
    "react/jsx-no-constructed-context-values": "error",
  },
};

export const tailwind = (entryPoint) => ({
  jsPlugins: ["oxlint-tailwindcss"],
  settings: { tailwindcss: { entryPoint } },
  rules: {
    // `.dark` la declara el tema como marcador, no la genera Tailwind.
    "tailwindcss/no-unknown-classes": ["error", { allowlist: ["dark"] }],
    "tailwindcss/no-conflicting-classes": "error",
    "tailwindcss/no-duplicate-classes": "error",
  },
});
