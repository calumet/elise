import { Page, PageHeader } from "@calumet/elise-blocks";
import { ChevronLeft } from "@calumet/elise-icons";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@calumet/elise-ui/card";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
} from "@calumet/elise-ui/description-list";
import { Link } from "@calumet/elise-ui/link";
import { Text } from "@calumet/elise-ui/text";

const PageDemo = () => (
  <div className="flex flex-col gap-8">
    {/* La pantalla entera, con su columna de apoyo. El marco tenue es del demo:
        una pantalla de verdad se apoya en el lienzo del AppShell. */}
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <Page
        size="full"
        headingAs="h2"
        heading="Pedido #1042"
        subtitle="Hecho el 4 de agosto por Marina Ferreyra, pagado con tarjeta."
        headingMetadata={<Badge tone="success">Pagado</Badge>}
        backAction={
          <Link href="#page" tone="neutral" className="inline-flex items-center gap-1 text-sm">
            <ChevronLeft className="size-4" aria-hidden />
            Pedidos
          </Link>
        }
        primaryAction={<Button size="sm">Preparar envío</Button>}
        secondaryActions={
          <>
            <Button size="sm" variant="outline">
              Imprimir
            </Button>
            <Button size="sm" variant="outline">
              Reembolsar
            </Button>
          </>
        }
        asideLabel="Datos del pedido"
        aside={
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionList>
                <DescriptionListTerm>Nombre</DescriptionListTerm>
                <DescriptionListDescription>Marina Ferreyra</DescriptionListDescription>
                <DescriptionListTerm>Correo</DescriptionListTerm>
                <DescriptionListDescription>marina@ejemplo.com</DescriptionListDescription>
                <DescriptionListTerm>Pedidos</DescriptionListTerm>
                <DescriptionListDescription>7</DescriptionListDescription>
              </DescriptionList>
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Artículos</CardTitle>
            <CardDescription>Dos artículos, 4.980 pesos en total.</CardDescription>
          </CardHeader>
          <CardContent>
            <Text size="sm" tone="muted">
              Acá iría la tabla del pedido. Lo que importa del bloque es el reparto: el contenido
              encoge y la columna de apoyo se queda en sus 320px, y por debajo de 1024px pasan a una
              sola columna.
            </Text>
          </CardContent>
        </Card>
      </Page>
    </div>

    {/* La cabecera sola, que es lo que usa una pantalla que ya trae su marco. */}
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <PageHeader
        headingAs="h2"
        heading="Productos"
        subtitle="Sin volver del listado: esta cabecera no lleva vuelta atrás."
        primaryAction={<Button size="sm">Agregar producto</Button>}
      />
    </div>
  </div>
);

export default PageDemo;
