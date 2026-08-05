# Patrones de pantalla

Un panel de administración tiene cuatro clases de pantalla. Cada una se
reconoce por lo que el usuario viene a hacer, y todo lo demás que aparece en
ella es un bloque de [Patrones de bloque](patrones-bloque.md).

Ninguna de las cuatro es un componente. Son composiciones del catálogo, y por
eso se documentan acá en vez de exportarse. Un componente-pantalla obliga a
discutir props para cada variante que aparece; una composición se copia y se
ajusta.

Las reglas transversales están en [Reglas de interfaz](reglas-ui.md).

## 1. El marco común

Las cuatro comparten el mismo esqueleto.

```tsx
<AppShellMain>
  <Container size="lg" className="flex flex-col gap-5">
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="h1" size="xl" weight="semibold">
          Pedidos
        </Text>
        <Text as="p" size="sm" tone="muted">
          Los últimos treinta días
        </Text>
      </div>
      <ButtonGroup>
        <Button variant="outline">Exportar</Button>
        <Button>Crear pedido</Button>
      </ButtonGroup>
    </header>

    {/* las secciones de la pantalla */}
  </Container>
</AppShellMain>
```

| Pieza                  | Regla                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Título                 | `Text as="h1"`, uno por documento. El tamaño va aparte de la semántica                     |
| Ancho                  | Sale de `Container`. La pantalla no declara `max-w-*`                                      |
| Acciones               | Una sólida como mucho. El resto en `outline`                                               |
| `flex-wrap` y `gap-y`  | Sin envolver, tres botones piden 302px y a 360px de pantalla se salen de la banda de 228px |
| `min-w-0` en el título | Sin él, un título largo empuja las acciones fuera del contenedor                           |

El contenido de las cuatro se reparte en `Section`, una por grupo. Una pantalla
que ponga contenido suelto entre secciones pierde el ritmo vertical y deja
huérfano lo que no está en ninguna.

## 2. Inicio

El usuario viene a enterarse del estado general y a seguir a otra pantalla.

| Parte                | Bloque                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| Algo que atender ya  | `Alert` descartable, encima de todas las secciones                        |
| Números del negocio  | [Tarjeta de métricas](patrones-bloque.md#5-tarjeta-de-métricas)           |
| Qué falta configurar | [Guía de puesta en marcha](patrones-bloque.md#8-guía-de-puesta-en-marcha) |
| Algo que ofrecer     | [Tarjeta de anuncio](patrones-bloque.md#6-tarjeta-de-anuncio)             |
| Ayuda                | [Pie de ayuda](patrones-bloque.md#9-pie-de-ayuda)                         |

**Es la única pantalla sin título propio.** El nombre de la aplicación ya está
en la barra, y repetirlo como encabezado gasta el primer renglón.

**El aviso va arriba y se puede descartar.** Un aviso permanente en el inicio
deja de leerse a la tercera visita.

## 3. Listado

El usuario viene a encontrar un registro entre muchos.

| Parte               | Bloque                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Los registros       | [Tabla de índice](patrones-bloque.md#2-tabla-de-índice), o [Lista de recursos](patrones-bloque.md#3-lista-de-recursos) |
| Sin ninguno         | [Estado vacío](patrones-bloque.md#1-estado-vacío) en lugar de la tabla                                                 |
| Acción de crear     | En la cabecera de la pantalla, sólida                                                                                  |
| Importar y exportar | En la cabecera, en `outline`                                                                                           |

**Los dos vacíos van en sitios distintos.** Sin ningún registro creado, el
estado vacío ocupa el lugar de la tabla entera, porque no hay filtros que
preservar. Con filtros puestos que no devuelven nada, el aviso va dentro del
marco y debajo de la barra de filtros, ya que la salida es quitar el filtro y
para eso tiene que seguir a la vista.

El segundo caso todavía no se puede escribir con el catálogo. `Table` no expone
una ranura para ocupar el sitio de las filas conservando la barra, así que hoy
se resuelve montando la tabla sin filas y poniendo el aviso debajo, con el
filtro a la vista pero fuera del marco.

**La tabla decide entre tabla y lista.** `Table` con `variant="auto"` pasa a
lista por debajo de 490px, donde tres columnas ya no caben sin partir el texto
por letras.

## 4. Ficha

El usuario viene a leer o editar un registro concreto.

| Parte             | Componente                                  |
| ----------------- | ------------------------------------------- |
| Vuelta al listado | `Link` con `ChevronLeft`, encima del título |
| Estado            | `Badge`, al lado del título                 |
| Acciones          | Duplicar y eliminar en la cabecera          |
| Contenido         | Varias `Section`, una por grupo de campos   |
| Datos de apoyo    | Columna al lado, con `DescriptionList`      |

La columna de apoyo mide 320px y se apila por debajo de 1024px:

```tsx
<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
```

`minmax(0,1fr)` en la pista principal, ya que una pista `1fr` no baja de su
contenido y una tabla ancha empuja la columna de apoyo fuera de la pantalla.

**Eliminar pasa por `AlertDialog`.** Destruye un registro y no hay deshacer.

## 5. Ajustes

El usuario viene a cambiar algo que ya estaba configurado.

| Parte                 | Componente                                                        |
| --------------------- | ----------------------------------------------------------------- |
| Cada grupo            | `Section` con su `heading`                                        |
| Explicación del grupo | Un `Text` con `tone="muted"` dentro                               |
| Controles             | `Field`, `Switch`, `CheckboxGroup`, `Select`                      |
| Ir a un subajuste     | [Menú de subpantallas](patrones-bloque.md#4-menú-de-subpantallas) |
| Acciones destructivas | Su propia sección, al final                                       |

**El ancho baja a `sm`.** Una pantalla de ajustes es una columna de
formularios, y a los 1152px de `lg` los campos quedan más anchos que cualquier
valor que se escriba en ellos. Los 672px de `sm` son la medida más cercana a la
que usa la referencia, 662px.

**Un interruptor no necesita botón de guardar.** El resto de los controles sí,
y el botón vive al pie de la pantalla, no dentro de cada grupo.

**Lo que destruye va al final y aparte.** Restablecer o borrar la cuenta en la
misma sección que el nombre de la tienda invita a pulsarlo mientras se edita
otra cosa.
