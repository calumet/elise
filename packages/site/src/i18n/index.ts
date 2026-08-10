import { buildMessages } from "@calumet/elise-i18n";

/** Cada `<locale>.ts` de esta carpeta entra solo al diccionario del provider. */
const modules = import.meta.glob<{ default: unknown }>(["./*.ts", "!./index.ts"], {
  eager: true,
});

export const messages = buildMessages(modules);
