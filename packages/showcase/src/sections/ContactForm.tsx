import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import { useZodForm } from '@elise/utils';
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormSubmit,
  Input,
  Textarea
} from '@elise/ui';

const schema = z.object({
  name: z.string().min(2, 'Nombre es requerido (mínimo 2 caracteres)'),
  email: z.string().email('Email inválido'),
  message: z.string().min(4, 'Mensaje es requerido'),
  agree: z
    .boolean()
    .refine((val) => val === true, { message: 'Debes aceptar los términos.' })
})

const ContactForm = () => {
  const [success, setSuccess] = useState<string | null>(null);

  const { handleSubmit, formState, register, setValue, watch } = useZodForm(schema, {
    defaultValues: {
      name: '',
      email: '',
      message: '',
      agree: false
    }
  });

  const onSubmit = handleSubmit(() => {
    setSuccess('Enviado. Gracias por contactarnos.');
  });

  return (
    <Form onSubmit={onSubmit} noValidate className="w-full max-w-lg space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField name="name">
          <div className="space-y-1">
            <FormLabel>Nombre</FormLabel>
            <FormControl asChild>
              <Input placeholder="Ada Lovelace" {...register('name')} />
            </FormControl>
            {formState.errors.name && (
              <FormMessage>{formState.errors.name.message}</FormMessage>
            )}
          </div>
        </FormField>
        <FormField name="email">
          <div className="space-y-1">
            <FormLabel>Email</FormLabel>
            <FormControl asChild>
              <Input type="email" placeholder="ada@elise.dev" {...register('email')} />
            </FormControl>
            {formState.errors.email && (
              <FormMessage>{formState.errors.email.message}</FormMessage>
            )}
          </div>
        </FormField>
      </div>
      <FormField name="message">
        <div className="space-y-1">
          <FormLabel>Mensaje</FormLabel>
          <FormControl asChild>
            <Textarea placeholder="Cuéntanos tu idea..." {...register('message')} />
          </FormControl>
          {formState.errors.message && (
            <FormMessage>{formState.errors.message.message}</FormMessage>
          )}
        </div>
      </FormField>
      <FormField name="agree">
        <div className="flex items-center gap-2">
          <Checkbox
            id="agree"
            checked={watch('agree')}
            onCheckedChange={(v) => setValue('agree', v === true, { shouldValidate: true })}
          />
          <FormLabel htmlFor="agree">
            Acepto los términos y políticas.
          </FormLabel>
        </div>
        {formState.errors.agree && (
          <FormMessage>{formState.errors.agree.message}</FormMessage>
        )}
      </FormField>
      {success && <p className="text-sm text-success">{success}</p>}
      <FormSubmit asChild>
        <Button type="submit" disabled={formState.isSubmitting}>
          Enviar
        </Button>
      </FormSubmit>
    </Form>
  );
};

export default ContactForm;
