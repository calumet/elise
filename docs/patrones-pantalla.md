# Patrones de pantalla

Una pantalla de Calumet se arma con seis disposiciones. Cada una resuelve un
trabajo distinto y se reconoce por lo que el usuario viene a hacer.

Ninguna es un componente. Son composiciones del catálogo, y por eso se
documentan acá en vez de exportarse. Un componente-pantalla obliga a discutir
props para cada variante que aparece; una composición se copia y se ajusta.

Las reglas transversales están en [Reglas de interfaz](reglas-ui.md). Los
bloques que van dentro de estas pantallas, en
[Patrones de bloque](patrones-bloque.md).

## 1. El marco común

Las seis comparten el mismo esqueleto.

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

    {/* el contenido de la pantalla */}
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

## 2. Listado

Lo que el usuario viene a hacer es encontrar un registro entre muchos.

| Parte      | Componente                                        |
| ---------- | ------------------------------------------------- |
| Filtros    | `Table` con la ranura `filters`                   |
| Filas      | `Table`, o `DataTable` si hay orden y exportación |
| Paginación | `Table` con `paginate`                            |
| Sin datos  | `EmptyState` dentro del marco                     |

**Los dos vacíos son distintos.** Un listado sin nada creado todavía lleva la
acción que crea el primero. Un listado con filtros que no devuelven nada lleva
la acción que los quita. Con un solo cartel, quien filtró cree que perdió los
datos.

**El cartel va dentro del marco de la tabla**, debajo de la barra de filtros.
Puesto fuera, el aviso dice que no hay resultados mientras el filtro que los
esconde queda arriba y sin explicación.

## 3. Ficha

Lo que el usuario viene a hacer es leer o editar un registro concreto.

| Parte             | Componente                                  |
| ----------------- | ------------------------------------------- |
| Vuelta al listado | `Link` con `ChevronLeft`, encima del título |
| Estado            | `Badge`, al lado del título                 |
| Contenido         | Varias `Section`, una por grupo de campos   |
| Datos de apoyo    | Columna al lado, con `DescriptionList`      |

La columna de apoyo mide 320px y se apila por debajo de 1024px:

```tsx
<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
```

`minmax(0,1fr)` en la pista principal, ya que una pista `1fr` no baja de su
contenido y una tabla ancha empuja la columna de apoyo fuera de la pantalla.

## 4. Ajustes

Lo que el usuario viene a hacer es cambiar algo que ya estaba configurado.

| Parte                 | Componente                                   |
| --------------------- | -------------------------------------------- |
| Cada grupo            | `Section` con su `heading`                   |
| Explicación del grupo | Un `Text` con `tone="muted"` dentro          |
| Controles             | `Field`, `Switch`, `CheckboxGroup`, `Select` |
| Ir a un subajuste     | `Clickable` con `href` y `ChevronRight`      |

**El ancho baja a `sm`.** Una pantalla de ajustes es una columna de
formularios, y a los 1152px de `lg` los campos quedan más anchos que cualquier
valor que se escriba en ellos. Los 672px de `sm` son la medida más cercana a la
que usa la referencia, 662px.

**Un interruptor no necesita botón de guardar.** El resto de los controles sí,
y el botón vive al pie de la pantalla, no dentro de cada grupo.

## 5. Menú de subpantallas

Lo que el usuario viene a hacer es elegir a dónde ir. La pantalla no tiene
contenido propio.

| Parte              | Componente                                           |
| ------------------ | ---------------------------------------------------- |
| Cada destino       | `Clickable` con `href`                               |
| Dentro de cada uno | Icono, título, una línea de detalle y `ChevronRight` |
| Entre destinos     | `Separator`                                          |
| El conjunto        | Una `Section` con `padding="none"`                   |

```tsx
<Section heading="Configuración" padding="none">
  {destinos.map((destino, n) => (
    <div key={destino.href}>
      {n > 0 ? <Separator /> : null}
      <Clickable href={destino.href} padding={3} accessibilityLabel={`Abrir ${destino.titulo}`}>
        …
      </Clickable>
    </div>
  ))}
</Section>
```

El `accessibilityLabel` hace falta porque dentro van un título y un párrafo, y
anunciarlo entero da un nombre largo que no dice a dónde lleva.

## 6. Lista de recursos

Lo que el usuario viene a hacer es reconocer registros por algo que no es texto
tabulado, como una foto o un avatar.

| Parte            | Componente                                               |
| ---------------- | -------------------------------------------------------- |
| Cada fila        | `Clickable` dentro de una `Section` con `padding="none"` |
| Identidad visual | `Thumbnail` o `Avatar`                                   |
| Estado           | `Badge`                                                  |
| Filtros          | `SearchField` y `Select` sobre la lista                  |

Un listado de productos con foto se lee mejor así que en una tabla, porque la
columna de la imagen ocupa más que las tres de texto juntas. Con más de cuatro
datos por registro, la tabla del patrón de listado gana.

## 7. Inicio

Lo que el usuario viene a hacer es enterarse del estado general y seguir a otra
pantalla.

| Parte                | Bloque                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| Números del negocio  | [Tarjeta de métricas](patrones-bloque.md#2-tarjeta-de-métricas)           |
| Qué falta configurar | [Guía de puesta en marcha](patrones-bloque.md#5-guía-de-puesta-en-marcha) |
| Algo que anunciar    | [Tarjeta de anuncio](patrones-bloque.md#3-tarjeta-de-anuncio)             |
| Ayuda                | [Pie de ayuda](patrones-bloque.md#6-pie-de-ayuda)                         |

El inicio es la única pantalla que se arma casi entera con bloques. Cada uno
tiene su propia regla en el documento de bloques.
