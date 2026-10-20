# @calumet/elise-blocks

Bloques compuestos de Elise: piezas que arman una tarea reutilizable sobre los
primitivos de `@calumet/elise-ui`, sin conocer el dominio de ninguna app.

```tsx
import { SortableTree } from "@calumet/elise-blocks/sortable";
import { ChecklistPicker } from "@calumet/elise-blocks/checklist-picker";
```

Un bloque compone dos o más primitivos, aporta una interacción o un estado
opinado y se reutiliza tal cual en varias pantallas. No hace fetch, no conoce
rutas ni nombra entidades del negocio: los datos entran por props genéricas
(`items`, `options`, `selected`, `onMove`, `onToggle`) y las decisiones de
dominio quedan en la app que lo usa.

El criterio completo para decidir si algo va aquí, en `elise-ui` o en la app
está en [Bloques](../../docs/bloques.md).
