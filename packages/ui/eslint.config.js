import { configs } from "@calumet/elise-linter";

export default [
  ...configs.tailwind,
  {
    files: ["**/*.tsx"],
    rules: { "react/no-multi-comp": "off" },
  },
];
