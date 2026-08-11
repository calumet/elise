# Publicar en JSR

Los paquetes se publican en dos registros desde el mismo commit: GitHub Packages
recibe el bundle de tsup, y [JSR](https://jsr.io/@calumet) recibe la salida de
`tsc`, un módulo por archivo. Los dos jobs viven en
[`.github/workflows/publish.yml`](../.github/workflows/publish.yml) y corren en
cada push a `master`; cada registro se salta las versiones que ya tiene, así que
publicar es subir el `version` del paquete y mergear.

## Por qué se publica compilado y no el fuente

JSR prefiere que se publique TypeScript sin compilar, y así estaba al principio.
No funciona con JSX: al armar el tarball para npm, JSR transpila cada `.ts` a
`.js` pero **deja los `.tsx` crudos, con los especificadores `npm:` sin
resolver**. Quien instale ese paquete desde Vite recibe

```
Failed to resolve import "npm:@radix-ui/react-slot@^1.1.1"
```

Es un agujero conocido de la capa de compatibilidad
([jsr-io/jsr#24](https://github.com/jsr-io/jsr/issues/24)) y no depende de cómo
esté configurado el paquete. Se comprueba bajando el tarball de cualquier
paquete de JSR con JSX: `@basis/react` tiene 19 `.tsx` y los 19 rotos, y las dos
librerías de componentes React que reservaron nombre, `@ariakit/react` y
`@ark-ui/react`, nunca publicaron una versión. Los que sí funcionan y puntúan 100
no tienen JSX: `@preact-icons` escribe sus 833 iconos llamando a `h()`.

Por eso cada paquete compila con `tsc` a `jsr/`, un `.js` y un `.d.ts` por
archivo. La estructura de módulos se conserva, así que JSR sigue viendo un
entrypoint por componente con sus docs; el JSX ya viene resuelto a `_jsx()`, así
que la transformación de especificadores funciona; y los tipos viajan en los
`.d.ts`, atados a su `.js` por el pragma `@ts-self-types` que pone
[`scripts/preparar-jsr.mjs`](../scripts/preparar-jsr.mjs). Deno no resuelve
declaraciones por convención de nombre, de ahí el pragma.

La consecuencia práctica: **el build tiene que correr antes que `jsr publish`**,
y por eso `pnpm jsr:check` va después de `pnpm build` en CI.

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
