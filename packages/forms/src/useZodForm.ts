import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps, type UseFormReturn, type FieldValues } from "react-hook-form";
import type { z } from "zod";

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
 * con `z.coerce.number()` se lee como `string` desde el input y llega como
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
export function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>, "resolver">,
): UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>> {
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    ...options,
    resolver: zodResolver(schema),
  });
}
