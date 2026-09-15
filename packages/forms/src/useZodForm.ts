import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps, type UseFormReturn, type FieldValues } from "react-hook-form";
import type * as z4 from "zod/v4/core";

/**
 * Alias de `UseFormReturn` de react-hook-form, para tipar una variable de
 * formulario sin importar de dos paquetes.
 */
export type UseZodFormReturn<TFieldValues extends FieldValues = FieldValues> =
  UseFormReturn<TFieldValues>;

/**
 * Crea un formulario de react-hook-form validado con un esquema de Zod, con el
 * resolver ya puesto.
 *
 * Los tipos distinguen la entrada de la salida del esquema, así que un campo
 * con `z.coerce.number()` acepta cualquier valor desde el input y llega como
 * `number` a `handleSubmit`.
 *
 * ```ts
 * const esquema = z.object({ email: z.email() });
 * const form = useZodForm(esquema);
 * ```
 *
 * @param schema Esquema con el que se valida en cada envío.
 * @param options Las mismas opciones que `useForm`, menos `resolver`.
 */
/* Del subpath `zod/v4/core` y no de `zod`, que es lo que Zod pide a una
   librería: `zod` apunta al major instalado, y `zod/v4/core` es un enlace fijo
   a la 4 que sobrevive al siguiente. `$ZodType` y no `ZodType` porque el
   segundo encaja también en la sobrecarga de Zod 3 de `zodResolver`, que
   colapsa los tipos a la restricción. */
export function useZodForm<TSchema extends z4.$ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z4.input<TSchema>, unknown, z4.output<TSchema>>, "resolver">,
): UseFormReturn<z4.input<TSchema>, unknown, z4.output<TSchema>> {
  return useForm<z4.input<TSchema>, unknown, z4.output<TSchema>>({
    ...options,
    resolver: zodResolver(schema),
  });
}
