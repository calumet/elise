# Auditoria visual

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
pnpm audit:visual                                    # claro y oscuro
node scripts/audit-visual.mjs -- --tema=claro        # un solo tema
node scripts/audit-visual.mjs -- --abrir             # ademas abre cada panel
node scripts/audit-visual.mjs -- --url=http://…      # contra otra URL
```

Sale con codigo 1 si hay hallazgos, para poder colgarlo de CI.

`--abrir` es el modo que importa antes de dar por hecho un componente con panel,
porque la mitad de los defectos de alineacion y de recorte solo existen con el
menu desplegado.

Si el entorno ya trae un Chromium, `CHROMIUM_PATH` evita que Playwright
descargue el suyo.

## Que comprueba

| Chequeo           | Que busca                                                                         |
| ----------------- | --------------------------------------------------------------------------------- |
| **Radios**        | Radios fuera de la escala de tokens, que delatan un valor escrito a mano          |
| **Iconos**        | Iconos fuera de `12/14/16/20/24`, y cualquiera en pixeles fraccionarios           |
| **Tipografia**    | Tamanos de texto fuera de la escala, que pierden interlineado y tracking pareados |
| **Fraccionarios** | Controles cuyo alto no cae en pixel entero                                        |
| **Anidamiento**   | Un `<button>` dentro de otro, o cualquier interactivo anidado                     |
| **Solapamiento**  | Dos controles del flujo normal que se pisan                                       |
| **Recorte**       | Un hijo opaco que pinta sobre la esquina redondeada de su contenedor              |
| **Alineacion**    | Filas de una misma lista cuyo texto no arranca en la misma x                      |
| **Contraste**     | Pares texto/fondo por debajo de WCAG AA, componiendo capas semitransparentes      |

Las escalas viven al principio del script y tienen que seguir a `elise.css`.
Cuando cambia un token de radio o de tipografia, se cambia ahi tambien.

## Por que cada chequeo

Ninguno es hipotetico. Cada uno viene de un defecto que se colo de verdad y se
encontro tarde:

- Los **iconos** median 14.08px porque la base de espaciado era `0.22rem`. Se
  veian borrosos y nadie sabia por que.
- El **anidamiento** aparecio poniendo el boton de limpiar del Combobox dentro
  de su disparador, que es HTML invalido.
- El **solapamiento** dejo la X y el chevron del Combobox uno encima del otro.
- El **recorte** dejo el fondo cuadrado del `Command` desbordando las esquinas
  del Popover.
- La **alineacion** dejo la fila de accion 24px a la izquierda del resto.
- El **contraste** encontro `destructive` solido en oscuro a 4.02:1, y despues
  los `outline` de Badge y Button, que usaban el color solido como texto y
  dejaban `warning` en 2.18:1.

## Falsos positivos ya descartados

Conviene conocerlos antes de agregar chequeos nuevos, ya que son las trampas en
las que ya cayo esta herramienta:

- **Texto de lector de pantalla.** El `sr-only` se recorta a 1px y nunca se ve;
  medirle contraste no dice nada. Se excluye por tamano.
- **Superposicion deliberada.** Una X de limpiar posicionada en absoluto sobre
  su campo no es un error. Solo se mira el solapamiento entre elementos del
  flujo normal.
- **Fondos semitransparentes.** Un fondo como `bg-primary/10` se compone contra
  lo que tiene detras. Tratarlo como si fuera solido daba 1.09:1 en texto
  perfectamente legible.
- **Colores a mitad de transicion.** Al cambiar de tema, Chrome reporta el valor
  interpolado como `oklab(...)` y la medicion sale del tema equivocado. El
  script congela transiciones y animaciones antes de medir.
- **Cambiar de tema por detras del `ThemeProvider`.** El provider es dueño de
  ese atributo y lo reescribe, por eso forzar `.dark` en el `<html>` deja la
  pagina a medio camino. Se usa el control de la app.

Cuando un chequeo falle, el informe trae los valores crudos que midio. Un numero
sin evidencia no se puede refutar, y un fallo de la sonda se confunde con uno del
tema.
