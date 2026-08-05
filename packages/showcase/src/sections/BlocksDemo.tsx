import { AuthPage, ErrorPage, SettingsGroup, SettingsSection, Wizard } from "@calumet/elise-blocks";
import { ShieldAlert, Store } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import { Card, CardContent } from "@calumet/elise-ui/card";
import { Field } from "@calumet/elise-ui/field";
import { Input } from "@calumet/elise-ui/input";
import { Link } from "@calumet/elise-ui/link";
import { Switch } from "@calumet/elise-ui/switch";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const PASOS = [
  {
    id: "datos",
    title: "Datos de la tienda",
    description: "Nombre y dirección",
    content: (
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Field label="Nombre de la tienda">
            {(props) => <Input {...props} defaultValue="Calumet" />}
          </Field>
          <Field label="Dirección" description="La que sale en las facturas.">
            {(props) => <Input {...props} placeholder="Av. Siempre Viva 742" />}
          </Field>
        </CardContent>
      </Card>
    ),
  },
  {
    id: "envios",
    title: "Envíos",
    description: "A dónde llegás",
    content: (
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Switch label="Envío a domicilio" description="Dentro de la ciudad, sin cargo." />
          <Switch label="Retiro en el local" />
        </CardContent>
      </Card>
    ),
  },
  {
    id: "cobros",
    title: "Cobros",
    description: "Cómo te pagan",
    content: (
      <Card>
        <CardContent>
          <Text size="sm" tone="muted">
            El último paso: acá el botón deja de decir «Siguiente» y pasa a «Finalizar».
          </Text>
        </CardContent>
      </Card>
    ),
  },
];

const BlocksDemo = () => {
  const [paso, setPaso] = useState("datos");
  const [notificar, setNotificar] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      {/* Asistente */}
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <Wizard
          size="full"
          headingAs="h2"
          heading="Configurar la tienda"
          subtitle="Tres pasos. El indicador deduce el estado de cada uno del que esté puesto."
          steps={PASOS}
          step={paso}
          onStepChange={setPaso}
          onFinish={() => setPaso("datos")}
        />
      </div>

      {/* Ajustes */}
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <SettingsGroup>
          <SettingsSection
            title="Perfil de la tienda"
            description="Lo que ven tus clientes en la factura y en el correo de confirmación."
          >
            <Card>
              <CardContent className="flex flex-col gap-4">
                <Field label="Nombre visible">
                  {(props) => <Input {...props} defaultValue="Calumet" />}
                </Field>
                <Field label="Correo de contacto">
                  {(props) => <Input {...props} defaultValue="hola@calumet.dev" />}
                </Field>
              </CardContent>
            </Card>
          </SettingsSection>

          <SettingsSection
            title="Notificaciones"
            description="Qué te llega por correo. Los avisos de cobro no se pueden apagar."
          >
            <Card>
              <CardContent className="flex flex-col gap-4">
                <Switch
                  label="Pedidos nuevos"
                  checked={notificar}
                  onCheckedChange={setNotificar}
                  description="Un correo por cada pedido que entre."
                />
                <Switch label="Resumen semanal" />
              </CardContent>
            </Card>
          </SettingsSection>
        </SettingsGroup>
      </div>

      {/* Autenticación */}
      <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
        <AuthPage
          className="min-h-0 py-8"
          brand={<Store className="size-6 text-primary" aria-hidden />}
          title="Entrar a Calumet"
          description="Con la cuenta de tu tienda."
          footer={
            <>
              ¿No tenés cuenta? <Link href="#blocks">Creá una</Link>
            </>
          }
        >
          <Field label="Correo">{(props) => <Input {...props} type="email" />}</Field>
          <Field label="Contraseña">{(props) => <Input {...props} type="password" />}</Field>
          <Button className="w-full">Entrar</Button>
        </AuthPage>
      </div>

      {/* Error */}
      <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
        <ErrorPage
          full={false}
          className="py-8"
          code="Error 404"
          media={<ShieldAlert className="size-6" aria-hidden />}
          title="Esta página no está"
          description="Puede que la hayan borrado, o que el enlace que seguiste esté viejo."
          actions={
            <>
              <Button size="sm">Volver al inicio</Button>
              <Button size="sm" variant="outline">
                Avisar del problema
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
};

export default BlocksDemo;
