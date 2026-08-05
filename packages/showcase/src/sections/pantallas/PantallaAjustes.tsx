import { ChevronRight, CreditCard, Package, Truck } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import { Checkbox } from "@calumet/elise-ui/checkbox";
import { CheckboxGroup } from "@calumet/elise-ui/checkbox-group";
import { Clickable } from "@calumet/elise-ui/clickable";
import { Container } from "@calumet/elise-ui/container";
import { Field } from "@calumet/elise-ui/field";
import { Input } from "@calumet/elise-ui/input";
import { RadioGroup, RadioGroupItem } from "@calumet/elise-ui/radio-group";
import { Section } from "@calumet/elise-ui/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@calumet/elise-ui/select";
import { Separator } from "@calumet/elise-ui/separator";
import { Text } from "@calumet/elise-ui/text";

const SUBPANTALLAS = [
  {
    href: "#pantallas",
    icono: Truck,
    titulo: "Envíos y entregas",
    detalle: "Métodos, tarifas, zonas y preparación de pedidos.",
  },
  {
    href: "#pantallas",
    icono: Package,
    titulo: "Productos y catálogo",
    detalle: "Valores por defecto y cómo se muestran en la tienda.",
  },
  {
    href: "#pantallas",
    icono: CreditCard,
    titulo: "Cobros",
    detalle: "Medios de pago, cuotas y comprobantes.",
  },
];

const HERRAMIENTAS = [
  {
    titulo: "Restablecer los ajustes",
    detalle: "Devuelve todos los ajustes a su valor original. No se puede deshacer.",
    accion: "Restablecer",
    destructiva: true,
  },
  {
    titulo: "Exportar los ajustes",
    detalle: "Descargá una copia de la configuración actual.",
    accion: "Exportar",
    destructiva: false,
  },
];

const PantallaAjustes = () => (
  /* El ancho baja a `sm`: una pantalla de ajustes es una columna de
     formularios, y más ancha deja los campos más largos que lo que se escribe
     en ellos. */
  <Container size="sm" gutter={false} className="flex flex-col gap-5">
    <header>
      <Text as="h2" size="xl" weight="semibold">
        Ajustes
      </Text>
    </header>

    <Section heading="Información de la tienda">
      <div className="flex flex-col gap-4">
        <Field label="Nombre de la tienda">
          {(props) => <Input {...props} defaultValue="Calumet Café" />}
        </Field>
        <Field label="Dirección comercial" description="La que sale en las facturas.">
          {(props) => <Input {...props} defaultValue="Av. Rivadavia 1234, CABA" />}
        </Field>
        <Field label="Teléfono">
          {(props) => <Input {...props} defaultValue="+54 11 5555 1234" />}
        </Field>
        <RadioGroup label="Moneda principal" defaultValue="ars">
          <RadioGroupItem value="ars" label="Peso argentino ($)" />
          <RadioGroupItem value="usd" label="Dólar estadounidense (US$)" />
          <RadioGroupItem value="eur" label="Euro (€)" />
        </RadioGroup>
      </div>
    </Section>

    <Section heading="Notificaciones">
      <div className="flex flex-col gap-4">
        <Field label="Cada cuánto te avisamos">
          {(props) => (
            <Select defaultValue="inmediato">
              <SelectTrigger {...props}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inmediato">Al momento</SelectItem>
                <SelectItem value="hora">Un resumen por hora</SelectItem>
                <SelectItem value="dia">Un resumen por día</SelectItem>
              </SelectContent>
            </Select>
          )}
        </Field>
        <CheckboxGroup label="Qué te avisamos" description="Los avisos de cobro no se apagan.">
          <Checkbox name="pedidos" label="Pedidos nuevos" defaultChecked />
          <Checkbox name="stock" label="Stock bajo" />
          <Checkbox name="reseñas" label="Reseñas de clientes" />
          <Checkbox name="envios" label="Cambios en los envíos" />
        </CheckboxGroup>
      </div>
    </Section>

    <Section heading="Preferencias" padding="none">
      {SUBPANTALLAS.map((destino, n) => (
        <div key={destino.titulo}>
          {n > 0 ? <Separator /> : null}
          <Clickable
            href={destino.href}
            padding={3}
            accessibilityLabel={`Abrir ${destino.titulo}`}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
          >
            <destino.icono className="size-5 text-muted-foreground" aria-hidden />
            <div className="flex min-w-0 flex-col">
              <Text size="sm" weight="semibold">
                {destino.titulo}
              </Text>
              <Text size="sm" tone="muted">
                {destino.detalle}
              </Text>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Clickable>
        </div>
      ))}
    </Section>

    {/* Lo que destruye va al final y en su propia sección. */}
    <Section heading="Herramientas" padding="none">
      {HERRAMIENTAS.map((herramienta, n) => (
        <div key={herramienta.titulo}>
          {n > 0 ? <Separator /> : null}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex min-w-60 flex-1 flex-col">
              <Text size="sm" weight="semibold">
                {herramienta.titulo}
              </Text>
              <Text size="sm" tone="muted">
                {herramienta.detalle}
              </Text>
            </div>
            <Button
              size="sm"
              variant={herramienta.destructiva ? "solid" : "outline"}
              tone={herramienta.destructiva ? "danger" : undefined}
            >
              {herramienta.accion}
            </Button>
          </div>
        </div>
      ))}
    </Section>
  </Container>
);

export default PantallaAjustes;
