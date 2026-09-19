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

/* Qué acepta cada componente por encima de `layout`. Un contrato reemplaza las
   claves que escribe y hereda el resto, y si varios encajan gana el último. */
const CONTRACTS = [
  // Los contenedores reparten el espacio de la página, así que su padding y su
  // gap son de quien los coloca.
  {
    pattern: "^(Card|Box|Container|Section|Panel)$|(Content|Header|Footer|Body|Group|List)$",
    allow: ["layout", "spacing"],
  },
  // El texto se compone: quien lo usa elige el tamaño y el peso.
  {
    pattern: "^(Text|Heading|CardTitle|CardDescription|DialogTitle|DialogDescription)$",
    allow: ["layout", "typography"],
  },
  // Las piezas de tamaño fijo solo admiten que se las redimensione.
  { pattern: "^(Avatar|Thumbnail|Spinner|Skeleton)$", allow: ["layout", "size-*"] },
  // El ancho de un botón lo decide la caja que lo contiene, no él.
  {
    pattern: "^Button$",
    allow: ["layout"],
    deny: ["w-*"],
    message: {
      layout: "El ancho de un botón lo pone su contenedor.",
      spacing: "Usá un `size` de {{component}}: {{sizes|sm, md, lg, xl, icon, icon-sm}}.",
      default: "Usá una `variant` o un `tone` de {{component}}.",
    },
  },
];

/**
 * Reglas de uso del design system, para quien consume Elise.
 *
 * No va en `extends`: Oxlint no hereda `settings` por ahí, igual que con
 * {@link tailwind}.
 */
export const shadcn = ({ severity = "error", contracts = [], rules, settings } = {}) => ({
  jsPlugins: ["@shadcn/lint"],
  settings: {
    shadcn: {
      componentImports: ["^@calumet/elise-(ui|tables|alerts|toasts)(/|$)"],
      ...settings,
    },
  },
  /* `severity` y no un `"warn"` suelto en un `overrides`: bajar el nivel así
     reemplaza la regla entera y se lleva por delante los contratos. */
  rules: {
    "shadcn/no-restyle": [severity, { allow: ["layout"], contracts: [...CONTRACTS, ...contracts] }],
    "shadcn/no-raw-colors": severity,
    "shadcn/no-inline-styles": severity,
    "shadcn/require-static-classes": severity,
    // `no-unknown-classes` la da ya `tailwindcss/no-unknown-classes`, y
    // `no-arbitrary-values` choca con las medidas de maquetación de una
    // página, que no son deuda: se encienden pidiéndolas.
    ...rules,
  },
});
