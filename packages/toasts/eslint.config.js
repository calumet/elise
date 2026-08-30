import { configs } from "@calumet/elise-linter";

export default [
  ...configs.react,
  {
    files: ["**/*.tsx"],
    rules: { "react/no-multi-comp": "off" },
  },
];
