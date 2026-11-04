/**
 * La barra que avisa de cambios sin guardar.
 *
 * @module
 */

import * as React from "react";

import { Container } from "./container";
import { SaveBarFrame, type SaveBarProps } from "./save-bar-frame";

export type { SaveBarProps };

/**
 * La barra que avisa de cambios sin guardar.
 *
 * Aparece mientras `dirty` y se lleva ahí las dos salidas que quedan: guardar y
 * descartar. Una pantalla de ajustes larga deja el pie varias pantallas por
 * debajo del primer campo, así que quien cambia algo arriba pierde de vista el
 * control que lo aplica.
 *
 * Flota abajo y centrada sobre la superficie invertida: es una capa encima de la
 * pantalla, y aparecer no desplaza lo que se está editando. En estrecho pasa a
 * dos filas, porque el rótulo no cabe junto a los botones. Dentro del marco va
 * `AppShellSaveBar`, que la coloca en la banda de la cabecera.
 *
 * **Descartar destruye lo editado**, así que pasa por `AlertDialog` y no por el
 * botón a secas, como fija `reglas-ui.md#14-contarle-algo-al-usuario`.
 *
 * `retain` cubre la mitad que es del navegador: cerrar la pestaña, recargar o
 * escribir otra dirección. La otra mitad, navegar dentro de la aplicación, no
 * tiene evento que valga porque el enrutado es de cada app; esa la conecta la
 * pantalla con su propio enrutador leyendo el mismo `dirty` que le pasa acá.
 *
 * ```tsx
 * const form = useZodForm(esquema);
 *
 * <SaveBar
 *   dirty={form.formState.isDirty}
 *   saving={form.formState.isSubmitting}
 *   onSave={form.handleSubmit(guardar)}
 *   onDiscard={() => form.reset()}
 * />
 * ```
 */
export function SaveBar(props: SaveBarProps): React.JSX.Element | null {
  if (!props.dirty) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-sticky px-4">
      <Container size="xs" gutter={false} className="pointer-events-auto">
        <SaveBarFrame floating {...props} />
      </Container>
    </div>
  );
}
