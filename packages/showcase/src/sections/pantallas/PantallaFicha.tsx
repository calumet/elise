import { ChevronLeft, X } from "@calumet/elise-icons";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { ButtonGroup } from "@calumet/elise-ui/button-group";
import { Container } from "@calumet/elise-ui/container";
import { Field } from "@calumet/elise-ui/field";
import { Image } from "@calumet/elise-ui/image";
import { Input } from "@calumet/elise-ui/input";
import { Link } from "@calumet/elise-ui/link";
import { List, ListItem } from "@calumet/elise-ui/list";
import { NumberField } from "@calumet/elise-ui/number-field";
import { SearchField } from "@calumet/elise-ui/search-field";
import { Section } from "@calumet/elise-ui/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@calumet/elise-ui/select";
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
import { Textarea } from "@calumet/elise-ui/textarea";

import { muestra } from "./muestra";

const VARIANTES = [
  { id: "250", nombre: "Bolsa de 250 g", color: "#7c2d12" },
  { id: "1000", nombre: "Bolsa de 1 kg", color: "#0f766e" },
];

const PantallaFicha = () => (
  <Container size="lg" gutter={false} className="flex flex-col gap-5">
    <header className="flex flex-col gap-1">
      <div>
        <Link href="#pantallas" tone="neutral" className="inline-flex items-center gap-1 text-sm">
          <ChevronLeft className="size-4" aria-hidden />
          Productos
        </Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Text as="h2" size="xl" weight="semibold">
            Café Andes
          </Text>
          <Badge tone="success">Publicado</Badge>
        </div>
        <ButtonGroup>
          <Button size="sm" variant="outline">
            Duplicar
          </Button>
          <Button size="sm" variant="outline">
            Eliminar
          </Button>
        </ButtonGroup>
      </div>
    </header>

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-5">
        <Section heading="Información del producto">
          <div className="flex flex-col gap-3">
            <Field label="Nombre" description="Es el nombre que ven tus clientes al navegar.">
              {(props) => <Input {...props} defaultValue="Café Andes" />}
            </Field>
            <Field label="Descripción" description="Contá de dónde viene y a qué sabe.">
              {(props) => (
                <Textarea {...props} defaultValue="Tostado medio, de finca, con notas a cacao." />
              )}
            </Field>
            <NumberField
              label="Precio"
              description="Se muestra con impuestos incluidos."
              prefix="$"
              defaultValue="9990"
              min={0}
            />
          </div>
        </Section>

        <Section heading="Variantes">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchField
                label="Buscar variantes"
                labelHidden
                placeholder="Buscar variantes"
                className="min-w-0 flex-1"
              />
              <Button size="sm" variant="outline">
                Agregar
              </Button>
            </div>

            <Table bare frameClassName="overflow-hidden rounded-lg border border-border">
              <TableHeader>
                <TableRow>
                  <TableHead listSlot="primary">Variante</TableHead>
                  <TableHead>Acciones</TableHead>
                  <TableHead listSlot="secondary">
                    <span className="sr-only">Quitar</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VARIANTES.map((variante) => (
                  <TableRow key={variante.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={muestra("", variante.color, 80, 80)}
                          alt=""
                          border
                          radius="md"
                          className="size-10 shrink-0"
                        />
                        {variante.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Link href="#pantallas">Vista previa</Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Quitar ${variante.nombre}`}
                        >
                          <X className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        <Section heading="Ajustes del producto">
          <div className="flex flex-col gap-3">
            <Field label="Molienda">
              {(props) => (
                <Select defaultValue="grano">
                  <SelectTrigger {...props}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grano">En grano</SelectItem>
                    <SelectItem value="filtro">Molido para filtro</SelectItem>
                    <SelectItem value="espresso">Molido para espresso</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </Field>
            <Field label="Depósito">
              {(props) => (
                <Select defaultValue="central">
                  <SelectTrigger {...props}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">Depósito central</SelectItem>
                    <SelectItem value="local">Local de la calle</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </Field>
            <NumberField
              label="Stock disponible"
              description="Se descuenta con cada pedido pagado."
              defaultValue="50"
              min={0}
              suffix="bolsas"
            />
            <Switch
              label="Vender sin stock"
              description="Permite comprar aunque el stock esté en cero."
            />
          </div>
        </Section>
      </div>

      <aside aria-label="Resumen del producto" className="flex min-w-0 flex-col gap-5">
        <Section heading="Resumen">
          <div className="flex flex-col gap-2">
            <Text size="base" weight="semibold">
              Café Andes
            </Text>
            <List>
              <ListItem>Tostado medio, de finca</ListItem>
              <ListItem>Dos variantes, de 250 g y de 1 kg</ListItem>
              <ListItem>Envío a todo el país</ListItem>
              <ListItem>
                <span className="inline-flex items-center gap-2">
                  Estado actual:
                  <Badge tone="success">Publicado</Badge>
                </span>
              </ListItem>
            </List>
          </div>
        </Section>
      </aside>
    </div>
  </Container>
);

export default PantallaFicha;
