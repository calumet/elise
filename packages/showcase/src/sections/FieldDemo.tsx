import { useZodForm, z } from "@calumet/elise-forms";
import { Button } from "@calumet/elise-ui/button";
import { ComboboxField } from "@calumet/elise-ui/combobox";
import { Field } from "@calumet/elise-ui/field";
import { Input } from "@calumet/elise-ui/input";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import { Textarea } from "@calumet/elise-ui/textarea";
import { useState } from "react";

const esquema = z.object({
  nombre: z.string().min(2, "Escribe al menos 2 caracteres"),
  email: z.email("Revisa el formato del correo"),
  plan: z.string().min(1, "Elige un plan"),
  mensaje: z.string().max(200, "Maximo 200 caracteres").optional(),
});

const planes = [
  { value: "free", label: "Gratuito", description: "1 proyecto" },
  { value: "pro", label: "Pro", description: "Proyectos ilimitados" },
  { value: "enterprise", label: "Empresa", description: "Con SSO y soporte" },
];

const FieldDemo = () => {
  const [enviado, setEnviado] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useZodForm(esquema, { defaultValues: { nombre: "", email: "", plan: "", mensaje: "" } });

  const plan = watch("plan");

  return (
    <BlockStack gap={5} className="w-full max-w-sm">
      <Text size="xs" tone="muted">
        El control se pasa como funcion, asi que aplicar las props de accesibilidad es obligatorio.
        Envia el formulario vacio para ver el enlace entre error y campo.
      </Text>

      <form
        noValidate
        onSubmit={handleSubmit((datos) => setEnviado(JSON.stringify(datos)))}
        className="contents"
      >
        <Field label="Nombre" error={errors.nombre?.message} required>
          {(control) => <Input {...control} {...register("nombre")} placeholder="Ada Lovelace" />}
        </Field>

        <Field
          label="Correo"
          description="Te enviamos la confirmacion a esta direccion."
          error={errors.email?.message}
          required
        >
          {(control) => (
            <Input type="email" {...control} {...register("email")} placeholder="ada@elise.dev" />
          )}
        </Field>

        <Field label="Plan" error={errors.plan?.message} required>
          {(control) => (
            <ComboboxField
              {...control}
              options={planes}
              value={plan}
              onValueChange={(v) => setValue("plan", v, { shouldValidate: true })}
              placeholder="Elegir plan"
            />
          )}
        </Field>

        <Field
          label="Mensaje"
          description="Opcional, hasta 200 caracteres."
          error={errors.mensaje?.message}
        >
          {(control) => <Textarea {...control} {...register("mensaje")} rows={3} />}
        </Field>

        <InlineStack gap={2}>
          <Button type="submit" size="sm">
            Enviar
          </Button>
          {enviado ? (
            <Text size="xs" tone="success">
              Enviado
            </Text>
          ) : null}
        </InlineStack>
      </form>
    </BlockStack>
  );
};

export default FieldDemo;
