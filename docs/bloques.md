# Bloques

`@calumet/elise-blocks` es la tercera capa: pantallas armadas sobre el catálogo
de `@calumet/elise-ui`.

Un bloque no trae componentes nuevos. Arma los que ya hay en la disposición que
se repite de una pantalla a otra, para que cada aplicación no la vuelva a
inventar y no acabe con dos cabeceras de pantalla que miden distinto.

`AppShell` no vive acá aunque sea el marco de una aplicación: es un componente
con estado y partes componibles, no una pantalla armada.

```tsx
import { Page } from "@calumet/elise-blocks/page";
import { Page, Wizard } from "@calumet/elise-blocks";
```

## Page

La pantalla: cabecera, contenido y, si hace falta, una columna de apoyo.

No es el `<main>`, que ese lo pone el marco de la aplicación. Es lo que va
dentro, así que también se monta sola en una pantalla sin marco.

| Prop                  | Qué hace                                                             |
| --------------------- | -------------------------------------------------------------------- |
| `heading`             | El título. Es el `<h1>` de la pantalla                               |
| `subtitle`            | Una línea que explica de qué va                                      |
| `headingMetadata`     | Estado al lado del título, normalmente un `Badge`                    |
| `headingAs`           | `h1` por defecto. Se baja a `h2` cuando la pantalla va empotrada     |
| `headingHidden`       | Esconde el título a la vista sin quitarlo del árbol de accesibilidad |
| `backAction`          | La vuelta al listado del que se llegó. Un enlace, no un botón        |
| `primaryAction`       | La acción de la pantalla. Una, y sólida                              |
| `secondaryActions`    | Lo que la acompaña                                                   |
| `aside`, `asideLabel` | Columna de apoyo de 320px. Por debajo de 1024px se apila             |
| `size`                | El ancho, de `Container`. La pantalla no inventa el suyo             |

`PageHeader` es la cabecera sola, para una pantalla que ya trae su propio marco.

Los anchos salen de `Container` a propósito. Un bloque que declarara los suyos
sería un segundo juego de anchos en el sistema, y a la segunda pantalla ya no
coincidirían.

## TablePage

La pantalla de listado: cabecera, filtros, tabla y su estado vacío. Las filas
van como hijos, no como datos: quien la usa ya tiene su tabla armada.

Lo que decide el bloque son los dos carteles de vacío:

| Prop                 | Cuándo se ve                                                   |
| -------------------- | -------------------------------------------------------------- |
| `emptyState`         | No hay nada todavía. Lleva la acción que crea lo primero       |
| `filteredEmptyState` | Hay filtros puestos y no devuelven nada. Lleva la de quitarlos |

Son dos y no uno porque son dos situaciones con dos salidas: una se resuelve
creando algo y la otra quitando un filtro. Con un solo cartel, quien filtró se
queda creyendo que se le borraron los datos.

El cartel lo pinta `Table` y no la pantalla, porque el marco es suyo: puesto por
fuera, el aviso diría «no hay resultados» mientras el filtro que los esconde
queda dentro del marco y sin explicación. Con el cartel puesto no se dibuja la
franja de paginar, que sin filas no hay páginas.

Lo que va a la tabla se pasa en `table`, un objeto con lo que `Table` acepta.
Repetir ahí su lista de props haría que se quedara vieja en cuanto la tabla
ganara algo.

## Wizard

Asistente por pasos: el indicador arriba, el paso puesto en medio y la
navegación al pie.

| Prop                       | Qué hace                                                |
| -------------------------- | ------------------------------------------------------- |
| `steps`                    | `{ id, title, description?, content?, status? }`        |
| `step` / `defaultStep`     | Controlado o no, por `id`                               |
| `onStepChange`, `onFinish` | Cambio de paso y último botón                           |
| `canContinue`              | Apaga el botón de seguir mientras el paso no esté       |
| `busy`                     | Hay algo en curso: los botones esperan                  |
| `footer`                   | Lo que va entre los botones, del tipo «guardar y salir» |

El estado de cada paso se deduce de dónde está el puesto, que es lo correcto en
un flujo que va en orden. `Stepper` no lo deduce a propósito, porque un flujo
real salta pasos y vuelve atrás; un asistente que haga eso lo dice con el
`status` de cada paso, que gana sobre lo deducido.

Solo monta el paso puesto. Los datos del formulario viven en quien lo usa, así
que mantener los otros montados solo serviría para que el asistente se quedara
con estado que no es suyo.

## SettingsSection y SettingsGroup

Un grupo de ajustes: a la izquierda de qué va, a la derecha los controles. Por
debajo de 1024px se apila.

La explicación va fuera de la tarjeta a propósito. Metida dentro compite con los
rótulos de los propios campos y se lee como uno más; fuera es lo que permite
recorrer una pantalla larga de ajustes leyendo solo la columna izquierda.

`SettingsGroup` envuelve los grupos y pone el filete entre uno y otro. Lo pone
el contenedor y no cada grupo porque el filete separa dos: puesto por cada
grupo, el último deja una raya colgando debajo del final.

## AuthPage

Entrar, registrarse, recuperar la contraseña: una columna estrecha centrada, con
el formulario en una tarjeta.

Se centra en el alto de la ventana y no del contenido, así que la caja queda en
el mismo sitio con dos campos que con cinco. Usa `min-h-svh` y no `min-h-screen`
porque en un móvil la barra del navegador se come lo segundo y parte la caja por
abajo.

`bare` la deja sin tarjeta, para empotrarla donde ya haya una.

## ErrorPage

Lo que se ve cuando algo no está o falló: 404, 403, 500, o una zona que no cargó.

Es un `role="alert"` porque el usuario no pidió esto: iba a otra cosa y se
encontró con un error, así que un lector de pantalla tiene que anunciarlo sin
esperar a que alguien lo recorra.

El código va arriba y pequeño, no como número gigante: lo que necesita quien
llegó ahí es saber qué hacer, y el código es dato para el que después abra un
ticket. `full={false}` lo baja de la ventana entera a una zona de la pantalla.
