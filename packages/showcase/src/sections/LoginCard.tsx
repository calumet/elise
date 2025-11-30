import React, { useState } from 'react';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormLabel,
  Input,
  PasswordField,
  Separator
} from '@elise/ui';

const LoginCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Login simulado completado.');
  };

  return (
    <div className="w-full max-w-sm rounded-sm border border-border bg-surface shadow-soft p-5 space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Iniciar sesión</h3>
        <p className="text-sm text-muted-foreground">Demo de inputs con borde y PasswordField.</p>
      </div>
      <Form className="space-y-3" onSubmit={onSubmit}>
        <FormField name="email">
          <FormLabel>Email</FormLabel>
          <FormControl asChild>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo@elise.dev" />
          </FormControl>
        </FormField>
        <FormField name="password">
          <FormLabel>Contraseña</FormLabel>
          <FormControl asChild>
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
        </FormField>
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </Form>
      <Separator />
      <p className="text-xs text-muted-foreground">
        Esto es solo una demo visual. Integra tu lógica de auth favorita aquí.
      </p>
      {status && <p className="text-sm text-success">{status}</p>}
    </div>
  );
};

export default LoginCard;
