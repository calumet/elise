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
  return (
    <>
      {children
        .split("`")
        .map((parte, i) =>
          i % 2 === 1 ? (
            <Code key={i}>{parte}</Code>
          ) : (
            <React.Fragment key={i}>{parte}</React.Fragment>
          ),
        )}
    </>
  );
}
