# Guía de inicio

## Requisitos previos

- **Node.js** >= 18
- **pnpm** >= 10 ([instalar pnpm](https://pnpm.io/installation))
- **React** >= 19 y **React DOM** >= 19

## Instalación

### Setup recomendado (Vite + React)

1. Elegí el registro. Los paquetes se publican en los dos desde el mismo commit,
   con la misma API. Lo que cambia es de dónde salen y cómo se importa el CSS.

   Desde [JSR](https://jsr.io/@calumet), que no pide token:

   ```bash
   pnpm add jsr:@calumet/elise-ui jsr:@calumet/elise-icons
   ```

   Desde GitHub Packages, que pide un `.npmrc` con el scope apuntado y un token
   con permiso `read:packages`:

   ```
   @calumet:registry=https://npm.pkg.github.com
   ```

   ```bash
   pnpm add @calumet/elise-ui @calumet/elise-icons
   ```

   El resto de los paquetes son opcionales, y llevan el mismo prefijo `jsr:` o
   ninguno según el registro que hayas elegido:

   ```bash
   pnpm add @calumet/elise-forms     # useZodForm (RHF + Zod)
   pnpm add @calumet/elise-tables    # DataTable (TanStack)
   pnpm add @calumet/elise-toasts    # Sistema de toasts
   pnpm add @calumet/elise-alerts    # Sistema de alertas modales
   pnpm add @calumet/elise-i18n      # Formateo localizado (Intl)
   ```

2. **Instalando desde JSR, agregá lo que piden las hojas de estilo.** JSR arma
   la lista de dependencias recorriendo los imports del código, y las de un
   `.css` no aparecen ahí, así que no las declara y hay que ponerlas a mano.
   Desde GitHub Packages esto no hace falta: son dependencias del paquete y se
   instalan solas.

   ```bash
   pnpm add -D tw-animate-css                    # lo pide elise.css
   pnpm add -D @fontsource-variable/geist \
               @fontsource-variable/jetbrains-mono \
               @fontsource-variable/source-serif-4   # los pide fonts.css
   ```

   Sin `tw-animate-css` el build corta con
   `Can't resolve 'tw-animate-css'`. Las tres fuentes solo hacen falta si
   importás `fonts.css`.

3. Instala Tailwind CSS v4 y su plugin oficial para Vite:

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

4. Configura `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

> Con Vite no necesitas `postcss` ni `@tailwindcss/postcss`.

5. En tu CSS principal (por ejemplo `src/index.css`), importa Tailwind y los
   estilos de Elise. **Las rutas cambian según el registro.**

Desde GitHub Packages las hojas tienen subpath propio:

```css
/* Tipografias autoalojadas (Geist, JetBrains Mono, Source Serif 4).
   Va primero, antes de Tailwind. */
@import "@calumet/elise-ui/tailwind/fonts.css";

@import "tailwindcss";
@import "@calumet/elise-ui/tailwind/elise.css";

/* Permite que Tailwind detecte las clases usadas en los paquetes */
@source "../node_modules/@calumet/elise-ui/dist";
/* Solo incluye los que uses */
@source "../node_modules/@calumet/elise-tables/dist";
@source "../node_modules/@calumet/elise-toasts/dist";
@source "../node_modules/@calumet/elise-alerts/dist";
```

Desde JSR no, porque JSR todavía no deja exportar archivos que no sean
JavaScript o TypeScript ([jsr-io/jsr#293](https://github.com/jsr-io/jsr/issues/293)).
Las hojas viajan igual dentro del paquete y se importan por su ruta:

```css
@import "../node_modules/@calumet/elise-ui/src/tailwind/fonts.css";

@import "tailwindcss";
@import "../node_modules/@calumet/elise-ui/src/tailwind/elise.css";

@source "../node_modules/@calumet/elise-ui/jsr";
/* Solo incluye los que uses */
@source "../node_modules/@calumet/elise-tables/jsr";
@source "../node_modules/@calumet/elise-toasts/jsr";
@source "../node_modules/@calumet/elise-alerts/jsr";
```

Las dos carpetas son distintas a propósito:

| Ruta   | Qué hay                      | Quién la usa                     |
| ------ | ---------------------------- | -------------------------------- |
| `src`  | Las hojas de estilo          | El `@import` de Tailwind         |
| `jsr`  | El código ya compilado       | El `@source`, para hallar clases |
| `dist` | El bundle de GitHub Packages | El `@source` en esa vía          |

Apuntar el `@source` a `src` instalando desde JSR deja la app sin estilos: ahí
solo están los `.css`, y las clases que Tailwind tiene que encontrar están en
`jsr`.

> **No te saltees `fonts.css`.** Sin el, `--font-sans` cae en la fuente del
> sistema y tu app se ve distinta en macOS, Windows y Linux. Las tres familias
> vienen incluidas en `@calumet/elise-ui` como fuentes variables: un archivo por
> familia cubre todo el rango de pesos.
>
> Es un import aparte para que puedas omitirlo si tu app ya carga Geist por su
> cuenta (por ejemplo con `geist/font` en Next.js) y no quieras descargarla dos
> veces. Los tokens `--font-*` resuelven igual en ese caso: listan tanto
> `"Geist Variable"` (el nombre que registra Fontsource) como `"Geist"`.

6. **No dejes que el CSS de la plantilla pise al sistema.** El `src/index.css`
   que trae Vite estiliza `#root` con un ancho fijo, `text-align: center` y un
   `border-inline`, y eso le pone un límite horizontal al `AppShell`, centra los
   menús de la barra y dibuja bordes que no cuadran con nada. `elise.css` ya se
   encarga de la caja, el fondo, el color, la tipografía y las barras de
   desplazamiento, así que lo único que tu hoja necesita es `body { margin: 0 }`.

7. Verifica que tu app levanta correctamente:

```bash
pnpm dev
```

### Referencias oficiales de Tailwind

- Documentación general: https://tailwindcss.com/docs
- Guía de instalación: https://tailwindcss.com/docs/installation
- Integración con Vite: https://tailwindcss.com/docs/installation/framework-guides/vite

> Si Tailwind cambia algún paso en nuevas versiones, toma como fuente de verdad su documentación oficial.

### Desarrollo del monorepo Elise

```bash
git clone https://github.com/calumet/elise.git
cd elise
pnpm install
pnpm dev:showcase  # Levanta todos los paquetes + app demo en localhost:5173
```

## Configurar el ThemeProvider

Envuelve tu aplicación con `ThemeProvider` para habilitar el sistema de temas:

```tsx
import { ThemeProvider } from "@calumet/elise-ui";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="mi-app-theme">
      {/* Tu aplicacion */}
    </ThemeProvider>
  );
}
```

### Props del ThemeProvider

| Prop           | Tipo                      | Default         | Descripción                                         |
| -------------- | ------------------------- | --------------- | --------------------------------------------------- |
| `attribute`    | `"class" \| "data-theme"` | `"class"`       | Método para aplicar el tema al DOM                  |
| `storageKey`   | `string`                  | `"elise-theme"` | Clave de localStorage para persistir la preferencia |
| `defaultTheme` | `"light" \| "dark"`       | `"light"`       | Tema inicial si no hay preferencia guardada         |
| `forcedTheme`  | `"light" \| "dark"`       | —               | Fuerza un tema ignorando la preferencia del usuario |

## Tu primer componente

```tsx
import { ThemeProvider } from "@calumet/elise-ui";
import { Button } from "@calumet/elise-ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@calumet/elise-ui/card";

function App() {
  return (
    <ThemeProvider>
      <Card className="w-80 mx-auto mt-10">
        <CardHeader>
          <CardTitle>Bienvenido a Elise</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="solid" size="md">
            Empezar
          </Button>
          <Button variant="outline" size="md" className="ml-2">
            Documentacion
          </Button>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
```

## Estructura de imports

Elise soporta dos estilos de importación:

```tsx
// Import directo por componente (recomendado)
import { Button } from "@calumet/elise-ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@calumet/elise-ui/dialog";

// Import desde el barrel principal
import { Button, Dialog, DialogContent } from "@calumet/elise-ui";
```

Para utilidades, usa los sub-módulos:

```tsx
import { useZodForm, z } from "@calumet/elise-forms";
import { toast, Toaster } from "@calumet/elise-toasts";
import { openAlert, AlertHost } from "@calumet/elise-alerts";
import { DataTable } from "@calumet/elise-tables";
import { formatDate, useDateRange } from "@calumet/elise-i18n/dates";
```

Para iconos:

```tsx
import { Search, ChevronDown } from "@calumet/elise-icons";
```

> Los iconos disponibles son los de [Lucide](https://lucide.dev/icons/). Consulta su galería para ver todos los iconos disponibles.

## Linter y formato

Para configurar ESLint/Prettier con los presets de Elise, consulta [Linter y formato](linter.md).

---

Siguiente: [Arquitectura](arquitectura.md) | [Linter y formato](linter.md) | [Componentes](componentes.md) | [Utilidades](utilidades.md)
