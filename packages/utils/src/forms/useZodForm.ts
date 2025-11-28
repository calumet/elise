import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormProps, type UseFormReturn } from 'react-hook-form';

export type UseZodFormReturn<TSchema extends z.ZodTypeAny> = UseFormReturn<z.infer<TSchema>>;

export const useZodForm = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseZodFormReturn<TSchema> =>
  useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...options
  });
