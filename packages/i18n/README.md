# @calumet/elise-i18n

Traducciones y formateo localizado para las apps de Calumet. El formateo se apoya en `Intl`, así que no suma ninguna dependencia.

## Instalación

```bash
pnpm add jsr:@calumet/elise-i18n      # JSR
pnpm add @calumet/elise-i18n          # GitHub Packages
```

Requiere React 19. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

## Entrypoints

| Import                        | Qué trae                                                 |
| ----------------------------- | -------------------------------------------------------- |
| `@calumet/elise-i18n`         | Provider, hooks y, reexportado, todo lo de los otros dos |
| `@calumet/elise-i18n/dates`   | `formatDate`, `formatDateRange`, `useDateRange`          |
| `@calumet/elise-i18n/numbers` | `formatNumber`, `formatCurrency`, `formatPercent`        |

## Uso

Los mensajes se organizan por locale, namespace y key. `buildMessages` los arma desde un glob de Vite, y `buildLazyLoader` hace lo mismo cargándolos bajo demanda.

```tsx
import { I18nProvider, useTranslation, buildMessages } from "@calumet/elise-i18n";

const messages = buildMessages(import.meta.glob("./locales/*/*.json", { eager: true }));

<I18nProvider messages={messages} defaultLocale="es" fallbackLocale="en">
  <App />
</I18nProvider>;

const { t } = useTranslation("checkout");
t("total", { monto: 1200 });
```

Pasar `locale` convierte al provider en controlado y `onLocaleChange` avisa del cambio. Sin ese prop, el locale lo maneja el provider a partir de `defaultLocale`.

La guía completa, con la convención de archivos y el detalle de la interpolación, está en [docs/i18n.md](../../docs/i18n.md).
