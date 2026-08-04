# Auditoría visual

`pnpm audit:visual` abre el showcase en un Chromium headless y comprueba, sobre
el DOM ya renderizado, cosas que el typecheck no ve y una captura no delata a
simple vista.

No sustituye mirar la pantalla. Atrapa la clase de defecto que se nota tarde:
dos iconos que se pisan por medio pixel, una fila corrida respecto de sus
hermanas, un fondo que desborda una esquina redondeada.

## Uso

```bash
# 1. el showcase tiene que estar corriendo
pnpm --filter showcase dev

# 2. en otra terminal
pnpm audit:visual                                    # claro y oscuro, tres anchos
node scripts/audit-visual.mjs -- --tema=claro        # un solo tema
node scripts/audit-visual.mjs -- --anchos=360        # un solo ancho
node scripts/audit-visual.mjs -- --abrir             # ademas abre cada panel
node scripts/audit-visual.mjs -- --url=http://…      # contra otra URL
```

Sale con código 1 si hay hallazgos, para poder colgarlo de CI.

Cada tema se recorre en tres anchos: 360, 768 y 1280. Lo que se rompe por
responsive se rompe donde aprieta, así que auditar solo en escritorio no ve
nada; las piezas caben de sobra y el defecto aparece cuando dejan de caber. El
informe se queda con la primera vez que ve cada hallazgo, o sea el ancho más
estrecho donde se nota.

`--abrir` es el modo que importa antes de dar por hecho un componente con panel,
porque la mitad de los defectos de alineación y de recorte solo existen con el
menú desplegado.

Si el entorno ya trae un Chromium, `CHROMIUM_PATH` evita que Playwright
descargue el suyo.

## Que comprueba

| Chequeo           | Que busca                                                                         |
| ----------------- | --------------------------------------------------------------------------------- |
| **Radios**        | Radios fuera de la escala de tokens, que delatan un valor escrito a mano          |
| **Iconos**        | Iconos fuera de `12/14/16/20/24`, y cualquiera en píxeles fraccionarios           |
| **Tipografía**    | Tamaños de texto fuera de la escala, que pierden interlineado y tracking pareados |
| **Fraccionarios** | Controles cuyo alto no cae en pixel entero                                        |
| **Anidamiento**   | Un `<button>` dentro de otro, o cualquier interactivo anidado                     |
| **Solapamiento**  | Dos controles del flujo normal que se pisan                                       |
| **Hermanos**      | Dos hijos de una misma fila ocupando el mismo sitio en los dos ejes               |
| **Desborde**      | Un hijo que se sale de su contenedor sin que nada por encima lo recorte           |
| **Recorte**       | Un hijo opaco que pinta sobre la esquina redondeada de su contenedor              |
| **Alineación**    | Filas de una misma lista cuyo texto no arranca en la misma x                      |
| **Contraste**     | Pares texto/fondo por debajo de WCAG AA, componiendo capas semitransparentes      |

Las escalas viven al principio del script y tienen que seguir a `elise.css`.
Cuando cambia un token de radio o de tipografía, se cambia ahí también.

## Por que cada chequeo

Ninguno es hipotético. Cada uno viene de un defecto que se coló de verdad y se
encontro tarde:

- Los **iconos** median 14.08px porque la base de espaciado era `0.22rem`. Se
  veían borrosos y nadie sabía por que.
- El **anidamiento** apareció poniendo el botón de limpiar del Combobox dentro
  de su disparador, que es HTML inválido.
- El **solapamiento** dejo la X y el chevron del Combobox uno encima del otro.
- El **recorte** dejo el fondo cuadrado del `Command` desbordando las esquinas
  del Popover.
- La **alineación** dejo la fila de acción 24px a la izquierda del resto.
- Los **hermanos** y el **desborde** salieron de la cabecera del `AppShell`
  pisándose a 360px. `scrollWidth` contra `clientWidth` no lo veía, porque cada
  pieza cabía; lo que no cabía es que estuvieran a la vez en el mismo sitio. En
  su primera pasada encontraron otras cinco: los pasos del `Stepper`, las seis
  casillas del `OTPField`, el `SegmentedControl` arrastrando el ancho de toda
  su rejilla, el «filas por página» de la tabla, y el mínimo de 191px que un
  `<input>` le imponía a cualquier campo compuesto.
- El **contraste** encontro `destructive` sólido en oscuro a 4.02:1, y después
  los `outline` de Badge y Button, que usaban el color sólido como texto y
  dejaban `warning` en 2.18:1.

## Falsos positivos ya descartados

Conviene conocerlos antes de agregar chequeos nuevos, ya que son las trampas en
las que ya cayó esta herramienta:

- **Texto de lector de pantalla.** El `sr-only` se recorta a 1px y nunca se ve;
  medirle contraste no dice nada. Se excluye por tamaño.
- **Superposición deliberada.** Una X de limpiar posicionada en absoluto sobre
  su campo no es un error. Solo se mira el solapamiento entre elementos del
  flujo normal.
- **Fondos semitransparentes.** Un fondo como `bg-primary/10` se compone contra
  lo que tiene detras. Tratarlo como si fuera sólido daba 1.09:1 en texto
  perfectamente legible.
- **Colores a mitad de transición.** Al cambiar de tema, Chrome reporta el valor
  interpolado como `oklab(...)` y la medición sale del tema equivocado. El
  script congela transiciones y animaciones antes de medir.
- **Cambiar de tema por detras del `ThemeProvider`.** El provider es dueño de
  ese atributo y lo reescribe, por eso forzar `.dark` en el `<html>` deja la
  página a medio camino. Se usa el control de la app.
- **Una rejilla apilada a una columna.** Sus hijos comparten la misma x, que es
  lo que tienen que hacer. Por eso el chequeo de hermanos exige cruce en los dos
  ejes y no solo en el horizontal.
- **Salirse de un contenedor que recorta.** El carril de un carrusel mide más
  que su ventana a propósito. El desborde solo cuenta cuando nada por encima lo
  recorta.
- **Una caja rotada.** `animate-spin` agranda el rectángulo que devuelve
  `getBoundingClientRect`, y un `Spinner` de 16px se mide en 22. Lo cubre el
  congelado de animaciones que ya se hacía por los colores.

Cuando un chequeo falle, el informe trae los valores crudos que midio. Un número
sin evidencia no se puede refutar, y un fallo de la sonda se confunde con uno del
tema.
