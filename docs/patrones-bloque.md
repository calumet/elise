# Patrones de bloque

Un bloque ocupa una parte de la pantalla y se combina con otros. Los siete que
siguen cubren lo que aparece en un panel de administración de Calumet.

Las pantallas que los contienen están en
[Patrones de pantalla](patrones-pantalla.md). Las reglas transversales, en
[Reglas de interfaz](reglas-ui.md).

## 1. Estado vacío

Aparece donde iban los datos, cuando no hay ninguno.

| Parte       | Componente                                      |
| ----------- | ----------------------------------------------- |
| Ilustración | `Image` con `aspectRatio`, máximo 200px de lado |
| Título      | `EmptyStateTitle`                               |
| Explicación | `EmptyStateDescription`, máximo 450px de ancho  |
| Salidas     | `EmptyStateActions` con una o dos               |

**Siempre lleva una salida.** Un estado vacío sin acción deja al usuario sin
saber qué hacer, y la pantalla se lee como rota.

**El título nombra lo que falta**, con la forma «Todavía no hay pedidos». Un
«Sin resultados» a secas obliga a deducir de qué se trata.

Cuando el vacío viene de un filtro, el título nombra el término buscado y la
acción quita el filtro. Los dos casos están en
[Listado](patrones-pantalla.md#2-listado).

## 2. Tarjeta de métricas

Muestra tres o cuatro números del negocio, cada uno con su variación.

| Parte          | Componente                              |
| -------------- | --------------------------------------- |
| El conjunto    | `Section`                               |
| Cada métrica   | `Clickable` con `href` al informe       |
| Rótulo         | `Text` con `size="sm"` y `tone="muted"` |
| Cifra          | `Text` con `size="2xl"`                 |
| Variación      | `Badge` con tono según el signo         |
| Entre métricas | `Separator` vertical                    |

**Cada métrica es un enlace.** Un número sin destino deja al usuario mirando un
dato que no puede investigar.

**El tono del badge sigue al negocio, no al signo.** Una devolución que baja es
`success` aunque el número caiga.

Por debajo de 400px de ancho de contenedor, las métricas pasan a una columna y
los separadores verticales se quitan.

## 3. Tarjeta de anuncio

Ofrece algo que el usuario todavía no usa, con una ilustración al lado.

| Parte       | Componente                              |
| ----------- | --------------------------------------- |
| El conjunto | `Section`                               |
| Texto       | Título, un párrafo y un `Button`        |
| Ilustración | `Image`, a la derecha en pantalla ancha |

**Una sola por pantalla.** Dos anuncios compitiendo se leen como publicidad y
el usuario deja de mirarlos.

**Se puede descartar.** Un anuncio que vuelve en cada visita después de que el
usuario lo ignoró tres veces es ruido.

## 4. Tarjeta de contenido

Presenta una pieza de contenido con su imagen, como un vídeo o un artículo.

| Parte       | Componente                           |
| ----------- | ------------------------------------ |
| El conjunto | `Section` con `padding="none"`       |
| Imagen      | `Image` con `fill` y `aspectRatio`   |
| Texto       | Título y párrafo, con relleno propio |
| Acción      | `Button` o `Link` al pie             |

La imagen llega al borde de la tarjeta, de ahí el `padding="none"`. El texto
lleva su propio relleno para no quedar pegado al filo.

Se separa de la tarjeta de anuncio en el propósito. Esta muestra contenido que
el usuario pidió ver; la de anuncio ofrece algo que no pidió.

## 5. Guía de puesta en marcha

Lista los pasos que faltan para dejar la aplicación lista, con su progreso.

| Parte           | Componente                                   |
| --------------- | -------------------------------------------- |
| El conjunto     | `Section`                                    |
| Progreso        | `Progress` con el porcentaje de pasos hechos |
| Cada paso       | `Checkbox` con su título y su detalle        |
| Acción del paso | `Button` dentro del paso                     |
| Entre pasos     | `Separator`                                  |

**Los pasos se marcan solos.** Una casilla que el usuario tiene que marcar a
mano miente sobre el estado real de la configuración.

**Desaparece al terminar.** Una guía completa que sigue ocupando el inicio
gasta el sitio de algo que sí cambia.

## 6. Pie de ayuda

Una línea al final de la pantalla que lleva a la documentación.

```tsx
<Text size="sm" tone="muted" align="center">
  Aprendé más sobre <Link href="/ayuda/pedidos">cómo se cobran los pedidos</Link>.
</Text>
```

**El enlace nombra el destino.** Un «hacé clic acá» no dice a dónde lleva, y un
lector de pantalla que recorre solo los enlaces anuncia una lista de «acá».

**Uno por pantalla, al final.** Repartir enlaces de ayuda por el medio compite
con el contenido.

## 7. Conexión de cuenta

Muestra si hay una cuenta externa conectada y deja conectarla o desconectarla.

| Parte       | Componente                                                  |
| ----------- | ----------------------------------------------------------- |
| El conjunto | `Section`                                                   |
| Estado      | Nombre del servicio y una línea con `tone="muted"`          |
| Acción      | `Button`, sólido para conectar y `outline` para desconectar |
| Condiciones | Un párrafo debajo, con lo que el usuario acepta             |

**Las condiciones van a la vista antes de conectar.** Un usuario que descubre
la comisión después de conectar la cuenta tiene motivo para desconfiar.

Desconectar destruye una relación, así que pasa por `AlertDialog`.

## Lo que no se documenta

**La tarjeta de aplicación** del catálogo de Shopify queda fuera. Vende otra
aplicación dentro de la propia, y Calumet no tiene un catálogo donde eso
aparezca.

**El campo de moneda y el de URL** se resuelven con lo que ya existe. El
primero es un `NumberField` con `prefix`, y el segundo un `Input` con
`type="url"` dentro de un `Field`.

**La celda de rejilla** se resuelve con `Box` y una clase de colocación como
`col-span-2`.
