# Changelog

Cambios que afectan a quien consume los paquetes. Empieza en la 0.3.0 de
`@calumet/elise-ui`; lo anterior está solo en el historial de git.

## `@calumet/elise-ui` 0.23.0

Suben también `elise-alerts` 0.3.7 y `elise-toasts` 0.4.8, que no cambian por
dentro: dependen por caret y `^0.22.0` no alcanza a la 0.23.0.

### Rompe

- **`AppShellNavItem` exige `href`.** Sin destino renderizaba un `<a>` que no se
  enfoca ni se activa con teclado, así que una entrada de navegación quedaba
  fuera del alcance de quien no usa ratón.

## `@calumet/elise-tables` 0.5.0

### Corrige

- **El encabezado ordenable no se anunciaba como control.** Ahora lleva
  `role="button"`, y los que no ordenan dejan de traer manejadores y `tabIndex`.

- **El filtro de selección no decía qué lista abre.** Le faltaba el
  `aria-controls` que `role="combobox"` pide.

## `@calumet/elise-linter` 0.8.0

### Agrega

- **28 de las 35 reglas de `jsx-a11y` en el preset `react`.** Las siete que
  quedan fuera están en [docs/linter.md](docs/linter.md) con el motivo: sus
  hallazgos en un catálogo de componentes son falsos positivos.

## `@calumet/elise-ui` 0.22.1

### Corrige

- **La variante `outline` de `SidebarMenuButton` no dibujaba su contorno.** La
  sombra pedía `hsl(var(--sidebar-border))`, pero esa variable ya es un color
  `oklch`, así que la declaración era inválida y el navegador la descartaba.

- **Dos clases de Tailwind que no hacían nada.** `text-md` no existe, y en el
  calendario `w-full` le ganaba el ancho a `size-auto`.

### Cambia

- **`class-variance-authority` se va del paquete.** Estaba abandonada desde
  noviembre de 2024 y la usaba un solo archivo. `SidebarMenuButton` declara sus
  variantes como el resto del catálogo.

## `@calumet/elise-linter` 0.7.0

### Agrega

- **`tailwind(entryPoint)`**, que valida las clases contra el tema del proyecto
  con `oxlint-tailwindcss`. El orden no entra ahí: lo arregla `sortTailwindcss`
  de Oxfmt, y encender los dos reportaría lo mismo dos veces.

## `@calumet/elise-ui` 0.22.0

Suben también `elise-alerts` 0.3.6, `elise-tables` 0.4.5 y `elise-toasts` 0.4.7,
que no cambian por dentro: dependen por caret y `^0.21.0` no alcanza a la 0.22.0.

### Cambia

- **El bundler pasa de tsup a tsdown**, que es el sucesor que el propio tsup
  recomienda desde que dejó de mantenerse. La API publicada es la misma, nombre
  por nombre, y el paquete sale un 15% más chico comprimido.

## `@calumet/elise-linter` 0.6.0

### Rompe

- **`typescript/no-explicit-any` pasa de apagada a error.** Venía apagada del
  config de ESLint y este repositorio no tiene ni un `any`, así que estaba
  apagada sin nada que tapar. Quien extienda el preset y sí los tenga, los verá.

## `@calumet/elise-ui` 0.21.2

### Corrige

- **El cajón del `AppShell` ya no puede quedar abierto en escritorio.** Su
  apertura se deriva del ancho en vez de sincronizarse con un efecto, así que
  por encima del breakpoint no hay overlay ni montando ya ancho.

## `@calumet/elise-ui` 0.21.1

### Corrige

- **El hueco de carga del `Sidebar` rompía la hidratación.** Sorteaba su ancho
  con `Math.random()`, así que el servidor y el cliente pintaban distinto. Ahora
  sale del `useId`, que es estable en los dos lados.

- **`useIsMobile` daba `false` en el primer render.** El valor llegaba de un
  efecto, que en el servidor no corre, y la pantalla saltaba de escritorio a
  móvil ya hidratada. Pasa a `useSyncExternalStore`, que sí tiene un valor para
  el servidor.

- **El `Carousel` rehacía el valor de su contexto en cada render**, así que todas
  sus partes se repintaban aunque no cambiara nada.

- **`Table` tenía un hook con nombre que no empieza por `use`.** React no puede
  comprobar las reglas de hooks dentro de una función así.

## `@calumet/elise-linter` 0.5.0

### Agrega

- **Cinco reglas de React en el preset `react`:** `set-state-in-effect`, `refs`,
  `purity`, `rules-of-hooks` y `jsx-no-constructed-context-values`. Quien
  extienda el preset las hereda.

## `@calumet/elise-linter` 0.4.0

### Rompe

- **El formato pasa de Prettier a Oxfmt.** El export `./prettier` desaparece y
  en su lugar queda `./oxfmt`, que se esparce porque Oxfmt no tiene `extends`:

  ```ts
  import { defineConfig } from "oxfmt";

  import formato from "@calumet/elise-linter/oxfmt";

  export default defineConfig({ ...formato });
  ```

  Formatea lo mismo que Prettier: TypeScript, JSX, JSON, Markdown, CSS y YAML.
  Lo que iba en `.prettierignore` va en `ignorePatterns`.

### Agrega

- **El orden de imports vuelve, ahora con `sortImports` de Oxfmt.** Es lo que
  reemplaza a `import/order`, que se había perdido en la 0.3.0. Mueve líneas
  enteras entre grupos y no toca los nombres dentro de un import, ni borra uno
  sin usar, ni fusiona dos del mismo módulo.

## `@calumet/elise-linter` 0.3.0

### Rompe

- **La configuración pasa de ESLint a Oxlint.** ESLint 9 llegó al fin de su
  soporte el 6 de agosto de 2026. `configs.base`, `configs.react` y
  `configs.tailwind` desaparecen, y con ellos el export raíz del paquete; en su
  lugar salen dos objetos que se extienden desde `oxlint.config.ts`:

  ```ts
  import { defineConfig } from "oxlint";

  import { base } from "@calumet/elise-linter/oxlint";

  export default defineConfig({ extends: [base] });
  ```

  `react` es el otro. Va en `oxlint.config.ts` y no en `.oxlintrc.json` porque
  el formato JSON no resuelve imports de paquetes, así que pide Node 22.18 o 24
  en adelante. El preset de Tailwind no tiene reemplazo todavía.

- **`import/order` ya no se comprueba.** Oxlint no la va a implementar, porque
  ordenar imports es formato. Vuelve en la 0.4.0 con `sortImports` de Oxfmt.

## `@calumet/elise-ui` 0.21.0

Suben también `elise-alerts` 0.3.5, `elise-tables` 0.4.4 y `elise-toasts` 0.4.6,
que no cambian por dentro: dependen de `elise-ui` por rango de caret y `^0.20.0`
no alcanza a la 0.21.0.

### Agrega

- **`FileField`, el campo de un archivo para un formulario de ajustes.** Ocupa
  una fila: miniatura, nombre, peso y el botón de subir o reemplazar, con
  «Quitar» junto al rótulo. Entrega el `File` por `onChange` y nada más; subirlo
  es de la app, y `progress` es por dónde vuelve ese estado. Soltar encima
  funciona, y se marca solo cuando ya hay algo encima.

  `FileUpload` se queda donde estaba, para adjuntar varios de una. Este es para
  cuando el archivo es un ajuste: el logo de un portal entre el nombre y el
  color, donde una zona de arrastre de 130px se lleva la sección.

## `@calumet/elise-ui` 0.20.0

Suben también `elise-alerts` 0.3.4, `elise-tables` 0.4.3 y `elise-toasts` 0.4.5,
que no cambian por dentro: dependen de `elise-ui` por rango de caret y `^0.19.0`
no alcanza a la 0.20.0.

### Agrega

- **`ValueField`, el campo cuyo valor es un registro.** Lo resume en sitio, en
  varias líneas con un lápiz al costado, y lo edita en un `Dialog` aparte; sin
  valor es una fila que lo abre. El resumen llega en `lines`, ya formateado, y
  los campos del registro van como hijos. Con `onClear` aparece «Vaciar» junto
  al rótulo.

  Es para lo que aplanado no se lee: una dirección son cuatro campos y un banner
  siete, y una lista de tres deja veintiún controles seguidos.

- **`Field` acepta una `action` a la altura del rótulo,** para lo que actúa
  sobre ese campo y no cabe dentro del control. Lo que actúa sobre el grupo
  sigue en las `actions` de `Section`.

## `@calumet/elise-ui` 0.19.0

Suben también `elise-alerts` 0.3.3, `elise-tables` 0.4.2 y `elise-toasts` 0.4.4,
que no cambian por dentro: dependen de `elise-ui` por rango de caret y `^0.18.0`
no alcanza a la 0.19.0.

### Agrega

- **Una pantalla de ajustes no tenía cómo avisar de cambios sin guardar.** El
  guardado vivía en un botón al pie, y con cinco secciones ese pie queda varias
  pantallas por debajo del primer campo: quien cambia el color primario arriba
  pierde de vista el único control que lo aplica, y nada en la pantalla le dice
  que el cambio sigue sin guardarse. Deshacer tampoco tenía vía, salvo recargar
  y llevarse por delante todo lo demás que se hubiera editado.

  `SaveBar` aparece mientras `dirty` y se lleva las dos salidas a una franja
  fija arriba. Va sobre la superficie invertida, la misma del toast, porque es
  una capa encima de la pantalla y no una sección suya. El botón del pie se
  queda donde estaba: la barra avisa, no lo sustituye.

  ```tsx
  const form = useZodForm(esquema);

  <SaveBar
    dirty={form.formState.isDirty}
    saving={form.formState.isSubmitting}
    onSave={form.handleSubmit(guardar)}
    onDiscard={() => form.reset()}
  />;
  ```

  **Lo sucio entra como booleano y no sale de un contexto de formulario.** Con
  un contexto, la barra tendría que depender de `react-hook-form`, que no es
  dependencia de este paquete, y quedaría inservible en un formulario que no use
  `useZodForm`. Con el booleano no hace falta nada: `useZodForm` devuelve el
  `UseFormReturn` de react-hook-form, así que `formState.isDirty` ya está ahí.

  **Descartar destruye lo editado, así que pasa por `AlertDialog`** y no por el
  botón a secas, como fija `reglas-ui.md` § 1.4.

  **Dentro del marco va `AppShellSaveBar`,** que ocupa el sitio del buscador y
  deja a los lados el botón del cajón y las acciones, que siguen haciendo falta
  mientras se edita. No se lleva la fila entera: con la fila la barra tapaba la
  cuenta y los avisos, y en estrecho se comía el ancho completo.

  Lleva la misma receta que el resto de las piezas de la cabecera, `bg-card`
  bajo el tema oscuro más el contorno, porque contra un fondo casi negro la
  diferencia de luminosidad no alcanza a dibujar la caja y lo que la define es
  el borde. Al apretar el ancho el rótulo cede y se recorta, y los
  botones no: lo que decide si cabe es lo que quede entre el botón del cajón y
  las acciones, no el ancho de la ventana, así que no hay breakpoint de por
  medio.

  **`retain` cubre la mitad que es del navegador**: cerrar la pestaña, recargar
  o escribir otra dirección. Ahí manda `beforeunload`, que pinta su propio
  diálogo con su propio texto y no se puede sustituir. Se engancha solo mientras
  haya algo que perder, porque un `beforeunload` puesto siempre le quita a la
  pestaña el bfcache. Viene apagado.

  La otra mitad, navegar dentro de la aplicación, no tiene evento que valga
  porque el enrutado es de cada app: esa la conecta la pantalla con su propio
  enrutador, leyendo el mismo `dirty` que ya le pasa a la barra.

## `@calumet/elise-ui` 0.18.0 y `elise-alerts` 0.3.2

Suben también `elise-tables` 0.4.1 y `elise-toasts` 0.4.3, que no cambian por
dentro: dependen de `elise-ui` por rango de caret y `^0.17.0` no alcanza a la
0.18.0.

### Rompe

- **`AlertDialogAction` y `AlertDialogCancel` traen el aspecto de `Button`
  puesto,** sólido el que confirma y `outline` el que descarta, y aceptan
  `variant`, `size` y `tone`. Eran el primitivo de Radix sin una sola clase, así
  que sueltos salían como texto pelado. Con `asChild` no cambia nada: ahí las
  clases no se ponen y el aspecto lo sigue poniendo el hijo.

### Cambia

- **`buttonVariants` acepta `tone`.** Sin él, reusar el aspecto del botón fuera
  de `Button` daba siempre el primario.

### Corrige

- **Un diálogo sin cuerpo pintaba dos filetes.** Con la cabecera y el pie
  pegados, cada uno dejaba el suyo. El pie se queda sin el de arriba cuando va
  justo después de una cabecera. Vale para `Dialog`, `AlertDialog` y `Sheet`.

## `@calumet/elise-ui` 0.17.0 y `elise-tables` 0.4.0

Suben también `elise-icons` 0.2.2, `elise-forms` 0.1.4, `elise-linter` 0.2.1,
`elise-alerts` 0.3.1 y `elise-toasts` 0.4.2. Las dos últimas no cambian por
dentro: dependen de `elise-ui` por rango de caret, y `^0.16.2` no alcanza a la
0.17.0, así que sin republicarlas quedarían pidiendo una versión que ya no es la
última y un consumidor se instalaría dos copias del design system.

### Rompe

- **`DataTable` pasa a TanStack Table v9.** Lo que cambia está en las columnas,
  que las escribe quien consume el paquete:

  | antes                       | ahora                    |
  | --------------------------- | ------------------------ |
  | `sortingFn: "alphanumeric"` | `sortFn: "alphanumeric"` |
  | `ColumnDef<Fila, string>[]` | `ColumnDef<Fila>[]`      |
  | `<DataTable<Fila, string>>` | `<DataTable<Fila>>`      |

  **El valor de celda sale del arreglo de columnas.** La v8 lo llevaba como
  segundo genérico y por dentro lo resolvía a `any`, porque un arreglo de
  columnas tiene tantos tipos de valor como columnas y uno solo nunca describió
  ninguno. En la v9 el arreglo se tipa sin él y cada columna conserva el suyo en
  su `accessorFn`, que es donde siempre estuvo. Una columna suelta lo sigue
  aceptando: `ColumnDef<Fila, string>` vale para tipar una, no para el arreglo.

  **La fila tiene que ser un objeto.** El `RowData` de la v9 es
  `Record<string, any> | Array<any>`, donde el de la v8 era `unknown`. Una tabla
  de primitivas no compila.

  **Solo se registran las funciones de orden y filtro que el `auto` puede
  elegir**, que son las que deciden una columna que no pide ninguna: `datetime`,
  `alphanumeric` y `text` para ordenar, y seis para filtrar según el valor sea
  texto, número, booleano, arreglo, fecha u objeto. La v9 deprecó los registros
  completos, y un nombre solo resuelve si su función está registrada. Una
  columna que quiera otra de las incorporadas pasa la función por referencia en
  su `filterFn` o su `sortFn`, que la v9 acepta sin registro de por medio; el
  registro existe solo para poder nombrarla con un string.

  No cambia nada del marcado ni de `meta.filterVariant`, que es lo que decide
  qué filtro dibuja la barra.

- **`Calendar` sigue a react-day-picker 10.** Sus props son las de `DayPicker`,
  así que lo que la 10 retira viaja hasta acá. La 10 quita lo que la 9 dejó
  deprecado, y lo que Elise usa por dentro ya estaba en la forma nueva, así que
  esto solo alcanza a quien le pasara una de las viejas:

  | antes                   | ahora                                     |
  | ----------------------- | ----------------------------------------- |
  | `fromMonth`, `fromYear` | `startMonth`                              |
  | `toMonth`, `toYear`     | `endMonth`                                |
  | `fromDate`, `toDate`    | `hidden` con `before` / `after`           |
  | `initialFocus`          | `autoFocus`                               |
  | `components.Button`     | `PreviousMonthButton` / `NextMonthButton` |

  En `classNames` también se fueron las claves viejas: `table` es `month_grid`,
  `nav_button` se parte en `button_previous` y `button_next`, `day_selected` es
  `selected` y `day_disabled` es `disabled`.

### Cambia

- **Sube el piso de las dependencias.** Radix al día en veinte de las veintiocho que
  usa el paquete, `react-day-picker` a la 10, `lucide-react` a la 1.46,
  `tailwind-merge` a la 3.7, y en `elise-forms` `zod` a la 4.6 con
  `react-hook-form` a la 7.88. Son dependencias normales y no peers, así que no
  hay nada que instalar a mano.

- **El `meta` de una columna ya no necesita ampliar un módulo ajeno.** La v9
  trae una ranura de solo tipo por tabla, así que `MetaDeColumna` se declara
  donde se arma la tabla en vez de con un `declare module` sobre `ColumnMeta` de
  TanStack, que es lo que JSR rechaza. Para quien consume el paquete no cambia
  nada: el `meta` sigue llegando tipado al importar `ColumnDef` desde acá.

### Corrige

- **`useZodForm` dejó de compilar sus tipos al subir `@hookform/resolvers`.** De
  la 5.4 a la 5.9 el resolver cambió su sobrecarga de Zod 4 por una que encaja
  por forma, y un `ZodType` de Zod 4 encaja también en la de Zod 3, que está
  declarada antes y devuelve el tipo de la restricción en vez del del esquema.
  El hook acota ahora contra el `$ZodType` de `zod/v4/core`, que es la
  interfaz que Zod 4 publica para quien escribe librerías y no lleva las
  propiedades por las que encajaba en la sobrecarga vieja. Se importa de ese
  subpath y no de `zod` porque Zod lo pide así: `zod` apunta al major que tenga
  instalado la aplicación, y `zod/v4/core` es un enlace fijo a la 4 que
  sobrevive al siguiente. La entrada y la salida del esquema se siguen
  distinguiendo igual.

## `@calumet/elise-ui` 0.16.2

### Corrige

- **Un panel con varios grupos de enlaces había que armarlo por fuera.** El
  rótulo, la caja de cada columna, el reparto en rejilla y los huecos salían del
  código de quien montaba el menú, y con eso el rótulo terminaba leyéndose como
  un enlace apagado. Lo resuelve `NavigationMenuGroup`, que toma el rótulo en
  `label` y deja al panel repartir: en columnas donde es ancho, apilado donde
  no. `NavigationMenuLabel` sigue disponible suelto.

- **En el cajón de móvil no había forma de decir a dónde lleva un enlace.**
  `NavigationMenuLink` acepta ahora `description`, una segunda línea en tono
  atenuado y un escalón por debajo del rótulo, como la de `Checkbox`. Es lo que
  convierte una lista de enlaces sueltos en algo con jerarquía.

- **Una sección desplegada de `NavigationMenu` no se cerraba pulsando su propio
  disparador.** Solo la cerraba abrir otra, así que el cajón de móvil se quedaba
  abierto sin forma de volver a la lista de secciones. Radix alterna en la raíz,
  pero el `onItemSelect` de un `Sub` asigna el valor sin compararlo con el que
  había, y las dos secuencias verticales del componente cuelgan de un `Sub`: el
  cajón de móvil y el grupo «Más» del escritorio. Ahora el disparador corta ese
  `onItemSelect` y vacía la secuencia él mismo. Pasaba también en el grupo de
  escritorio, que la incidencia no mencionaba.

- **`NavigationMenuToggle` no caía a plomo con la marca de su cabecera.** Su
  caja mide 36px alrededor de un glifo de 20, así que el icono cerraba 8px por
  dentro de donde abría la marca, y el descuento lo tenía que poner quien lo
  montaba. Ahora lo trae puesto; `className="me-0"` lo anula donde el botón no
  quede contra el borde.

- **El botón de navegación de `AppShellHeader` no caía a plomo con el resto de
  la cabecera.** Su caja mide 32px alrededor de un glifo de 20, así que el icono
  abría a 22px mientras la marca y las demás bandas abrían a 16. La cabecera le
  baja ahora esos 6px al relleno de ese lado mientras el botón está, y el glifo
  cae en la línea de las otras bandas.

- **En el cajón de móvil el fondo de hover salía pegado al rótulo y con las
  esquinas cortadas.** Las filas llevaban el relleno a cero para que el rótulo
  cayera a plomo con la marca de la cabecera. Ahora lo recuperan y el cajón
  sangra lo mismo, así que el rótulo sigue en su línea y la pastilla lo rodea.
  La sangría va en el cajón y no en su lista: el cajón recorta para poder
  animarse, y desde dentro le comía las esquinas a la pastilla. En lugar de los
  filetes va un hueco entre filas, que un filete cruzando una pastilla la
  convierte en una banda.

- **En el cajón, una sección y sus hijos se veían iguales.** Los dos iban al
  mismo cuerpo y al mismo peso, así que el despliegue se leía como una lista
  plana. La sección pasa a semibold, su caret de 12 a 16px, y las filas de
  segundo nivel se aprietan de 44 a 36px de alto.

- **El cierre de `Alert` pintaba su fondo de hover fuera del relleno de la
  barra.** Alineaba el glifo con un margen negativo, que le sacaba la caja 6px
  por fuera del canto. Ahora es la barra la que se acomoda cuando el cierre
  está: el glifo queda en el mismo sitio y la caja, dentro.

Un botón de icono que pongas vos contra el borde de un contenedor con relleno
se acomoda igual, bajándole al relleno de ese lado la holgura de la caja. La
regla, con el porqué de no hacerlo con un margen negativo, está en
[reglas-ui.md](docs/reglas-ui.md).

## `@calumet/elise-ui` 0.16.1

### Corrige

- **Un `Separator` dentro de la franja invertida salía como una raya blanca.**
  Un divisor de este sistema vive entre 1.15 y 1.35 de contraste contra su
  superficie; dentro de la franja estaba en 14.07 en el tema claro, porque la
  línea sale de `--border` y la rampa de líneas de la raíz está calibrada contra
  superficies claras. Ahora la franja declara también su rampa, con los mismos
  pasos espejados: el divisor queda en 1.30, donde `--border` queda sobre
  `--card`. Los tokens son `--inverse-border-subtle`, `--inverse-border`,
  `--inverse-input` e `--inverse-border-strong`.

- **En el riel de navegación, un `Separator` corriente era casi invisible.**
  Dibujaba con `--border`, que sobre el riel mide 1.06. El riel reapunta ahora
  `--border` a `--sidebar-border`, la línea que ya tenía: 1.15.

## `@calumet/elise-ui` 0.16.0 y `elise-toasts` 0.4.1

### Agrega

- **La franja invertida y el riel de navegación llevan su propia escala de
  texto.** `--muted-foreground` está calibrado contra las superficies de la raíz
  y encima de esas dos se sale de la escala. Ahora cada una declara su par en el
  propio elemento, así que `Text tone="muted"` y `text-muted-foreground`
  resuelven contra la superficie sin que el componente sepa dónde está, igual
  que dentro de `data-theme="dark"`. Los tokens nuevos son
  `--inverse-muted-foreground` y `--sidebar-muted-foreground`, y las listas de
  clases salen como `SUPERFICIE_INVERSA` y `SUPERFICIE_SIDEBAR` desde
  `@calumet/elise-ui/box`.

  | texto secundario sobre   | antes | ahora |
  | ------------------------ | ----- | ----- |
  | `--inverse`, tema claro  | 3.29  | 5.48  |
  | `--inverse`, tema oscuro | 5.43  | 5.43  |
  | `--sidebar`, tema claro  | 4.52  | 5.28  |
  | `--sidebar`, tema oscuro | 6.46  | 6.46  |

- **`Box background="inverse"`,** que faltaba en la lista de superficies.

- **La franja lleva también la tinta de estado.** Un icono de éxito o de error
  encima se pintaba con el relleno sólido, que está hecho para llevar texto
  blanco encima y no para ser tinta: ninguno de los cuatro llegaba al 3:1 de un
  gráfico, y el de información quedaba en 1.07 en el tema claro. La superficie
  reapunta los `--*-subtle-foreground` a `--inverse-info`, `--inverse-success`,
  `--inverse-warning` e `--inverse-danger`, que son los valores con los que el
  tema oscuro pinta la tinta de estado. Los cuatro quedan entre 9.3 y 12.0.

### Corrige

- **El riel de navegación tenía el texto tenue a dos centésimas del mínimo.** Es
  la más oscura de las superficies claras, así que era la que marcaba el techo
  de `--muted-foreground`: 4.52 sobre 4.5. El rótulo de sección, la entrada no
  activa, el contador y la acción de una entrada usan ese tono.

- **La descripción de un toast se atenuaba con una opacidad inventada.** Estaba
  en `text-inverse-foreground/75`, que mide 9.87 de contraste: casi lo mismo que
  el título, así que los dos niveles de texto se leían igual. Ahora sale del
  token y queda en 5.48. Lo mismo con el aspa, que estaba en `/70`.

- **El icono de un toast de información era invisible en el tema claro.** Se
  pintaba con `--primary`, que sobre la franja mide 1.07.

## `@calumet/elise-ui` 0.15.2

### Corrige

- **El panel entraba desde fuera de la pantalla.** El sitio del panel se pone
  desde JS, en `left`, pero el panel llevaba una duración de animación sin decir
  qué propiedad transicionar, y el valor por defecto de `transition-property` es
  `all`: `left` también se transicionaba, desde 0, así que el panel arrancaba en
  el borde de su sección y se arrastraba hasta su sitio durante 140ms. En una
  sección pegada al canto eso son 123px fuera de la pantalla y barra de
  desplazamiento, cada vez que se abre. Es lo que la 0.14.5 tapaba con
  `overflow-x: clip`, lo que la 0.15.1 no arregló, y por lo que se veía tanto al
  pararse en la última sección como al pasar entre dos. Ahora el panel no
  transiciona nada; su animación de entrada conserva la misma duración.

  Medido en WebKit y en Chromium, parándose en cada sección y cambiando entre
  todas las vecinas en los dos sentidos, a 1180 y a 1040: 0 cuadros con barra de
  desplazamiento de 1923, y el panel nunca cruza el borde.

- **El panel se pegaba al canto de la barra.** Cuando se arrima para caber, se
  detiene 6px antes, el mismo hueco que lo separa de la barra por arriba.

## `@calumet/elise-ui` 0.15.1

### Corrige

- **El recorte de la 0.14.5 se llevaba por delante los paneles.** El
  `overflow-x: clip` de la raíz cortaba la sombra y las esquinas del panel de
  una sección pegada al borde, y en Safari los menús se abrían un instante y se
  cerraban. Se quita el recorte: en vez de tapar lo que se sale, los paneles ya no se
  deslizan de lado al cambiar de sección, así que ninguno cruza el borde.
  Siguen con su fundido, su escala y su entrada desde arriba. Medido en WebKit
  y en Chromium, cambiando entre las ocho secciones una a una: 0 desborde de
  página, que es lo que arreglaba la 0.14.5.

- **El grupo se colocaba al revés que el resto.** Abría anclado por su derecha
  y se iba hacia la izquierda, en vez de arrimarse hacia dentro solo lo que
  hiciera falta, como hace cualquier sección cerca del borde. Ahora usa la
  misma alineación que las demás.

## `@calumet/elise-ui` 0.15.0

### Rompe

- **`ThemeScope` lleva al panel lo que va en `theme`, y ya no su `className`.**
  La caja se queda en `className` y el tema pasa a `theme`. Repintado entero, el
  `className` metía en el panel lo que era de la sección: un `p-5` corría las
  bandas de la cabecera y del pie 20px hacia adentro, y ahí ya no llegaban al
  borde. Quien tenga el tema en `className` lo mueve a `theme`.

- **El disparador de la cuenta marca `data-slot="user-menu"`,** que antes era
  `app-shell-user-menu`.

### Agrega

- **`UserMenu`, en `@calumet/elise-ui/user-menu`.** El menú de la cuenta no
  depende de ningún contexto, así que la cabecera de un portal lo monta sin un
  `AppShell` alrededor. `AppShellUserMenu` es este mismo componente y sigue
  exportándose desde `app-shell`.

- **`variant="avatar"` deja el avatar suelto en cualquier ancho,** para una
  cabecera que decida su propio corte. Por defecto, `variant="name"` dibuja la
  píldora con el nombre y la pliega al avatar donde no cabe, como hasta ahora.

- **Las iniciales salen del nombre.** `initials` pasa a ser el respaldo para
  cuando las que salen no sirven. El helper está suelto como `inicialesDe` en
  `@calumet/elise-ui/avatar`: se salta las partículas y los espacios de más, así
  que «María de los Ángeles Pérez» da «MP» y «Juan» da «J».

### Corrige

- **El cierre del `Collapsible` frenaba y terminaba de un salto.** La animación
  lleva la altura a cero, pero en `border-box` una caja no mide menos que su
  relleno: con `pt-3` se quedaba en 12px hasta que el primitivo la escondía.
  Ahora el relleno vertical va con la altura, en el `Collapsible` y en el
  `Accordion`. Medido, el cierre pasa de 65px a 0 sin escalón.

- **El disparador del `MultiComboboxField` medía distinto con fichas y sin
  ellas:** 40px puestas y 36px vacío, en un `size="md"` que es de 36. Traía un
  alto propio que ya no hacía falta, porque la fila de fichas no envuelve. Ahora
  mide lo que su tamaño en los dos estados.

## `@calumet/elise-ui` 0.14.5

### Corrige

- **Un panel a ras del borde sacaba barra de desplazamiento al cambiar de
  sección.** Los paneles entran y salen deslizando 2rem de lado, y el de una
  sección pegada al borde derecho cruzaba el viewport durante la animación: la
  página ganaba barra horizontal, y con barras clásicas también vertical, por
  unos cuadros. `NavigationMenu` lleva ahora `overflow-x: clip`, que recorta de
  lado sin tocar lo vertical. Medido con un panel 26px fuera del borde: el
  desborde de la página pasa de 26 a 0 y el panel sigue a la vista debajo de la
  barra.

## `@calumet/elise-ui` 0.14.4

### Corrige

- **Con HTML del servidor, la fila se veía entera hasta hidratar.** La cuenta
  de secciones que caben solo existe en el cliente. Ahora `NavigationMenu` deja
  al final un `<script>` inline que reparte la fila al parsear, antes de pintar,
  y `NavigationMenuList` arranca de esa cuenta: el DOM tras el script y tras
  hidratar es el mismo, píxel a píxel. Para eso lo agrupado queda en la fila con
  `hidden` en vez de desmontarse, y el grupo es siempre el último `li`. Lo que
  comparta línea con la fila va dentro de `NavigationMenu`; con CSP, pasale
  `nonce`.

## `@calumet/elise-ui` 0.14.3

### Corrige

- **Dentro de una fila flex, la fila medía el sitio sobre la caja de Radix y se
  desbordaba.** El sitio salía de la caja que Radix pone alrededor de la fila, y
  esa caja, como item de una fila flex, no se encoge por debajo de su contenido
  ni crece más allá de él: mide lo que la fila ocupa y nunca lo que le queda.
  Medido en una cabecera con la marca a un lado y los accesos al otro, la caja
  se quedaba en 893px mientras la fila iba de 1050 a 650: con 87px libres no
  reabría nunca, y a lo estrecho se salía hasta 313px. Es la forma que obliga a
  poner la fila en una fila flex, y es la que se ve en un portal de verdad.

  La caja no sale en el árbol de quien la usa, así que la estila la raíz con
  `:has()`: toma el sitio que le queda y se deja encoger. Barrida de 1150 a 500
  y de vuelta en pasos de 4px: la cuenta sigue al ancho en los dos sentidos, de
  7 secciones a 2 y de 2 a 7, y nada sobresale más de los 10px del `-mx-2.5`.

- **Los anchos guardados no se rehacían al cambiar los rótulos.** Se medían una
  vez, así que un cambio de idioma con el grupo puesto contaba con los anchos
  del idioma anterior, y lo mismo pasaba con la tipografía que llega tarde.
  Ahora, si a las secciones a la vista les cambió el ancho, se muestran todas y
  se vuelven a medir. Medido: con rótulos más largos la fila pasa de 7 a 4 y al
  volver, a 7.

- **Antes de hidratar se veía la fila entera.** El recorte de la fila sin medir
  solo servía si la caja la recortaba, y en una fila flex no lo hacía. Ahora,
  sin medir, las secciones que no caben pasan a una segunda línea que no se ve:
  el primer pintado muestra enteras las que caben, y la hidratación solo añade
  el grupo y quita, como mucho, una.

- **El reparto tiene un tope de verdad.** Tres reaperturas seguidas sin que
  pase nada por fuera son la fila mordiéndose la cola, y ahí se para. Con una
  transición al lado que no cruza ningún umbral, 0 filas rehechas; antes, 8.

- **El despliegue de móvil cae debajo en una fila flex con `flex-wrap`.** Lleva
  `order-last basis-full`, que en un bloque no cambia nada. Sin `flex-wrap`, se
  queda en la línea, como antes.

La cabecera de la vitrina tiene ahora la marca, la fila y los accesos en una
misma línea, que es la forma que fallaba.

## `@calumet/elise-ui` 0.14.2

### Corrige

- **La fila no contaba el relleno que no estuviera en la raíz.** El sitio salía
  de `NavigationMenu`, así que un relleno puesto en un contenedor de en medio,
  que es como se arma cualquier cabecera, no se le descontaba: medido en una
  cabecera con `px-10` por dentro, contaba 1100px de sitio cuando los reales eran
  1020, no agrupaba nunca y la fila se salía por la derecha con barra de
  desplazamiento en la página. En un barrido de 226 anchos, 51 con barra. Ahora
  el sitio sale de la caja contra la que se resuelve el ancho de la fila, que
  incluye cualquier relleno de por medio.

  La cabecera de la vitrina tenía el relleno en la raíz, que es el único caso en
  el que esto no se veía; ahora lo lleva por dentro, como una de verdad. Con ese
  cambio, la versión anterior se sale en 44 de 61 anchos y esta en ninguno.

## `@calumet/elise-ui` 0.14.1

### Corrige

- **El reparto de secciones de la fila no tenía tope.** Cada cuenta pedía otra
  para medir el ancho del grupo, y nada cortaba la cadena: con cualquier cosa
  animada al lado de la barra la fila se rehacía entera cuadro a cuadro, y la
  cadena podía llegar al «Maximum update depth» de React. Medido, con una
  transición al lado: 58 filas rehechas en 6s, ahora 2. La cuenta se rehace solo
  cuando la anterior se hizo a ciegas (sin el ancho del grupo, o con todas
  mostradas para medirlas), y las dos condiciones se apagan solas.

- **El sitio disponible dependía de la propia cuenta.** Puesta como item
  flexible, la barra crecía con lo que llevaba dentro: medido, 1004px con las
  nueve secciones a la vista y 940 con el grupo, así que la decisión se mordía la
  cola. La raíz lleva ahora `min-w-0` y no la estira su contenido.

- **El ancho del grupo ya no se estima.** Arrancaba en 96 cuando el real son 65,
  y esa estimación solo se corregía con la pasada que ahora tiene tope.

- **En móvil se veía la fila de escritorio hasta que hidrataba.** Qué rama se
  pintaba lo decidía `useIsMobile`, que en el servidor no puede saber el ancho y
  devuelve `false`: medido con el HTML del servidor y sin JS a 390px, el teléfono
  pintaba la fila con los nueve rótulos, 36px de alto, y la cabecera medía 105px
  en vez de 69. Ahora las dos ramas se pintan siempre y decide el CSS, que es lo
  que hace falta para que el primer pintado ya sea el bueno.

  El disparador de respaldo, el que dibuja la fila cuando no pusiste un
  `NavigationMenuToggle`, se esconde por la misma razón con `:has()` y no
  contando disparadores en un contexto: en el servidor tampoco se sabe todavía
  cuántos hay. `NavigationMenu` deja de exponer ese contexto.

## `@calumet/elise-ui` 0.14.0

`ThemeScope` solo llevaba clases al panel, así que un tema declarado en
variables se quedaba en la sección. Un color de marca que sale de la base de
datos no se conoce cuando se compila el CSS y no se puede escribir como clase,
que es justo el caso para el que se hizo `ThemeScope`.

### Rompe

- **`useThemeScope` devuelve `{ clases, variables }` y ya no un `string`.** Quien
  lo use para llevar el tema a un panel propio pasa de `cn(tema, …)` a
  `cn(tema.clases, …)` más `style={{ ...tema.variables, ...style }}`.

### Cambia

- **`ThemeScope` lleva al panel también las variables escritas en el elemento,**
  vengan por `style` o por `applyTheme(tema, elemento)`. Las lee del elemento y
  no del `style` que recibe, así que da igual cuándo se escriban: si el color
  llega tarde, los paneles ya abiertos se repintan.

## `@calumet/elise-ui` 0.13.0

### Cambia

- **Nuevo `ThemeScope`, para que un tema por sección alcance a sus overlays.**
  Un `Dialog`, un `Popover` o un menú se monta en `body` por un portal, así que
  salía de la sección y se pintaba con el tema de la página. Lo que hay dentro de
  un `ThemeScope` se lleva el tema al panel sin mover el portal, que moverlo lo
  dejaría a merced del `overflow` y del `transform` de la sección.

  Alcanza a los trece paneles que salen por portal: `Dialog`, `AlertDialog` y
  `Sheet` con sus velos, `Popover`, `Select`, `Tooltip`, `DropdownMenu`,
  `Menubar` y `ContextMenu` con sus submenús. Sin `ThemeScope` alrededor no
  cambia nada.

## `@calumet/elise-ui` 0.12.2

### Corrige

- **La fila se quedaba compactada con sitio de sobra.** Los anchos de las
  secciones se medían una sola vez y quedaban congelados en cuanto aparecía el
  grupo, así que una medida tomada en mal momento (antes de que cargara la
  tipografía, o con la cabecera todavía estrecha) no se corregía nunca. Ahora se
  vuelven a medir cuando `document.fonts.ready` resuelve y cuando aparece más
  sitio que en la cuenta anterior.

  El sitio, además, vuelve a salir de la barra y no de la fila: a la fila la
  encoge su propio contenido cuando algo de arriba se ajusta a ella, y entonces
  la cuenta se muerde la cola.

- **Con render en servidor, la fila ya no asoma una barra de desplazamiento**
  hasta que hidrata: hasta la primera medida recorta en vez de desbordarse.

- **El grupo cambiaba de ancho según la sección que se abriera.** El panel de
  una sección desplegada contaba para el ancho de su contenedor, así que abrir
  una con un rótulo largo ensanchaba el grupo entero y el salto se veía: medido,
  de 256 a 275 en la vitrina. Ahora ese panel se mide a lo ancho por su
  contenedor y no por lo que lleva dentro, así que el grupo no se mueve.

  Como consecuencia, un rótulo largo dentro del grupo o del despliegue de móvil
  se parte en dos renglones en vez de estirar el panel.

## `@calumet/elise-ui` 0.12.1

### Corrige

- **El despliegue de móvil se encogía a su contenido.** `NavigationMenuList` le
  pasaba al panel el `className` de la fila, y un `flex` ahí dentro deja el
  submenú al ancho de su rótulo más largo: medido, 134px dentro de una barra que
  medía 352px. El panel ya no toma ese `className`, que describe una fila y no
  una columna.

  Con eso, **el relleno horizontal va en `NavigationMenu` y no en la fila**: el
  despliegue lo hereda, y así sus rótulos caen a plomo con los de la fila.

## `@calumet/elise-ui` 0.12.0

El realce al apuntar salía de un color fijo, y un color fijo da un salto
distinto en cada superficie: una tarjeta de KPI saltaba 0.114 de luminosidad y
un botón fantasma sobre el lienzo, 0.008. Ahora es una capa, y el salto es el
mismo en todas partes.

### Cambia

- **Nuevos `--state-hover` y `--state-active`,** que no son un fondo sino un
  velo encima de lo que haya debajo: negro al 3% y 6% en claro, blanco al 5% y
  9% en oscuro. Los porcentajes salen de reproducir el salto que ya daba la fila
  de tabla apuntada.

- **Pasan a usarlo los 159 elementos que se realzaban con un color fijo:** lo
  que usaba `--muted` como apuntado, pulsado, resaltado de menú o marca de
  desplegable abierto; la X de un `Chip`, que iba a `--border`; los botones de
  paginar, que iban al relleno terciario; y `Clickable`, que era el caso más
  llamativo.

  Medido en el catálogo, en luminosidad OKLCH:

  |                                | apuntado claro | apuntado oscuro | pulsado claro | pulsado oscuro |
  | ------------------------------ | -------------- | --------------- | ------------- | -------------- |
  | `Clickable` antes              | 0.114 a 0.130  | 0.139 a 0.183   | ~0.15         | ~0.21          |
  | `--muted` como apuntado, antes | 0.008 a 0.024  | 0.046 a 0.092   | igual         | igual          |
  | paginación antes               | 0.071          | 0.067           | 0.095         | 0.101          |
  | ahora, los tres                | 0.024          | 0.053           | 0.045         | 0.091          |

  El mismo token daba once veces más contraste en oscuro que en claro. El velo
  además se comporta igual sobre cualquier superficie: sobre la tarjeta 0.023,
  sobre el lienzo 0.022 y sobre una superficie tenue 0.022, donde el color fijo
  daba 0.024, 0.008 y 0.

Se quedan como estaban los realces con color propio, que son otra cosa: el
relleno de un botón de tono va a su `-hover` (0.038 a 0.048 en los dos temas),
la barra lateral tiene su propia escala porque es una región con su tema, y la
zona de soltar ficheros se tiñe de `--accent`.

## `@calumet/elise-ui` 0.11.0

`NavigationMenu` se rehace para la barra principal de un sitio. La del portal de
escuelas de COMA, con nueve secciones, se salía 305px del viewport a 768.

### Rompe

- **La fila deja de ser una caja.** Traía `border`, `bg-background` y `p-1`, que
  en una cabecera se ve como un control metido dentro de otro.

- **El disparador arranca en `foreground` y no en `muted-foreground`,** que es
  el trato de un enlace secundario y no el de la navegación principal.

- **El panel pierde el tope de 384px,** contra el que se apretaba cualquier
  megamenú de más de una columna. Ahora el tope es la barra.

- **La fila se sale 10px por lado** con un margen negativo, para que lo que caiga
  a plomo con la marca sea el rótulo y no la pastilla del hover. En una barra sin
  relleno, esa pastilla se sale.

- **`NavigationMenuItem` pasa a ser `relative`,** porque es el marco contra el
  que se coloca el panel.

### Cambia

- **Lo que no cabe se agrupa al final.** Los anchos se miden del layout ya
  pintado y no se estiman, porque el rótulo lo escribe quien usa el componente.
  Lo que se desborda no se desmonta, se vuelve a montar como submenú vertical,
  así que cada sección conserva su panel. Con las nueve del portal: 8 en la fila
  con 1056 de sitio, 7 con 1004, 5 con 804 y 4 con 672.

- **Por debajo de 768px la fila se cambia por un botón,** que abre las secciones
  en el sitio, debajo de la barra y empujando lo que siga, no en un panel encima
  de la página. Es el mismo corte que usa `AppShell`.

- **Nuevo `NavigationMenuToggle`,** para poner ese botón donde vayan el resto de
  acciones de la cabecera. Si no hay ninguno, la fila dibuja el suyo.

- **Nuevo `align` en `NavigationMenuContent`:** `start` (por defecto) y `end`
  abren bajo el disparador, `full` estira al ancho de la barra. Un `start` que se
  pasara del borde derecho se corre hacia adentro lo que se sale.

- **Nuevo `overflowLabel` en `NavigationMenuList`,** el rótulo del grupo. Por
  defecto «Más», o la clave `ui.more` si hay Provider de i18n montado.

- **Las animaciones pasan a los tiempos del sistema,** con dos fotogramas nuevos,
  `nav-down` y `nav-up`, para lo que se abre en el flujo.

## `@calumet/elise-ui` 0.10.1

Dos correcciones sobre botones de solo icono, las dos salidas de medir la
misma esquina.

### Corrige

- **El botón de cerrar no alineaba con lo que tiene enfrente.** Centrar un glifo
  de 16 en una caja pulsable más grande lo deja hundido por el colchón, así que
  el icono del tono de un `Alert` arrancaba a 13px del borde y su × acababa a 19. Medido: 6px de desfase en `Alert` y 4px en `Dialog`. Ahora los dos llevan
  un margen negativo del tamaño del colchón, que es la misma corrección que
  `Alert` ya aplicaba en el eje vertical y que había quedado a medias.

  `Sheet` tenía el defecto contrario: su × alineaba bien porque no tenía caja
  ninguna, y el área pulsable eran los 16×16 del propio glifo. Ahora son 28×28 y
  el glifo no se movió.

  El área pulsable de `Alert` y `Dialog` no cambia, y la posición del glifo de
  `Sheet` tampoco. Cierra [#42](https://github.com/calumet/elise/issues/42).

- **Los botones de solo icono llegan a 24px de área pulsable.** La × de `Chip`
  medía 16×16 y `AppShellNavAction` y el «limpiar» del `Combobox` 20×20, por
  debajo del mínimo de WCAG 2.2. Lo que crece es solo el área: la caja que se ve
  sigue midiendo lo mismo y no se mueve nada de sitio, porque la zona extra la
  pone un pseudo-elemento posicionado. Medido con `elementFromPoint`: los tres
  reciben el clic en 24×24.
  Cierra [#43](https://github.com/calumet/elise/issues/43).

## `@calumet/elise-ui` 0.10.0

La paleta pasa a salir del logo de Calumet. Sube la minor porque cambia el
aspecto de todo lo que consume el catálogo, y porque un relleno cambia de claro
a oscuro.

### Rompe

- **`--warning` era ámbar claro con texto oscuro y ahora es ocre con texto
  blanco.** Quien pintara su propio texto sobre `bg-warning` se queda con texto
  oscuro sobre un relleno oscuro. Lo que use `text-warning-foreground` no tiene
  que hacer nada.

- **Lo que usaba `--primary` como tinta pasa a otros tokens.** `Link` va a
  `--link`, y el icono de elegido del `Combobox`, el número del paso actual del
  `Stepper` y `Text tone="primary"` van a `--accent-foreground`. Un consumidor
  que escribiera `text-primary` a mano sigue teniendo el token, pero sobre fondo
  oscuro ya no se lee: ahí `--primary` es un navy de relleno.

### Cambia

- **El primario es el navy del logo, sin retocar:** `oklch(0.252 0.156 265)`,
  que es `#020b6b`. El que había, `oklch(0.55 0.19 262)`, estaba a 0.004 de
  luminosidad y 0.9° de tono del azul por defecto de shadcn y de Tailwind
  blue-600. Era, literalmente, el azul de todo el mundo.

  En claro entra entero: 16.63:1 con texto blanco y 15.93:1 como anillo de foco.
  Como es casi negro, `hover` y `active` aclaran en vez de oscurecer, que es lo
  que hace cualquier botón de ese peso; oscureciendo, los tres estados quedaban
  a menos de dos niveles de distancia entre sí.

- **`--destructive` es el rojo de las plumas** (`oklch(0.479 0.175 27)`,
  `#aa1f1e`) y **`--warning` el ocre del amarre** (`oklch(0.532 0.112 56)`,
  `#9c5921`), los dos tal cual salen del logo. El tono ya coincidía casi exacto
  en los dos casos; lo que sobraba era saturación: el rojo estaba 29% por encima
  y el aviso al doble.

- **Nuevos `--link`, `--link-hover` y `--link-active`.** Un color de relleno y
  uno de texto no pueden ser el mismo token: sobre fondo oscuro el navy necesita
  llegar a L 0.60 para leerse como texto, y a esa altura el relleno vuelve a ser
  un azul cualquiera. Lo encontró la auditoría, con diecisiete enlaces a 2:1.

- **En oscuro `--ring` se separa de `--primary`.** El relleno se queda navy
  (`oklch(0.42 0.156 265)`, lo más profundo que sigue leyéndose como plancha
  contra el fondo) y el anillo sube a `oklch(0.65 0.15 265)` para cumplir sus
  3:1. El navy puro no sirve allá: da 1.15:1 contra el fondo y el botón se
  disuelve en la página.

- **`--warning` y `--success` son el mismo valor en los dos temas.** Contra el
  fondo oscuro dan 3.51:1 y 3.67:1, así que no necesitan una versión por tema.

Los grises no se tocan: el gris del logo es neutro (croma 0.004) y el del
catálogo ya lo era.

## `@calumet/elise-linter` 0.2.0

### Agrega

- **`react/jsx-pascal-case` en `error`.** El preset `react` aplica el
  `recommended` de `eslint-plugin-react`, que la deja apagada, así que los
  nombres de componente no los comprobaba nadie. Quien consume el preset la
  hereda, `tailwind` incluido; `base` no cambia. Medida sobre este repositorio
  no marca ni un archivo.

  `react/no-multi-comp`, un componente por archivo, se evaluó junto con ella y
  queda fuera del preset: marca 224 avisos, 202 de ellos en `elise-ui`, donde un
  archivo publica el componente compuesto entero. El anfitrión que la quiera la
  añade en su propia config, y el cómo está en
  [docs/linter.md](docs/linter.md).

  Cierra [#39](https://github.com/calumet/elise/issues/39).

## `@calumet/elise-ui` 0.9.0, `elise-tables` 0.3.0, `elise-toasts` 0.4.0 y `elise-alerts` 0.3.0

### Agrega

- **Cada hoja dice dónde está su código.** Montar Elise pedía una ruta escrita a
  mano por paquete instalado, y otra distinta según el registro: el código
  compilado vive en `dist` desde GitHub Packages y en `jsr` desde JSR. Tailwind
  resuelve cada `@source` contra el archivo que lo declara, no contra el CSS de
  la app, así que ahora los declaran `elise.css` y el `tailwind.css` nuevo de
  `elise-tables`, `elise-toasts` y `elise-alerts`, y siguen siendo válidos desde
  dentro de `node_modules`. Un `@source` que apunta a una carpeta inexistente se
  ignora sin error, así que las dos rutas conviven en la misma hoja y el snippet
  es el mismo en los dos registros. Tampoco hay que repetir
  `@import "tailwindcss"`: la hoja ya lo trae, y la detección automática de
  Tailwind sigue anclada al CSS de la app, no al de la librería.

  ```
  antes   @import "tailwindcss";
          @import "@calumet/elise-ui/tailwind/elise.css";
          @source "../node_modules/@calumet/elise-ui/dist";
          @source "../node_modules/@calumet/elise-tables/dist";

  ahora   @import "@calumet/elise-ui/tailwind/elise.css";
          @import "@calumet/elise-tables/tailwind.css";
  ```

  Sigue habiendo una línea por paquete instalado, y ese es el piso: Tailwind
  resuelve los enlaces de pnpm al directorio real del store, donde una hoja no
  ve a sus hermanas. El montaje viejo no se rompe; un `@source` repetido solo
  escanea dos veces.

- **`@calumet/elise-ui/styles.css`, el sistema ya compilado.** Un import en el
  punto de entrada de la app y no hay nada que configurar: ni Tailwind, ni
  plugin de Vite, ni `@source`. Son 105 KB minificados que el `build` del
  paquete arma con el CLI de Tailwind desde `src/tailwind/standalone.css`, y
  cubren también `elise-tables`, `elise-toasts` y `elise-alerts`.

  A cambio, los tokens del sistema no quedan disponibles para el marcado propio
  de la app; para eso está la vía con Tailwind. Las tipografías siguen aparte en
  `fonts.css`, porque sus `url()` apuntan a los archivos de Fontsource dentro
  de `node_modules` y esas rutas no sobreviven al publicado.

## `@calumet/elise-ui` 0.8.1

Tres correcciones, todas del mismo tipo: cosas que el componente no resolvía y
cada pantalla tenía que acordarse de hacer bien.

### Corrige

- **El rótulo de una pestaña se partía en dos renglones.** `TabsTrigger` no
  llevaba `whitespace-nowrap`, así que dentro de la fila flex encogía hasta su
  ancho de contenido mínimo, que en una etiqueta de dos palabras es la palabra
  más larga. Medido a 320, 360 y 414: «Actas y decisiones» pasaba de 157px a 105,
  el ancho de «decisiones», y se partía dentro de una caja de 40px de alto. Es el
  mismo defecto que se corrigió en `Button` y la misma pareja que ya llevan
  `Badge` y `SegmentedControl`.

- **La fila de pestañas se desborda donde no cabe.** Cuatro pestañas piden 514px
  y el área de contenido de un móvil de 360 da 320, así que dos quedaban fuera de
  la pantalla, sin desplazamiento ni nada que lo indicara. Ahora se desplaza a lo
  ancho, como ya hacían `Table` y el `Stepper` horizontal. El recorte vive en una
  envoltura nueva, `data-slot="tabs-list-scroll"`, y no en la propia lista,
  porque `overflow-x` arrastra a `overflow-y` y ahí el anillo de foco de una
  pestaña salía cortado por los cuatro lados. La lista sigue siendo el mismo
  elemento con las mismas clases; lo único que cambia para quien ya la usaba es
  que deja de ser hija directa de su contenedor. De 768 para arriba la fila se
  dibuja idéntica píxel a píxel.

- **Sin navegación, el botón del cajón dejaba la pantalla muerta.** Un marco de
  un solo registro no lleva `AppShellNav`, y ahí el botón se dibujaba igual por
  debajo del breakpoint. Pulsarlo no era inocuo: `AppShellMain` mira
  `cajonAbierto` para volverse inerte, así que el contenido dejaba de responder
  sin velo ni cajón que explicaran por qué, y en un teléfono no hay Escape que lo
  recupere. Ahora `AppShellNav` se anuncia al marco al montarse: sin ninguna, el
  botón no se dibuja y el contenido no puede quedar inerte. Con navegación, el
  cajón, el velo y el estado inerte se comportan igual que antes.

## `@calumet/elise-ui` 0.8.0

Sube la minor porque cambia la forma del marco y con ella lo que `AppShell`
acepta como hijo.

### Rompe

- **`AppShell` es una rejilla y cada parte declara su celda.** Era una columna
  flex con un nodo intermedio, `data-slot="app-shell-body"`, que ya no existe:
  una regla que lo apuntara se queda sin blanco. Un hijo que no sea una de las
  partes tampoco cae solo en su sitio; para ocupar el área de contenido necesita
  `col-start-2 row-start-2`, que es lo que ya trae `AppShellMain`.

### Corrige

- **La cabecera se puede envolver.** `AppShell` la buscaba entre sus hijos por
  `displayName` para dejarla fuera de la fila de contenido, así que una
  `<CabeceraDeLaApp />` propia que por dentro emitiera un `AppShellHeader` caía
  dentro de esa fila, al lado de la navegación y encogida a lo que sobrara.
  Ahora cada parte lleva su celda escrita y el marco no mira a sus hijos.
  Medido con la cabecera, la navegación y el contenido envueltos cada uno en dos
  componentes: las cuatro cajas dan lo mismo que sin envolver a 360, 768 y 1280,
  en LTR y en RTL, con el cajón abierto y cerrado, y sin envolver la captura es
  idéntica píxel a píxel a la de 0.7.1.
  Cierra [#25](https://github.com/calumet/elise/issues/25).

## `@calumet/elise-ui` 0.7.1

### Corrige

- **Las bandas de la cabecera y el pie de la navegación se pueden envolver.**
  `AppShellHeader` repartía sus hijos mirándoles el `displayName`, así que una
  banda sacada a un componente propio no caía en su columna sino junto a la
  marca. `AppShellNav` hacía lo mismo con su pie. Ahora la cabecera es una
  rejilla y cada banda declara su columna, y el pie se ancla con `sticky`; un
  componente de React no agrega nodo al DOM, de modo que envolver deja de
  importar. Medido: envuelta o no, la marca cae en la columna 1, el buscador en
  la 2 y las acciones en la 3, con la misma geometría que antes a 360, 768 y 1280.

  Queda fuera el tercer sitio, `AppShell` buscando su cabecera entre los hijos:
  la fila de contenido es un nodo real del que cuelgan el cajón y su velo, y
  moverla pide rehacer el marco en rejilla.
  Adelanta [#25](https://github.com/calumet/elise/issues/25).

## `@calumet/elise-ui` 0.7.0

Sube la minor porque hay dos cambios que rompen: por debajo de la 1.0 es ahí
donde van.

### Rompe

- **`Input` deja de aceptar el `size` nativo del HTML.** Ahora `size` es el paso
  de la escala y no el ancho en caracteres. Quien usara el atributo tiene que
  pasar a `className` con el ancho que quiera, que además es lo que ya hacía
  falta: `CAMPO_DESNUDO` existe justamente para anular el ancho por defecto de
  veinte caracteres que el atributo impone.

- **`Sheet` toma las tres zonas de `Dialog`.** Cabecera y pie sobre banda tenue
  con su filete, cuerpo en blanco. El panel pierde el hueco de 16px que separaba
  sus partes y pasa de `bg-background` a `bg-card`, que es la superficie sobre
  la que esas zonas están calibradas. Un panel que arme su cuerpo a mano se ve
  distinto hasta que se mude a `SheetBody`.
  Cierra [#27](https://github.com/calumet/elise/issues/27).

### Agrega

- **`Input` y `SelectTrigger` aceptan `size`**, con la misma escala que
  `ComboboxTrigger` y `Button`. Un campo y un botón `sm` en la misma barra de
  herramientas medían 36 contra 32; ahora los cuatro controles miden lo mismo en
  los cuatro pasos, medido: 32, 36, 40 y 44.
  Cierra [#23](https://github.com/calumet/elise/issues/23).

- **La escala gana el paso táctil, `xl`,** 44px, que es el mínimo de área de
  toque y al que no llegaba ninguno de los otros tres. Sale en los cuatro
  controles, `Button` incluido.

- **`SheetBody`.** El cuerpo desplazable del panel, que antes armaba cada
  pantalla.

- **`TAMANOS_CAMPO` y `TamanoCampo`**, exportados desde `input`. Es la escala,
  en un solo sitio, y de ahí la toman `SelectTrigger` y `ComboboxTrigger`.

### Corrige

- **`SelectTrigger` tenía su propia copia de la caja de campo.** Repetía el
  literal en vez de usar `CAJA_CAMPO`, que es de donde salen el borde, el radio,
  el foco y el apagado del resto de los campos.

## `@calumet/elise-ui` 0.6.2, `elise-toasts` 0.3.2, `elise-alerts` 0.2.3 y `elise-tables` 0.2.3

### Corrige

- **El enlace entre paquetes se publicaba clavado a una versión exacta.** Los
  cuatro declaraban sus dependencias del monorepo con `workspace:*`, que al
  publicar se traduce a la versión que tuviera el otro en ese momento. Así,
  `elise-toasts@0.3.1` salió pidiendo `elise-ui@0.6.1` clavado, y cualquier
  parche de `elise-ui` dejaba un aviso de peer sin cumplir en cada
  `pnpm install`. Con `workspace:^` la traducción pasa a `^0.6.1`, que es el
  rango que el propio CHANGELOG venía anotando en prosa.

  Comprobado sobre el tarball, antes y después:

  ```
  antes   "@calumet/elise-ui": "0.6.1"
  ahora   "@calumet/elise-ui": "^0.6.1"
  ```

  Alcanza a `dependencies` y a `peerDependencies`. Ninguna API cambia; lo que
  cambia es lo que va dentro del paquete publicado.
  Cierra [#28](https://github.com/calumet/elise/issues/28).

## `@calumet/elise-ui` 0.6.1

### Corrige

- **`Button` partía y recortaba su rótulo dentro de una fila flex.** Llevaba
  `overflow-hidden` sin `whitespace-nowrap`, y las dos se necesitan juntas: sin
  recorte el rótulo desborda, y sin `nowrap` se parte antes de desbordar.
  Medido a 360px con un rótulo de dos palabras: el botón bajaba de 105px a 82,
  el rótulo pasaba a dos renglones y el bloque de texto llegaba a 37px de alto
  dentro de una caja de 32, así que el segundo renglón se cortaba. Es la misma
  pareja que ya llevaban `Badge` y `SegmentedControl`.
  Cierra [#24](https://github.com/calumet/elise/issues/24).

- **El ejemplo de `AppShellHeader` escondía el botón del cajón.** Lo ponía
  dentro de `AppShellHeaderBrand`, que no se pinta por debajo del breakpoint,
  que es justo donde el cajón existe; por encima se esconde el botón. Medido:
  invisible a 360px y a 1280. El ejemplo pasa a ponerlo suelto, como ya hacían
  el docstring de la marca, la vitrina y `docs/componentes.md`.
  Cierra [#26](https://github.com/calumet/elise/issues/26).

## `@calumet/elise-ui` 0.6.0

### Agrega

- **`Combobox` acepta `modal` y lo reenvía al `Popover`.** También lo aceptan
  `MultiCombobox`, `ComboboxField` y `MultiComboboxField`. Dentro de un
  `Dialog`, el bloqueo de scroll del diálogo cancelaba la rueda sobre la lista,
  que solo se recorría con las flechas o arrastrando la barra. Medido sobre una
  lista que desborda: sin `modal` el desplazamiento se queda en 0 tras una
  rueda de 200px; con `modal` llega a 200. Fuera de un diálogo no cambia nada.
  Cierra [#21](https://github.com/calumet/elise/issues/21).

- **`ComboboxItem` y `ComboboxOption` aceptan `level`.** Para una lista que
  aplana un árbol. La raíz es 0 y cada nivel sangra 16px, la misma medida que
  `Tree`. `group` no cubría el caso: agrupa en un solo escalón y con encabezado,
  y un árbol tiene profundidad arbitraria y padres que también se eligen. La
  sangría va en el contenido de la fila, así que el resaltado del teclado sigue
  midiendo lo mismo a cualquier profundidad.
  Cierra [#22](https://github.com/calumet/elise/issues/22).

## `@calumet/elise-ui` 0.5.3

### Corrige

- **La superficie invertida se daba vuelta en el tema oscuro.** `--inverse` era
  `var(--foreground)`, de modo que en oscuro salía casi blanca y el toast
  aparecía como un panel claro encima de una pantalla oscura. El tema oscuro
  declara ahora la suya, un escalón por encima de `--popover`, que es la capa
  que le corresponde a lo que va encima de todo. En claro no cambia nada.

  De paso, los iconos teñidos del toast dejan de estar calibrados contra el
  fondo equivocado en oscuro. Contra el disco que llevan detrás: info 2.51 →
  3.85, advertencia 1.57 → 5.96, éxito 2.13 → 4.49. El de error baja de 3.42 a
  2.94, que es el único que queda por debajo de 3:1.

## `@calumet/elise-ui` 0.5.1

### Corrige

- **`Button` con `asChild` fallaba siempre al renderizar.** El estado de carga
  emitía dos hijos, el hueco del spinner y el contenido, con un `null` en medio
  cuando no había carga. `Slot` de Radix cuenta ese `null` como un hijo más y su
  `Children.only` rechaza el conjunto, así que cualquier `<Button asChild>`
  reventaba. Nadie lo usaba dentro del repo, así que el camino no se había
  ejecutado nunca. Ahora las dos capas van dentro de una sola expresión y, sin
  carga, el hijo pasa solo.

- **Los iconos dentro de `Button` no llevaban tamaño acotado.** Los de Lucide
  vienen a 24px y al lado de un rótulo de 13–14px se leen como otra jerarquía.
  Se agrega la regla que ya llevaban `Badge`, `Alert`, `DropdownMenu`, `Command`
  y `Sidebar`: `[&_svg:not([class*='size-'])]:size-4`. El `:not` deja pasar un
  tamaño explícito para quien lo necesite.

## `@calumet/elise-ui` 0.5.0

### Rompe

- **La tarjeta pasa a 16px de relleno y 12px entre su cabecera y su cuerpo.**
  Antes eran 24 y 24. Los 12px son los que `FormRow`, `RadioGroup` y
  `CheckboxGroup` ya usan entre campos, así que una tarjeta de formulario queda
  con un solo ritmo vertical. Alcanza a `Card`, `Section` y a todo lo que se
  apoye en ellos. Una pantalla que compensara el relleno viejo con márgenes
  propios queda apretada.

### Agrega

- **`Clickable`.** Una caja entera que se pulsa, con lo mismo que acepta `Box`.
  Con `href` sale un `<a>` y sin él un `<button>`.
- **`Image` y `Thumbnail`.** La imagen exige `alt`, difiere la carga y reserva
  el hueco con `aspectRatio`. La miniatura es cuadrada en 24, 40, 60 y 80.
- **`Section`.** Un grupo con rótulo, como `<section>` con nombre accesible.
  Es el envoltorio opinado sobre `Card`.
- **`CheckboxGroup`.** El rótulo, la ayuda y el error de un grupo de casillas.
- **`ButtonGroup`**, con `attached` para juntar los botones en una pieza.
- **`List` y `ListItem`**, con marcador y sangría propios.
- **`Table` gana `empty`**, lo que ocupa el sitio de las filas cuando no hay
  ninguna. La barra de filtros se queda en pie y la franja de paginar no se
  pinta.
- **`Button` gana `size="icon-sm"`**, el cuadrado de 32px que iguala el alto de
  `sm`.
- **`Card` y `CardTitle` ganan `as`**, para que una tarjeta pueda salir como
  `<section>` con su `<h2>`.

### Arregla

- **La tarjeta y la tabla tenían contornos distintos.** La tabla usaba el bisel
  de cuatro capas y la tarjeta un borde plano con `shadow-sm`. Las dos comparten
  ahora `SUPERFICIE`, que se muda a `lib`.
- **El cuerpo del `Alert` partía las frases.** Era una columna flex, así que un
  texto con un enlace dentro salía en un renglón por trozo.
- **La cabecera de la tarjeta dejaba una fila vacía.** Declaraba dos filas
  siempre, así que una tarjeta con título y sin descripción sumaba el hueco de
  la fila que no existía debajo del rótulo.
- **`Section` con `padding="none"` reescribía el hueco de la tarjeta.** Fijaba
  el suyo en 16px, y con eso una sección sin relleno separaba distinto que una
  con relleno.

## `@calumet/elise-toasts` 0.3.0

### Rompe

- **`title` y `description` pasan a ser obligatorios en `toast()`.** El icono va
  en un disco de 28px y cada renglón de texto mide 20, así que un aviso de una
  sola línea dejaba el disco por debajo del titular. Un `toast({ title })` a
  secas deja de compilar.

  ```ts
  // antes
  toast({ title: "Guardado" });

  // ahora
  toast({ title: "Guardado", description: "Cambios sincronizados." });
  ```

No necesita nada nuevo de `@calumet/elise-ui`.

## `@calumet/elise-ui` 0.4.0

Sube la minor y no la patch porque hay cinco cambios que rompen: por debajo de
la 1.0 es ahí donde van.

### Rompe

- **Los tres controles marcables son campos.** `Switch`, `Checkbox`,
  `RadioGroup` y `RadioGroupItem` traen su propio rótulo, ayuda y error, con el
  enlace de accesibilidad resuelto. `label` es obligatorio, y dejan de aceptar
  las props crudas del primitivo de Radix. `RadioGroupItem` tampoco acepta ya
  hijos sueltos: el texto va en `label`.

  ```tsx
  // antes
  <div className="flex items-center gap-2">
    <Checkbox id="acepta" />
    <Label htmlFor="acepta">Acepto</Label>
  </div>

  // ahora
  <Checkbox label="Acepto" />
  ```

  En los radios, el rótulo, la ayuda y el error pasan al **grupo**, porque la
  pregunta se hace una vez y las opciones son las respuestas. Cada opción
  conserva su `description` y puede señalarse con `invalid`.

- **`AlertDialog` usa el marco de `Dialog`.** Cabecera y pie sobre banda tenue,
  cuerpo en blanco. Entra `AlertDialogBody`, y la descripción tiene que mudarse
  ahí: dentro de `AlertDialogHeader` quedaría sobre el gris. El ancho por
  defecto baja de 480px al estrecho de la escala, 380px.

- **`ScrollArea` deja de dibujar su barra.** Es un `div` con `overflow-auto`,
  así que sus props pasan de las del primitivo de Radix (`type`,
  `scrollHideDelay`, `dir`) a las de un `div`. Sale la dependencia
  `@radix-ui/react-scroll-area`.

- **Las entradas de navegación con hijas van dentro de `AppShellNavGroup`.**
  Escritas como hermanas, un `<ul>` colgaba directamente de otro `<ul>`. El
  grupo es el dueño del `<li>` y recibe la fila y la lista.

  ```tsx
  // antes
  <AppShellNavItem …>Clientes</AppShellNavItem>
  <AppShellNavSubList>…</AppShellNavSubList>

  // ahora
  <AppShellNavGroup defaultOpen>
    <AppShellNavItem …>Clientes</AppShellNavItem>
    <AppShellNavSubList>…</AppShellNavSubList>
  </AppShellNavGroup>
  ```

- **`AvatarFallback` hereda el tamaño de texto del `Avatar`** en vez de fijar el
  suyo. Un fallback con tipografía propia tiene que declararla.

- **Cambia el aspecto, no la API.** El valor de `--muted` sube y con él el
  encabezado de las tablas y las filas apuntadas. Las tres zonas del diálogo
  pasan a 16px de relleno a los costados, antes 20. Las fichas del
  `MultiCombobox` dejan de ser un `Badge` y toman la forma de `Chip`. El
  deslizador y el interruptor apagado usan `--track` y ya no un gris de
  superficie.

### Agrega

- **Primitivas.** `Link`, `Code` y `Kbd`.
- **Marco de aplicación.** `AppShell` y sus diecisiete partes, incluidas
  `AppShellNavGroup`, `AppShellNavAction`, `AppShellNavFooter`,
  `AppShellHeaderBrand`, `AppShellHeaderSearch`, `AppShellHeaderActions`,
  `AppShellHeaderAction` y `AppShellUserMenu`.
- **Campos.** `DateField`, `TimePicker`, `NumberField`, `SearchField`,
  `TagInput`, `Rating`, `SegmentedControl`, `ColorPicker` e `InlineError`.
- **Datos.** `Stat`, `DescriptionList`, `Timeline`, `Tree` y `AvatarGroup`.
- **`Chip`**, separado de `Badge`: el badge es un estado que el sistema afirma y
  el chip un dato que alguien puso y puede quitar. No existe un `Tag`.
- **`Table` cierra su contrato**: `variant` con los tres modos, `listSlot` y
  `format` por columna, `paginate`, `loading`, `clickDelegate` y la ranura
  `filters`. `DataTable` de `@calumet/elise-tables` pasa por ellos y ya no
  duplica la tarjeta ni la paginación.
- **`Pagination`** gana `variant="table"` y `end`, más `PaginationFirst`,
  `PaginationLast`, `PaginationStep` y `PaginationLabel`.
- **`Field`** gana `labelHidden`, y exporta `useFieldIds` y `FieldRequiredMark`
  para que otro campo con su propia maquetación no copie el cableado.
- **`Avatar`** gana `size` en cuatro pasos y `shape` en redondo o cuadrado, con
  el radio emparejado al tamaño. El 40 redondo sigue siendo el de por defecto.
- **Tokens.** Seis capas de apilado con nombre (`z-sticky`, `z-overlay`,
  `z-modal`, `z-popover`, `z-tooltip`, `z-toast`) y `--track`, el tramo sin
  llenar de un control que muestra un estado o un recorrido.
- **`DropdownMenuItem` mide sus iconos**, que antes salían a su tamaño natural y
  estiraban la fila.

### Arregla

- **El interruptor apagado y el deslizador sin llenar eran invisibles.** Medían
  1.07:1 contra la tarjeta en claro y 1.14:1 en oscuro. Con `--track` suben a
  3.11:1 y 3.60:1, por encima del 3:1 que pide un control.
- **`AppShell` montaba el mismo `<nav>` dos veces**, así que cualquier `id` que
  se le pasara salía duplicado y había dos landmarks de navegación. Ahora es uno
  y lleva nombre accesible.
- **`AppShellMain` podía quedar inerte para siempre.** El guardia de ancho solo
  escuchaba el cambio de breakpoint y no miraba el ancho al montar, de modo que
  montar con el cajón abierto por encima de 768px dejaba el contenido
  inalcanzable a la vista.
- **La lista de hijas plegada seguía en el tabulador**, así que se llegaba a
  enlaces invisibles.
- **La guía de continuidad no se reflejaba en RTL**: el codo nacía del lado
  equivocado y la punta señalaba fuera de la barra.
- **Las bandas de la cabecera colapsaban por debajo de 600px** y su contenido se
  salía por encima del buscador.
- **El error de un campo no llevaba icono** salvo dentro de `Field`. Ahora todos
  usan `InlineError`.
- **Una fila de la tabla parpadeaba con un filete casi negro** al reordenar.
- **El desplazamiento no era el mismo en toda la página.** La lista del
  `TimePicker` y `ScrollArea` dibujaban una barra propia que se escondía en
  reposo, mientras la página y los desplegables usan la nativa.
- **Cinco componentes no cabían en una columna estrecha** y su contenido se
  pintaba encima de lo de al lado. Los campos compuestos (`NumberField`,
  `SearchField`, `TimePicker`) no bajaban de 305px, porque el ancho por defecto
  de un `<input>` son veinte caracteres y ese era el mínimo de la caja entera.
  El `SegmentedControl` pedía la suma de sus rótulos, y siendo la pieza más
  ancha de una rejilla se llevaba consigo el ancho de todas las columnas; ahora
  sus opciones encogen. El `OTPField` se envuelve, el `Stepper` horizontal se
  desplaza, y la franja de paginar reparte en dos renglones antes de sacar el
  «filas por página» fuera de la tabla.

## `@calumet/elise-tables` 0.2.0

Ninguna prop cambia; lo que cambia es lo que se ve, y por eso sube la minor.

- **`DataTable` deja de armar su propia tarjeta.** Pasa por `variant`, `paginate`
  y `loading` de `Table`, que antes duplicaba con su propio marco y su propia
  franja de paginación. Dos tablas seguidas ya no se ven de sistemas distintos.
- **El «filas por página» se muda dentro del pie**, junto a los pasos, en vez de
  quedar suelto encima de la tabla.
- Requiere `@calumet/elise-ui` 0.4.

## `@calumet/elise-alerts` 0.2.0

`openAlert`, `closeAlert` y `AlertHost` no cambian de firma.

- **El diálogo toma las tres zonas de `AlertDialog`**: el título en la banda de
  arriba y la pregunta, con su icono, en el cuerpo. Antes iban los dos juntos.
- Se estrecha, porque el ancho por defecto de `AlertDialog` baja a 380px.
- Requiere `@calumet/elise-ui` 0.4.

## `@calumet/elise-toasts` 0.2.0

- **El aviso va invertido.** Llega encima de una pantalla llena de tarjetas, y
  otra tarjeta blanca más se confunde con ellas; invertirlo lo despega sin
  recurrir a un color de estado, que ahí significaría otra cosa. Cambian también
  el radio, el relleno y el ancho máximo.
- Requiere `@calumet/elise-ui` 0.4.

## `@calumet/elise-ui` 0.3.0

`Accordion`, `Checkbox`, `RadioGroup`, `Switch`, `Toggle`, `ToggleGroup`,
`Progress` y `Separator` pasan de una implementación propia al primitive de
Radix que la documentación ya les atribuía.

### Rompe

- **`Dropdown` y su familia se retiran.** La variante basada en `<details>`
  duplicaba lo que hace `DropdownMenu` sin llegar a su comportamiento: sin foco
  itinerante, sin cierre al pulsar fuera y sin `data-state`. `DropdownMenu`
  cubre los mismos casos, incluidos encabezado y separador. El subpath
  `@calumet/elise-ui/dropdown-native` deja de existir.
- **`Checkbox` y `Switch` dejan de ser un `input`.** Son un `button` con
  `role="checkbox"` o `role="switch"`. `checked`, `defaultChecked`,
  `onCheckedChange`, `name`, `value`, `disabled` y `required` siguen igual, y
  con `name` se emite un input oculto para que un formulario nativo los envíe.
  `onChange` ya no llega.
- **Un rótulo envolvente deja de activarlos.** `<label><Checkbox />Texto</label>`
  funcionaba porque el input estaba dentro. Con un `button` hay que enlazarlo,
  con `<Checkbox id="x" />` junto a `<Label htmlFor="x">`.
- **`RadioGroupItem` ya no acepta props de `input`.** Recibe `value`,
  `disabled`, `required` e `id`.

### Agrega

- `Accordion` respeta `collapsible`, que antes se aceptaba sin efecto.
- `Checkbox` acepta `checked="indeterminate"`.
- `RadioGroup`, `ToggleGroup`, `Switch` y `Toggle` aceptan modo controlado.
- `ToggleGroup` y `RadioGroup` son una sola parada de tabulación, y las flechas
  recorren las opciones.
- `Progress` acepta `value={null}` para una espera de duración desconocida.
- Los ocho aceptan `asChild` y publican su `data-state`.
- `data-slot` en los 109 sub-componentes que no lo tenían, de modo que
  `has-data-[slot=…]` sirve en todo el catálogo.
