# Publicar en JSR

Los paquetes se publican en dos registros desde el mismo commit: GitHub Packages
recibe el build de tsup, y [JSR](https://jsr.io/@calumet) recibe el fuente
TypeScript sin compilar. Los dos jobs viven en
[`.github/workflows/publish.yml`](../.github/workflows/publish.yml) y corren en
cada push a `master`; cada registro se salta las versiones que ya tiene, así que
publicar es subir el `version` del paquete y mergear.

## Cómo está armado

`deno.json` en la raíz declara el workspace, y cada paquete tiene el suyo con su
nombre, versión y entrypoints. Un solo `jsr publish` desde la raíz sube los ocho.

Dos cosas viven en la raíz y no en los paquetes, porque Deno ignora
`compilerOptions` de los miembros de un workspace y separar las dos mitades del
mismo ajuste de JSX invita a que alguien toque una y deje la otra atrás:

- `compilerOptions.jsx`, sin lo cual no se puede publicar `.tsx`.
- El mapeo de `react` y `react-dom`. Entran por `peerDependencies`, que ni Deno
  ni JSR leen, y sin el mapeo el publish corta con `not a dependency and not in
import map`.

Antes de subir nada, la simulación completa:

```bash
pnpm install          # Deno resuelve contra node_modules
pnpm jsr:check
```

## Qué exige JSR del código

JSR analiza los tipos sin correr `tsc`, así que la API pública tiene que estar
escrita, no inferida. Lo que sale del dry-run como error:

- **Tipo de retorno explícito** en toda función exportada, componentes
  incluidos: `function Alert(props: AlertProps): React.JSX.Element`.
- **Tipo explícito** en toda constante exportada. Para `forwardRef` la firma es
  `React.ForwardRefExoticComponent<React.PropsWithoutRef<Props> & React.RefAttributes<Elemento>>`.
- **Sin ampliaciones globales.** Nada de `declare module` ni `declare global`:
  cambian los tipos de un módulo desde fuera. Por eso `@calumet/elise-tables`
  exporta su propio `ColumnDef` con el `meta` tipado en vez de ampliar el de
  TanStack.
- **Sin `export =` ni `import ... = require(...)`**, solo ESM.

`@calumet/elise-linter` sale con un warning por ser JavaScript sin declaraciones.
Es un paquete de configuración de ESLint y Prettier, no una librería de tipos:
el warning no bloquea el publish y no vale la pena reescribirlo en TypeScript
para callarlo.

## Lo que no se puede publicar en JSR

Las hojas de estilo. JSR rechaza cualquier export que no sea un módulo
JavaScript o TypeScript, y también rechaza un `import "./elise.css"` desde un
módulo:

```
error: Expected a JavaScript or TypeScript module, but identified a Css module.
```

Es una funcionalidad que no existe todavía
([jsr-io/jsr#293](https://github.com/jsr-io/jsr/issues/293),
[#987](https://github.com/jsr-io/jsr/issues/987)). Los `.css` sí viajan dentro
del paquete por `publish.include`, así que quien instale desde JSR los importa
por su ruta en `node_modules`; el subpath `@calumet/elise-ui/tailwind/elise.css`
solo funciona instalando desde GitHub Packages. Está en el
[README](../README.md#consumir-los-paquetes).

## Alta de un paquete nuevo

Publicar desde CI no necesita ningún secreto -- el job se autentica con el token
OIDC de GitHub Actions -- pero sí necesita dos pasos manuales por paquete, una
sola vez:

1. Crearlo en [jsr.io/new](https://jsr.io/new) dentro del scope `@calumet`. El
   nombre admite hasta 20 caracteres, en minúsculas, números y guiones.
2. Enlazarlo al repositorio desde la pestaña _Settings_ del paquete en jsr.io.
   Sin ese enlace JSR no acepta el token OIDC y el job falla con un error de
   autenticación.

Y en el repositorio: agregar el paquete a `workspace` en el `deno.json` de la
raíz, y darle su propio `deno.json`.

## El score

JSR puntúa cada paquete sobre 17 y usa el número para ordenar las búsquedas. El
desglose de cada uno está en su pestaña _Score_, y también en
`https://api.jsr.io/scopes/calumet/packages/<paquete>/score`.

Casi todo el peso lo tiene la documentación: 5 puntos por documentar los
símbolos exportados, otros 5 por no usar slow types, 1 por el doc de módulo de
cada entrypoint y 3 por el README con ejemplo. Eso sale del código, así que lo
cuida `pnpm jsr:check`.

Los 2 que faltan son ajustes del sitio, la descripción y la compatibilidad de
runtime, y no tienen campo en el `deno.json`:

```bash
export JSR_TOKEN=...          # https://jsr.io/account/tokens
pnpm jsr:ajustes              # muestra qué cambiaría
pnpm jsr:ajustes -- --aplicar
```

La descripción sale del `package.json` de cada paquete, para no mantenerla en
dos lados. Los runtimes se marcan por lo que el código necesita: los siete
paquetes de React van con navegador, Deno, Node y Bun, y `elise-linter` sin
navegador porque importa `node:module`.

El score se recalcula al publicar una versión, no al cambiar el código.
