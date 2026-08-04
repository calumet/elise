# Plan de modernización

Elise nació como un catálogo de widgets. Esto es el trabajo que lo convierte en
un design system, y en qué estado está cada parte.

## De dónde salen las decisiones

Dos sistemas se usan como referencia, y no para lo mismo.

| Referencia                                        | Qué se toma                                                                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Polaris](https://polaris.shopify.com/) (Shopify) | La gramática de tokens (`color-{categoría}-{variante}-{estado}`, `bg-fill` contra `bg-surface`) y el patrón de primitivo componible más envoltorio opinado |
| [Astryx](https://astryx.meta.com/) (Meta)         | El modelo de tres capas y la extensión del catálogo                                                                                                        |

De Polaris viene, por ejemplo, que `Combobox` se divida en partes componibles
con `ComboboxField` encima, y que el check de una opción vaya al final de la fila
en lugar de reservarle una columna al inicio.

De Astryx viene el diagnóstico de fondo: un design system no se siente completo
por tener muchos componentes, sino por tener las tres capas. Elise tenía la del
medio.

Las referencias se nombran aquí y no en el código. Un comentario en el fuente
tiene que sostenerse por lo que explica, no por a quién cita: quien lee este
repo no tiene a mano el manifiesto de otro sistema, así que «contra
`s-search-field`» no explica nada y solo traslada el argumento a un sitio
inalcanzable. Este documento es el que registra de dónde salieron las
decisiones; el código dice por qué son como son.

| Capa        | Qué contiene                                                  |
| ----------- | ------------------------------------------------------------- |
| Fundamentos | Tokens de color, tipografía, espaciado, elevación, movimiento |
| Componentes | Los widgets, más las primitivas de layout y texto             |
| Patrones    | Pantallas armadas: shell, cabecera, wizard, ajustes           |

## Lo que no se toma

**El motor de estilos de Astryx (StyleX).** Tailwind v4 no es el problema, y
cambiarlo sería rehacer el catálogo entero para resolver algo que no está roto.

**Las rampas primitivas de color (50→950) y sus alias.** Un tercer nivel de
tokens debajo de los semánticos se descartó por deliberado: los semánticos que ya
existen cubren los casos, y agregar un nivel intermedio obliga a mantener dos
nombres para cada color sin que nadie consuma el de abajo. Si algún día hacen
falta varios temas de marca, esta decisión se revisa; hasta entonces, no.

**El vocabulario de botones de Polaris.** Polaris los nombra por jerarquía
(`primary`, `secondary`, `tertiary`, `plain`) y Elise por aspecto (`solid`,
`outline`, `ghost`). El nombre por aspecto es más predecible desde la pantalla
que lo escribe, y renombrar rompería a todo consumidor sin resolver nada. Por lo
mismo se queda `danger` donde Polaris dice `critical`, y se conserva `warning`,
que Polaris no tiene.

**Las alturas exactas de botón de Polaris.** Polaris baja a 28px de alto con
texto de 12px a partir de 768px. Elise se queda un escalón por encima, en 32/36/40,
porque el resto del catálogo escribe a 14px y un botón de 28px al lado de ese
texto se lee como un control secundario. Lo que sí se toma es el peso (550), el
radio (8px) y el comportamiento de `loading`.

De la auditoría del botón contra el CSS publicado de Polaris 13.9.5 quedan sin
aplicar, y a propósito: el `variant` por defecto (Polaris usa el de emphasis
media, Elise el sólido), el borde de `outline` como sombra interior de tres
capas en lugar de un borde de 1px, el `tone` que en Polaris solo tiñe el texto
de las variantes transparentes, `pressed` con su `aria-pressed`, el empujón de
1px al presionar, y las variantes tipo enlace. Ninguna es un defecto; son
decisiones que conviene tomar con un caso delante.

## Fase 0: la capa de tokens

Es donde estaba el grueso de la sensación de plantilla genérica, y se resuelve
sin tocar ninguna API pública.

- [x] Radio base y su escala derivada
- [x] Espaciado en rejilla (`--spacing: 0.25rem`), que saca a los controles y a
      los iconos de los píxeles fraccionarios
- [x] Escala tipográfica propia, con interlineado y tracking pareados por tamaño
- [x] Elevación monótona, con sombras propias para el tema oscuro
- [x] Tokens de movimiento y respeto por `prefers-reduced-motion`
- [x] Un solo sistema de foco en todo el catálogo
- [x] Estados `hover` y `active` de los rellenos sólidos, sin derivarlos con alfa
- [x] Superficies `-subtle` por estado, que reemplazan los fondos con alfa
- [x] Tokens de z-index, en seis capas con nombre: `sticky`, `overlay`, `modal`,
      `popover`, `tooltip` y `toast`. `popover` va por encima de `modal` a
      propósito, porque un select se abre desde dentro de uno. El apilado local
      (levantar una celda para que no le recorten el anillo de foco) se queda
      como número suelto: no es una capa del sistema
- [x] `--track`, el tramo sin llenar de un control que muestra un estado o un
      recorrido. Salió de un defecto medible: al bajar `--muted` para el
      encabezado de las tablas, el interruptor apagado quedó en 1.07:1 contra la
      tarjeta y el deslizador sin llenar igual, o sea un pulgar flotando sin nada
      alrededor. Un carril es parte del dibujo del control y necesita 3:1, y
      ningún token existente llegaba (`--border-strong` da 1.5). El valor es el
      más claro que sí llega: 3.11:1 en claro y 3.60:1 en oscuro

## Fase 1: primitivas

La capa que separa una librería de widgets de un design system. Sin ella, cada
pantalla resuelve su layout con Tailwind crudo y termina inventando su propia
escala.

- [x] `Box`, `BlockStack`, `InlineStack`, `Grid`, `Container`, `Bleed`, `Text`
- [x] `Link`, contra `s-link`: `tone` en `auto`, `neutral` y `critical`, más
      `asChild` para envolver el enlace del router de turno. Va subrayado y no
      solo teñido, y abrir en otra pestaña se pone su `rel` solo
- [x] `Code` y `Kbd`. No hay referencia en Polaris, que no los tiene, así que
      salen de los tokens de Elise. Son dos y no uno con variante porque nombrar
      una tecla y citar un valor no son lo mismo: la tecla va en relieve

`Heading` y `Center` estaban en el plan original y se descartaron. `Text` ya
acepta `as="h2"` con el tamaño independiente de la semántica, y centrar es un
caso de `Box` o de `InlineStack`.

## Fase 2: cerrar el catálogo

- [x] `Badge`, `Alert`, `EmptyState`, `Spinner`
- [x] `Combobox` y `MultiCombobox`, con sus envoltorios
- [x] `FileUpload`, `Stepper`, `Field`
- [x] Los ocho componentes que eran implementación propia, sobre su primitive de
      Radix
- [x] `DateField`, el campo de fecha con calendario emergente
- [x] `Table`, contra el contrato de `s-table`: `variant` con los tres modos,
      `listSlot` y `format` por columna, `paginate`, `loading`, `clickDelegate`
      y la ranura `filters`. `DataTable` no arma tarjeta propia: pasa por estas
      tres últimas, que antes duplicaba
- [x] `ColorPicker`, contra `s-color-picker`: lee HSL, HSLA, RGB, RGBA y hex de
      3, 4, 6 y 8, y emite siempre hex, de 6 o de 8 con `alpha`. Área de
      saturación y brillo, barra de tono, barra de alfa opcional y campo hex.
      La geometría sale de la escala de Elise, porque el manifiesto de Shopify
      no expone `cssProperties` ni `cssParts` para ninguno de sus componentes.
      El modelo interno es HSV y el tono se guarda aparte del color: en negro y
      en blanco el tono no existe, así que deducirlo del hex haría que pasar por
      una esquina lo perdiera. La aritmética vive en `lib/color.ts`, separada
      para poder comprobarla contra valores conocidos
- [x] `Stat`, `Timeline`, `DescriptionList`, `AvatarGroup` y `Tree`.
      `DescriptionList` sigue a la de Polaris React: `<dl>` de verdad, dos
      columnas a partir de 490px y el filete entre pares, no por línea. `Tree`
      lleva el patrón de árbol de ARIA entero, que es la razón de que exista
      como componente en vez de resolverse con listas anidadas y un
      `Collapsible` por rama. Los otros tres no tienen referencia publicada
- [x] `NumberField` y `SearchField`, contra `s-number-field` y `s-search-field`.
      `SegmentedControl` sobre el grupo de alternar de Radix, con el patrón
      segmentado de Polaris y sin poder quedarse sin valor. `TagInput`, `Rating`
      y `TimePicker` no tienen referencia publicada.
      `Field` gana `labelHidden`, que es el
      `labelAccessibilityVisibility="exclusive"` de la referencia
- [x] Capa de campo en los tres controles marcables. `Switch`, `Checkbox` y
      `RadioGroup` eran controles pelados: sin rótulo, sin ayuda y sin error, de
      modo que cada pantalla les ponía un `Label` externo a mano y nadie
      enlazaba nada. Ahora los tres llevan rótulo al lado, ayuda y error, con el
      enlace resuelto por `useFieldIds`, extraído de `Field` para que sea el
      mismo código y no una copia. En los radios el reparto es otro y sale del
      contrato: el rótulo, la ayuda y el error son del grupo, porque la pregunta
      se hace una vez y las opciones son las respuestas; cada opción lleva su
      propia ayuda y puede señalarse con `invalid` como la que dispara el error
- [x] `Chip`, separado de `Badge`. No existe un `s-tag`: existe `s-chip`, y no
      es un `s-badge` con una X. El badge lleva tono semántico y lo afirma el
      sistema; el chip no lleva tono, lo puso alguien y se quita. Había dos
      fichas quitables escritas por caminos distintos y ya divergidas (24px,
      radio 6, 13px y peso normal en `TagInput`; 20px, píldora, 11px y semibold
      en `MultiCombobox`, que además era un `Badge` con una X metida dentro).
      La tipografía del chip es la del texto y no la de una etiqueta, porque lo
      que va dentro es contenido que alguien escribió: se lee, no se ojea

`Banner` estaba en la lista y no hay nada que escribir: `Alert` ya es
`s-banner`. El contrato de allá es `tone`, `heading`, `dismissible` y un evento
`dismiss`; el de acá es `tone`, `AlertTitle` y `onDismiss`. La única diferencia
es que allá el componente se esconde solo con `hidden`/`afterhide` y acá lo
quita del árbol quien lo usa, que es lo idiomático en React.

**Gráficas: aplazadas, no pendientes.** No hay ningún componente de gráficas
entre las 59 etiquetas de la referencia; lo suyo es una librería aparte del
catálogo. Así que igualar la referencia no empuja hacia ahí, y construirlo
obligaría a elegir dependencia (recharts, visx o SVG a mano), decisión más
grande que el componente y que se queda una vez tomada. Los `--chart-*` sin
consumidor no son deuda: son cinco colores esperando a quien dibuje. Se retoma
con un caso delante.

`DateField` no copia las cadenas de `allow` y `disallow` de la referencia, que
codifican rangos como `2024-02--2025` dentro de un atributo. Eso existe porque un
componente web solo recibe cadenas; aquí `min`, `max` e `isDateDisabled` dicen lo
mismo con las herramientas del lenguaje. Tampoco hay rangos ni selección
múltiple: para eso está `DateRangePicker`.

### Coherencia entre piezas que ya existían

No son componentes nuevos sino sitios donde el catálogo se había separado de sí
mismo. Aparecen aquí porque el patrón se repite: dos piezas que resuelven lo
mismo divergen a la primera corrección que solo toca a una.

- [x] `AlertDialog` pasa al marco de `Dialog`. Se había quedado con un chrome
      propio (caja suelta de 24 de relleno, radio 12, fondo de página, sin
      bandas) mientras `Dialog` ya iba con cabecera y pie tenues y radio 16. En
      la referencia hay un solo modal, y una confirmación es ese modal con
      título y dos acciones. El marco vive en constantes porque cuelgan de
      primitivos distintos de Radix y no pueden compartir componentes, solo
      clases
- [x] Una sola barra de desplazamiento. `ScrollArea` y la lista de `TimePicker`
      dibujaban la suya, que se esconde en reposo y solo sale al apuntarla,
      mientras la página y los desplegables usan la nativa. Las dos pasan a
      `overflow` nativo, que el CSS global ya estiliza, y sale la dependencia
      `@radix-ui/react-scroll-area`
- [x] Relleno de 16 en las tres zonas del diálogo. `Dialog` llevaba 20 a los
      costados, los únicos píxeles del marco que no salían de la escala

## Fase 3: `packages/blocks`

La tercera capa. El paquete está reservado en `arquitectura.md` y no existe en
disco.

`AppShell` vive por ahora en `elise-ui`, no aquí: es un componente con estado y
partes componibles, no una pantalla armada. Cuando exista el paquete, los
patrones que lo usan son los que se mudan.

- [ ] Crear el paquete
- [ ] PageHeader, página de tabla, wizard, ajustes, autenticación, estados de
      error

### Lo que le falta al `AppShell`

De la auditoría contra el volcado del admin de Shopify. La calibración (guía,
pesos, riel, radios, colores) ya está; lo que queda cambia la forma del
componente, y por eso va aparte.

- [ ] La lista de hijas es hermana del `<li>` del padre y no va dentro, así que
      un `<ul>` cuelga de otro `<ul>`. Se arregla con un `AppShellNavGroup` que
      sea dueño del `<li>` y reciba la fila y la lista
- [ ] La lista de hijas no se pliega. Shopify le pone `aria-expanded` y
      `aria-controls` al padre y anima el panel en 100ms
- [ ] `AppShellNav` monta el mismo `<nav>` dos veces, para escritorio y para el
      cajón, así que cualquier `id` que se le pase sale duplicado. Y el landmark
      no tiene nombre accesible
- [ ] `AppShellMain` puede quedar inerte para siempre: el guardia de ancho solo
      escucha el cambio de breakpoint y no mira el ancho al montar, de modo que
      montar abierto por encima de 768px deja el contenido inalcanzable a la
      vista
- [ ] Faltan tres ranuras que Shopify sí tiene en la fila: contador, acciones
      que aparecen al apuntar, e icono relleno para la entrada elegida
- [ ] Falta la zona fija al pie de la navegación, donde Shopify pone Ajustes
- [ ] El arte de la guía no se refleja en RTL: la posición sí usa propiedades
      lógicas, pero el codo y la punta están dibujados de izquierda a derecha

## Fase 4: el sistema alrededor del catálogo

- [x] Auditoría visual ejecutable, con su job en CI (ver
      [auditoría visual](auditoria-visual.md))
- [ ] Tests unitarios y de integración: aplazados, no pendientes. Calumet es un
      grupo chico y mantenerlos cuesta más de lo que ahorra hoy. Se retoman
      cuando el equipo dé para eso, como las gráficas
- [ ] Accesibilidad automatizada (axe)
- [ ] Regresión visual por captura, en claro y en oscuro
- [ ] Varios temas de marca sobre `applyTheme`
- [ ] Sitio de documentación con playground
- [ ] CLI con `add` y `eject`
- [ ] Documentación legible por agentes (`llms.txt`, JSDoc con pistas de
      composición)

## Orden sugerido

Con los tests aplazados, lo que sostiene el catálogo es la auditoría visual, y
por eso crece con lo que se encuentra: hoy barre tres anchos y compara cajas
entre hermanos. Las fases siguen en su orden.
