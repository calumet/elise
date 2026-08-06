# @calumet/elise-icons

Reexporta los iconos de [Lucide](https://lucide.dev) sin envolverlos ni renombrarlos.

Existe para que el resto de los paquetes dependa de un solo nombre. El día que cambiemos de familia de iconos se toca este paquete y no los ochenta lugares que los usan.

## Instalación

```bash
pnpm add jsr:@calumet/elise-icons     # JSR
pnpm add @calumet/elise-icons         # GitHub Packages
```

La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

## Uso

Los nombres son los de Lucide, así que su catálogo sirve como referencia directa:

```tsx
import { ChevronDown, Trash2 } from "@calumet/elise-icons";

<ChevronDown size={16} />;
```
