import { Button } from "@calumet/elise-ui/button";
import { Field } from "@calumet/elise-ui/field";
import { Input } from "@calumet/elise-ui/input";
import { Section } from "@calumet/elise-ui/section";
import { Switch } from "@calumet/elise-ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@calumet/elise-ui/table";
import { Text } from "@calumet/elise-ui/text";

const SectionDemo = () => (
  <div className="flex flex-col gap-4">
    <Section heading="Datos de la tienda">
      <div className="flex flex-col gap-4">
        <Field label="Nombre visible">
          {(props) => <Input {...props} defaultValue="Calumet" />}
        </Field>
        <Field label="Correo de contacto">
          {(props) => <Input {...props} defaultValue="hola@calumet.dev" />}
        </Field>
      </div>
    </Section>

    <Section heading="Notificaciones" actions={<Button size="sm">Probar envío</Button>}>
      <div className="flex flex-col gap-4">
        <Switch label="Pedidos nuevos" description="Un correo por cada pedido que entre." />
        <Switch label="Resumen semanal" />
      </div>
    </Section>

    {/* `padding="none"` para meter algo que ya trae el suyo. La tabla llega al
        borde y no queda un marco dentro de otro. */}
    <Section heading="Últimos pedidos" padding="none">
      <Table bare>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ["#1042", "Marina Ferreyra", "Pagado"],
            ["#1041", "Nicolás Duarte", "Pendiente"],
          ].map(([id, cliente, estado]) => (
            <TableRow key={id}>
              <TableCell>{id}</TableCell>
              <TableCell>{cliente}</TableCell>
              <TableCell>{estado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>

    <Section accessibilityLabel="Aviso legal">
      <Text size="sm" tone="muted">
        Sin rótulo a la vista, pero la región tiene nombre igual: si no, un lector de pantalla la
        anuncia como «región» a secas.
      </Text>
    </Section>
  </div>
);

export default SectionDemo;
