# @calumet/elise-ui

Design system de Calumet: 83 componentes de React construidos sobre primitivas de Radix y Tailwind CSS v4.

## Instalación

```bash
pnpm add jsr:@calumet/elise-ui        # JSR
pnpm add @calumet/elise-ui            # GitHub Packages
```

Requiere React 19. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

## Hojas de estilo

Los componentes no traen estilos propios, así que la app tiene que importar las dos hojas y decirle a Tailwind dónde buscar las clases:

```css
@import "@calumet/elise-ui/tailwind/fonts.css";
@import "tailwindcss";
@import "@calumet/elise-ui/tailwind/elise.css";

@source '../node_modules/@calumet/elise-ui/dist';
```

Instalando desde JSR esos subpaths no existen, porque JSR todavía no permite exportar archivos que no sean JavaScript o TypeScript ([jsr-io/jsr#293](https://github.com/jsr-io/jsr/issues/293)). Los `.css` viajan igual dentro del paquete y se importan por su ruta:

```css
@import "../node_modules/@calumet/elise-ui/src/tailwind/elise.css";
@source '../node_modules/@calumet/elise-ui/src';
```

## Uso

```tsx
import { Button, Card, CardContent } from "@calumet/elise-ui";

<Card>
  <CardContent>
    <Button variant="solid" tone="success" loading={enviando}>
      Guardar
    </Button>
  </CardContent>
</Card>;
```

Cada componente tiene además su propio subpath, por si preferís importar de a uno: `@calumet/elise-ui/button`.

## Temas

`ThemeProvider` alterna entre claro y oscuro. Según su prop `attribute` usa la clase `.elise-dark` o `data-theme="dark"`, y guarda la preferencia en `localStorage`. `useTheme` devuelve `theme` y `setTheme`.

Los colores salen de `elise.css`. Para reemplazarlos, `applyTheme` escribe cualquier `EliseTheme` como variables CSS sobre un elemento, y `defaultLightTheme` con `defaultDarkTheme` son los dos temas ya armados.

## Convenciones

Las reglas de composición, foco, tamaños y accesibilidad que siguen los componentes están en [docs/reglas-ui.md](../../docs/reglas-ui.md) y en [CONTRIBUTING.md](../../CONTRIBUTING.md#convención-de-componentes-en-elise-ui).
