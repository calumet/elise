import React, { useState } from 'react';
import { Button, Checkbox, Form, FormControl, FormField, FormLabel, Input, Textarea } from '@elise/ui';

type FormState = {
  name: string;
  email: string;
  message: string;
  agree: boolean;
  error?: string;
  success?: string;
};

const ContactForm = () => {
  const [state, setState] = useState<FormState>({
    name: '',
    email: '',
    message: '',
    agree: false
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.name || !state.email || !state.message) {
      setState((prev) => ({ ...prev, success: undefined, error: 'Completa todos los campos.' }));
      return;
    }
    if (!state.agree) {
      setState((prev) => ({ ...prev, success: undefined, error: 'Acepta los términos para continuar.' }));
      return;
    }
    setState((prev) => ({ ...prev, error: undefined, success: 'Enviado. Gracias por contactarnos.' }));
  };

  return (
    <Form onSubmit={onSubmit} noValidate className="w-full max-w-lg space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField name="name">
          <FormLabel>Nombre</FormLabel>
          <FormControl asChild>
            <Input
              value={state.name}
              onChange={(e) => setState((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ada Lovelace"
            />
          </FormControl>
        </FormField>
        <FormField name="email">
          <FormLabel>Email</FormLabel>
          <FormControl asChild>
            <Input
              type="email"
              value={state.email}
              onChange={(e) => setState((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="ada@elise.dev"
            />
          </FormControl>
        </FormField>
      </div>
      <FormField name="message">
        <FormLabel>Mensaje</FormLabel>
        <FormControl asChild>
          <Textarea
            value={state.message}
            onChange={(e) => setState((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Cuéntanos tu idea..."
          />
        </FormControl>
      </FormField>
      <div className="flex items-center gap-2">
        <Checkbox
          id="agree"
          checked={state.agree}
          onCheckedChange={(v) => setState((prev) => ({ ...prev, agree: v === true }))}
        />
        <label htmlFor="agree" className="text-sm text-mutedForeground">
          Acepto los términos y políticas.
        </label>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}
      <Button type="submit" className="w-full sm:w-auto">
        Enviar
      </Button>
    </Form>
  );
};

export default ContactForm;
