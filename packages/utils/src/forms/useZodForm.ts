import { useForm, type UseFormProps, type UseFormReturn, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

export type UseZodFormReturn<TFieldValues extends FieldValues = FieldValues> = UseFormReturn<TFieldValues>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useZodForm<TSchema extends z.ZodType<any, any, any>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>> {
  return useForm({
    ...options,
    resolver: zodResolver(schema) as any
  }) as UseFormReturn<z.infer<TSchema>>;
}
