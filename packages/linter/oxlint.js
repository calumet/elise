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
  plugins: [...base.plugins, "react", "jsx-a11y"],
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

    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/aria-activedescendant-has-tabindex": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/autocomplete-valid": "error",
    "jsx-a11y/control-has-associated-label": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/html-has-lang": "error",
    "jsx-a11y/iframe-has-title": "error",
    "jsx-a11y/img-redundant-alt": "error",
    "jsx-a11y/interactive-supports-focus": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/lang": "error",
    "jsx-a11y/media-has-caption": "error",
    "jsx-a11y/mouse-events-have-key-events": "error",
    "jsx-a11y/no-access-key": "error",
    "jsx-a11y/no-aria-hidden-on-focusable": "error",
    "jsx-a11y/no-distracting-elements": "error",
    "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
    "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
    "jsx-a11y/no-redundant-roles": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/scope": "error",
    "jsx-a11y/tabindex-no-positive": "error",
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

const DENY = ["max-w-*", "opacity-*"];

const DENY_MESSAGE = {
  layout: "A screen's width belongs to `Container` and its `size`. See docs/reglas-ui.md § 2.",
  effects:
    "Effects belong to the component. To dim, `opacity` invents a value that does not follow " +
    'the theme: the surface already declares its own text pair, so use `tone="muted"`. ' +
    "See docs/reglas-ui.md § 3.",
};

const CONTRACTS = [
  {
    pattern: "^(Card|Box|Section|Panel)$|(Content|Header|Footer|Body|Group|List)$",
    allow: ["layout", "spacing"],
  },
  { pattern: "^Container$", allow: ["layout", "spacing"], deny: ["opacity-*"] },
  {
    pattern: "^(Card|Table|DataTable)$",
    allow: ["layout", "spacing"],
    deny: [...DENY, "border-*", "rounded-*", "shadow-*"],
    message: {
      ...DENY_MESSAGE,
      shape: "A frame's outline comes from `SURFACE`. See docs/reglas-ui.md § 2.",
      // `shadow-*` cae en `effects`, igual que `opacity-*`.
      effects: "A frame's outline comes from `SURFACE`. See docs/reglas-ui.md § 2.",
    },
  },
  {
    pattern: "^(Text|Heading|CardTitle|CardDescription|DialogTitle|DialogDescription)$",
    allow: ["layout", "typography"],
  },
  { pattern: "^(Avatar|Thumbnail|Spinner|Skeleton)$", allow: ["layout", "size-*"] },
  {
    pattern: "^Button$",
    allow: ["layout"],
    deny: [...DENY, "w-*"],
    message: {
      ...DENY_MESSAGE,
      spacing: "Use a {{component}} `size`: {{sizes|sm, md, lg, xl, icon, icon-sm}}.",
      default: "Use a {{component}} `variant` or `tone`.",
    },
  },
];

export const designSystem = ({ severity = "error", contracts = [], rules, settings } = {}) => ({
  jsPlugins: ["@shadcn/lint"],
  settings: {
    shadcn: {
      componentImports: ["^@calumet/elise-(ui|tables|alerts|toasts)(/|$)"],
      ...settings,
    },
  },
  rules: {
    "shadcn/no-restyle": [
      severity,
      {
        allow: ["layout"],
        deny: DENY,
        message: DENY_MESSAGE,
        contracts: [...CONTRACTS, ...contracts],
      },
    ],
    "shadcn/no-raw-colors": severity,
    "shadcn/no-inline-styles": severity,
    "shadcn/require-static-classes": severity,
    // Exentas las familias sin escala en el tema, y la tipografía fluida.
    "shadcn/no-arbitrary-values": [
      severity,
      {
        allow: ["tracking-*", "leading-*", "backdrop-blur-*", "min-h-*", "text-[clamp(*"],
      },
    ],
    // `no-unknown-classes` la da `tailwind()`.
    ...rules,
  },
});

export const elise = ({ theme, designSystem: dsOptions, rules, ...rest } = {}) => {
  const parts = [
    theme ? tailwind(theme) : null,
    dsOptions === false ? null : designSystem(dsOptions),
  ].filter(Boolean);

  return {
    plugins: react.plugins,
    categories: react.categories,
    env: react.env,
    jsPlugins: parts.flatMap((p) => p.jsPlugins),
    settings: Object.assign({}, ...parts.map((p) => p.settings)),
    rules: Object.assign({}, react.rules, ...parts.map((p) => p.rules), rules),
    ...rest,
  };
};
