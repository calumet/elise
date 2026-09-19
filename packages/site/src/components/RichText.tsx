import { Code } from "@calumet/elise-ui/code";
import * as React from "react";

/**
 * Renderiza una traducción que trae identificadores entre acentos graves:
 * `` `useZodForm` `` sale como `<Code>`.
 *
 * Existe para que cada texto siga siendo una sola cadena en el diccionario. Si
 * el `<Code>` se partiera en JSX, traducir la frase obligaría a mover trozos de
 * markup y quien traduce dejaría de ver la oración completa.
 */
export function RichText({ children }: { children: string }) {
  // La clave es dónde empieza el trozo en la cadena: no se repite y no depende
  // de la posición en el array.
  let desde = 0;
  const partes = children.split("`").map((texto) => {
    const inicio = desde;
    desde += texto.length + 1;
    return { texto, inicio };
  });

  return (
    <>
      {partes.map(({ texto, inicio }, i) =>
        i % 2 === 1 ? (
          <Code key={inicio}>{texto}</Code>
        ) : (
          <React.Fragment key={inicio}>{texto}</React.Fragment>
        ),
      )}
    </>
  );
}
