import { configs } from "@calumet/elise-linter";

export default [
  ...configs.base,
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.turbo/**", "**/build/**", "**/.next/**"],
  },
];
