# Bloques: `@calumet/elise-blocks`

La tercera capa de Elise. Entre el primitivo suelto de `elise-ui` y la pantalla
de cada app hay piezas que ya traen una tarea armada: elegir entre muchas
opciones con buscador y pestañas, reordenar un árbol arrastrando. Eso vive aquí.

```tsx
import { ChecklistPicker } from "@calumet/elise-blocks/checklist-picker";
import { SortableTree } from "@calumet/elise-blocks/sortable-tree";
import { SortableList } from "@calumet/elise-ui/sortable";
```

## El criterio

Una pieza va a `elise-blocks` si cumple las cinco:

1. **Compone dos o más primitivos** de `elise-ui` y les aporta la interacción
   que los une: filtrar, ordenar, arrastrar, seleccionar en lote.
2. **Trae un flujo cerrado y opinado.** No se recompone por partes para cada
   pantalla; se usa tal cual, como mucho con un envoltorio encima.
3. **Es agnóstica de dominio.** No nombra ninguna entidad del negocio de la
   app que la usa. Si el nombre de la pieza o de una prop solo tiene sentido
   dentro de una app, no es un bloque.
4. **No conoce el mundo exterior.** Sin fetch, sin router, sin guardado. Los
   datos entran por props genéricas (`items`, `options`, `selected`) y salen
   por callbacks (`onMove`, `onToggle`, `onReorder`).
5. **Es una tarea general, no el caso de una pantalla.** Se puede describir
   y ejemplificar con datos genéricos, sin nombrar el producto ni el negocio
   de quien la usa, y alguien fuera de ese contexto reconoce la tarea:
   elegir entre muchas opciones, reordenar una jerarquía. Que una app ya la
   necesite dos veces es una señal a favor, no un requisito: este paquete no
   depende de la historia de ningún consumidor.

Y se queda fuera si es otra cosa:

| Capa               | Qué es                                                                    | Prueba rápida                                                    |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `elise-ui`         | Primitivo: una responsabilidad, componible por partes, sin flujo de tarea | ¿Otra pantalla podría componerlo distinto? Entonces es primitivo |
| `elise-blocks`     | Bloque: tarea reutilizable ya armada sobre primitivos                     | ¿Se usa tal cual en dos pantallas y no conoce el dominio?        |
| La app consumidora | Dominio: entidades, rutas, APIs, textos del negocio                       | ¿Nombra una entidad del negocio o hace fetch? Se queda en la app |

Dos consecuencias deliberadas:

- **Un envoltorio de dominio no es un bloque, es app.** Un envoltorio que
  mapea entidades del negocio a opciones y pestañas, y traduce los textos,
  se queda en la app y consume `ChecklistPicker` por debajo.
- **La capa de campo no convierte a un control en bloque.** `ComboboxField`,
  `FileUpload` o `DateField` componen varias piezas, pero son un control de
  formulario con su `Field`, su error y su valor: una responsabilidad. Se
  quedan en `elise-ui`.

## Catálogo inicial

| Bloque            | Import                                   | Qué arma                                                           |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `SortableTree`    | `@calumet/elise-blocks/sortable-tree`    | Reordenar una jerarquía arrastrando: reordenar y re-anidar         |
| `ChecklistPicker` | `@calumet/elise-blocks/checklist-picker` | Elegir con casillas entre muchas opciones, con buscador y pestañas |

`SortableTree` vivía en `@calumet/elise-ui/sortable` hasta `elise-ui` 0.43.x.
En 0.44.0 sale de `elise-ui` sin re-export: el import nuevo es
`@calumet/elise-blocks/sortable-tree`. Es un corte limpio a propósito; mantener el
import viejo obligaría a `elise-ui` a depender de `elise-blocks`, que es justo
la dirección contraria a la del grafo. La API no cambia.

`SortableList` no se mueve: se compone por partes (`SortableList`,
`SortableItem` y `SortableHandle`, que además entra en una tabla con
`asChild`), así que es una primitiva y se queda en `@calumet/elise-ui/sortable`.

`ChecklistPicker` nace aquí: opciones con
`id/label/description/filter`, pestañas con `value/label` (el vocabulario de
`Combobox`), búsqueda sin mayúsculas ni tildes ordenada con
`Intl.Collator(locale)`, y la selección (`selected`/`onToggle`) de quien lo
usa. Aplicar o cancelar es cosa del diálogo que lo contiene, y por eso no
trae pie ni botones.

## Qué se revisó y no se mueve

### De `elise-ui`

| Pieza                                       | Dónde se queda | Por qué                                                                                                                                                                                                              |
| ------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell` y sus partes                     | `elise-ui`     | Marco componible por partes, no una pantalla armada. Los patrones que lo usan serán bloques cuando existan                                                                                                           |
| `Tree`                                      | `elise-ui`     | Primitivo de árbol ARIA sin arrastre: una responsabilidad                                                                                                                                                            |
| `Combobox`/`MultiCombobox` con sus `*Field` | `elise-ui`     | Control de campo con envoltorio, como `DateField`                                                                                                                                                                    |
| `FileUpload`, `Stepper`, `Carousel`         | `elise-ui`     | Un control o una pieza de navegación cada uno; sin flujo de selección ni de ordenación encima                                                                                                                        |
| `DataTable`                                 | `elise-tables` | Ya es paquete propio por su dependencia de TanStack                                                                                                                                                                  |
| `SaveBar`                                   | `elise-ui`     | El borderline más serio: flujo cerrado (sucio, guardar, descartar con confirmación). Pero `AppShell` lo consume como `AppShellSaveBar`; moverlo solo crearía un ciclo `blocks ↔ ui`. Se mueve con el marco, no antes |
| `UserMenu`                                  | `elise-ui`     | Igual que `SaveBar`: `AppShellUserMenu` es este componente y `app-shell` lo importa                                                                                                                                  |
| `Sidebar`                                   | `elise-ui`     | Marco componible por partes, como `AppShell`: se recompone por pantalla, no trae un flujo cerrado                                                                                                                    |
| `Table`                                     | `elise-ui`     | Componible por columnas y celdas. La tabla con tarea cerrada (filtros, exportación) ya vive en `elise-tables`                                                                                                        |
| `Command`/`CommandDialog`, `NavigationMenu` | `elise-ui`     | Primitivos compuestos por partes, sin flujo de tarea encima                                                                                                                                                          |

Descartados por la capa de campo o por ser una sola responsabilidad, tras
revisar los 82 archivos del catálogo: `DatePicker`, `ValueField`,
`ColorPicker`, `TagInput`, `TimePicker`, `EmptyState`, `Stat`, `Timeline` y
`AvatarGroup`.

### De las apps consumidoras

No se inventarían piezas de apps consumidoras en este repositorio: lo que
una app tenga con dominio, rutas o llamadas a su API se queda en esa app.
Solo entra a este paquete la parte general que cumpla las cinco pruebas,
ya sin nombres de su negocio.

## Cómo entra un bloque nuevo

1. La tarea se describe en términos generales y se ejemplifica con datos
   genéricos. Si solo se puede explicar desde una pantalla concreta,
   todavía no es un bloque.
2. Se le quita el dominio: entidades fuera, datos por props genéricas, textos
   por el namespace `ui` de `elise-i18n` como el resto del catálogo.
3. Entra con un ejemplo ejecutable con datos genéricos y su fila en la
   tabla de arriba.
