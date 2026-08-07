# Reglas de interfaz

Estas reglas dicen qué componente resuelve cada trabajo y quién es dueño de
cada medida. Quien escribe una pantalla ya sabe cómo funciona un `Button`; lo
que se pregunta es cuál de los tres parecidos le toca.

Los componentes están en [Componentes](componentes.md). Las pantallas armadas
con ellos, en [Patrones de pantalla](patrones-pantalla.md) y
[Patrones de bloque](patrones-bloque.md).

## 1. Qué componente para qué trabajo

### 1.1. Algo que se pulsa

| Trabajo                                     | Componente    | Elemento                |
| ------------------------------------------- | ------------- | ----------------------- |
| Una acción con rótulo propio                | `Button`      | `<button>`              |
| Ir a otra pantalla desde dentro de un texto | `Link`        | `<a>`                   |
| Una caja entera que lleva a otra pantalla   | `Clickable`   | `<a>` (lleva `href`)    |
| Una caja entera que ejecuta algo            | `Clickable`   | `<button>` (sin `href`) |
| Varias acciones en fila                     | `ButtonGroup` | `<div role="group">`    |

`Clickable` decide su elemento por la presencia de `href`. La diferencia se ve
en el comportamiento del navegador, ya que un enlace se abre en otra pestaña
con el botón central y un botón no.

Poner `onClick` en un `Box` deja la caja fuera del tabulador y sin respuesta al
teclado. Envolverla en un `Button` obliga a deshacer relleno, borde y
tipografía. `Clickable` acepta las mismas propiedades visuales que `Box`.

### 1.2. Una etiqueta corta

| Trabajo                                                 | Componente |
| ------------------------------------------------------- | ---------- |
| Un estado que el sistema afirma, como «Pagado»          | `Badge`    |
| Un dato que alguien puso y puede quitar, como un filtro | `Chip`     |

`Badge` tiene tono semántico en seis valores. `Chip` no lo tiene, y su `color`
solo gradúa el peso en `subdued`, `base` y `strong`. Un filtro escrito por el
usuario teñido de rojo no significa nada.

### 1.3. Elegir entre opciones

| Cuántas se eligen | Cuántas hay                                 | Componente         |
| ----------------- | ------------------------------------------- | ------------------ |
| Una               | Dos a cinco                                 | `RadioGroup`       |
| Una               | Dos a cuatro, y son caras de la misma vista | `SegmentedControl` |
| Una               | Más de cinco                                | `Select`           |
| Una               | Más de veinte                               | `Combobox`         |
| Varias            | Cualquiera                                  | `CheckboxGroup`    |
| Varias            | Más de veinte                               | `MultiCombobox`    |

El rótulo, la ayuda y el error viven en el grupo y no en cada opción. Un error
como «elegí una forma de envío» no pertenece a ninguna respuesta en particular.

### 1.4. Contarle algo al usuario

| Cuándo aparece                               | Componente    | Dónde vive               |
| -------------------------------------------- | ------------- | ------------------------ |
| Al validar un campo                          | `InlineError` | Debajo del campo         |
| Al cargar la pantalla, y sigue mientras dure | `Alert`       | Dentro del contenido     |
| Después de una acción, y se va solo          | `toast`       | Encima de todo           |
| Antes de algo que destruye                   | `AlertDialog` | Interrumpe la pantalla   |
| No hay datos para mostrar                    | `EmptyState`  | En el hueco de los datos |

Un aviso que el usuario tiene que poder releer no va en un toast, porque el
toast se va solo.

### 1.5. Agrupar contenido

| Trabajo                                          | Componente |
| ------------------------------------------------ | ---------- |
| Un grupo con rótulo dentro de una pantalla larga | `Section`  |
| Una caja con cabecera, cuerpo y pie a medida     | `Card`     |

`Section` es el envoltorio opinado sobre `Card`. Escribir la tarjeta, su
cabecera y su título ocho veces en una pantalla de ajustes termina con uno de
los ocho en otro tamaño.

## 2. Quién es dueño de cada medida

Ninguna pantalla declara sus propios valores. Cuando un componente necesita una
medida, la toma de quien la posee.

| Medida                | Dueño               | Valores                                                                       |
| --------------------- | ------------------- | ----------------------------------------------------------------------------- |
| Ancho de una pantalla | `Container`         | `sm` 672, `md` 896, `lg` 1152, `xl` 1280, `full`                              |
| Contorno de un marco  | `SUPERFICIE`        | Lo comparten `Card`, `Table` y `DataTable`                                    |
| Espaciado             | `Box` y los `Stack` | 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16                                            |
| Tamaño de texto       | `Text`              | 11, 12, 13, 14, 16, 20, 24, 30 px                                             |
| Tamaño de icono       | La escala del tema  | 12, 14, 16, 20, 24 px                                                         |
| Radio                 | La escala del tema  | 0, 2, 4, 5, 6, 8, 10, 12, 16 px                                               |
| Capa de apilado       | Los tokens `z-*`    | `sticky` 10, `overlay` 40, `modal` 50, `popover` 60, `tooltip` 70, `toast` 80 |

La [auditoría visual](auditoria-visual.md) comprueba las cuatro últimas sobre
el DOM ya renderizado y falla si aparece un valor fuera de escala.

`popover` va por encima de `modal` porque un `Select` se abre desde dentro de un
diálogo.

## 3. Lo que el sistema ya resuelve

Estas cosas están hechas dentro de los componentes. Rehacerlas por fuera
produce el defecto que ya evitan.

| Qué                                        | Quién lo hace                                    |
| ------------------------------------------ | ------------------------------------------------ |
| Enlazar rótulo, ayuda y error a un control | `Field`, y los campos que traen su capa de campo |
| Anillo de foco                             | Todos los componentes con `focus-visible`        |
| `rel` al abrir en otra pestaña             | `Link` cuando recibe `target="_blank"`           |
| Nombre accesible de una región             | `Section`, con `heading` o `accessibilityLabel`  |
| Sacar del tabulador lo que está tapado     | `AppShellMain` y `Table` con `inert`             |
| Respetar `prefers-reduced-motion`          | Los tokens de movimiento                         |

Un campo escrito a mano con un `<label>` suelto pierde el `aria-describedby`,
así que el lector de pantalla no anuncia ni la ayuda ni el error.

## 4. Lo que no se escribe

**Valores arbitrarios.** `Box` y sus hermanos aceptan tokens y no medidas
sueltas. Para cualquier otra cosa está `className`, que deja el valor a la
vista de quien revise.

**Clases armadas por interpolación.** Tailwind escanea el código fuente durante
el build, de modo que ``className={`aspect-[${ratio}]`}`` no genera ninguna
regla. Los mapas de clases se escriben literales, con una entrada por valor, o
la propiedad va en `style` cuando el valor es libre.

**Un segundo juego de anchos.** Una pantalla que declara `max-w-5xl` deja de
coincidir con las demás en cuanto alguien toca la escala.

**Referencias a otros sistemas de diseño en el código.** Un comentario se
sostiene por lo que explica. De dónde salió cada decisión está en
[el plan](plan.md).
