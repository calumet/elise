import { FormField, useZodForm, z } from "@calumet/elise-forms";
import { Button } from "@calumet/elise-ui/button";
import { Checkbox } from "@calumet/elise-ui/checkbox";
import { FormRow } from "@calumet/elise-ui/form";
import { Input } from "@calumet/elise-ui/input";
import { Textarea } from "@calumet/elise-ui/textarea";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Nombre es requerido (mínimo 2 caracteres)"),
  email: z.email("Email inválido"),
  message: z.string().min(4, "Mensaje es requerido"),
  agree: z.boolean().refine((val) => val === true, { message: "Debes aceptar los términos." }),
});

const ContactForm = () => {
  const [success, setSuccess] = useState<string | null>(null);

  const form = useZodForm(schema, {
    defaultValues: {
      name: "",
      email: "",
      message: "",
      agree: false,
    },
  });

  const onSubmit = form.handleSubmit(() => {
    setSuccess("Enviado. Gracias por contactarnos.");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-lg space-y-4">
      <FormRow>
        <FormField form={form} name="name" label="Nombre" description="Tu nombre completo.">
          <Input placeholder="Ada Lovelace" />
        </FormField>
        <FormField form={form} name="email" label="Email">
          <Input type="email" placeholder="ada@elise.dev" />
        </FormField>
      </FormRow>
      <FormField
        form={form}
        name="message"
        label="Mensaje"
        description="Detalla tu solicitud para que podamos ayudarte."
      >
        <Textarea placeholder="Cuéntanos tu idea..." />
      </FormField>
      <FormField form={form} name="agree">
        {(field, { error }) => (
          <Checkbox
            label="Acepto los términos y políticas."
            checked={field.value}
            onCheckedChange={field.onChange}
            error={error}
          />
        )}
      </FormField>
      {success && <p className="text-sm text-success">{success}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        Enviar
      </Button>
    </form>
  );
};

export default ContactForm;
