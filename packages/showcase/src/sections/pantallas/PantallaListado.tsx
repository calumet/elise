import { Plus, Search } from "@calumet/elise-icons";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { ButtonGroup } from "@calumet/elise-ui/button-group";
import { Clickable } from "@calumet/elise-ui/clickable";
import { Container } from "@calumet/elise-ui/container";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
import { Image } from "@calumet/elise-ui/image";
import { Link } from "@calumet/elise-ui/link";
import { SearchField } from "@calumet/elise-ui/search-field";
import { Section } from "@calumet/elise-ui/section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@calumet/elise-ui/table";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

import { muestra } from "./muestra";

const PRODUCTOS = [
  {
    id: "andes",
    nombre: "Café Andes",
    stock: 16,
    creado: "Hoy",
    estado: "Publicado",
    color: "#7c2d12",
  },
  {
    id: "cumbre",
    nombre: "Café Cumbre",
    stock: 9,
    creado: "Ayer",
    estado: "Publicado",
    color: "#0f766e",
  },
  {
    id: "niebla",
    nombre: "Café Niebla",
    stock: 25,
    creado: "La semana pasada",
    estado: "Borrador",
    color: "#334155",
  },
];

const PantallaListado = () => {
  const [busqueda, setBusqueda] = useState("");
  const [vacio, setVacio] = useState(false);

  const filtrado = busqueda.trim().length > 0;
  const filas = vacio
    ? []
    : PRODUCTOS.filter((p) => p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));

  return (
    <Container size="lg" gutter={false} className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        {/* En una pantalla de verdad este título es el `h1`. Acá baja a `h2`
            porque la vitrina ya tiene el suyo. */}
        <Text as="h2" size="xl" weight="semibold">
          Productos
        </Text>
        <ButtonGroup>
          <Button size="sm" variant="outline">
            Exportar
          </Button>
          <Button size="sm" variant="outline">
            Importar
          </Button>
          <Button size="sm">Crear producto</Button>
        </ButtonGroup>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => setVacio((v) => !v)}>
          {vacio ? "Devolver los productos" : "Vaciar el catálogo"}
        </Button>
        <Text size="sm" tone="muted">
          Vacío, el cartel ocupa el lugar de la tabla. Con un filtro que no encuentra nada, va
          dentro del marco y la barra se queda en pie.
        </Text>
      </div>

      {vacio ? (
        <Section accessibilityLabel="Sin productos">
          <EmptyState>
            <EmptyStateMedia>
              <Plus className="size-6" aria-hidden />
            </EmptyStateMedia>
            <EmptyStateTitle>Empezá a cargar productos</EmptyStateTitle>
            <EmptyStateDescription>
              Creá y administrá el catálogo que van a ver tus clientes.
            </EmptyStateDescription>
            <EmptyStateActions>
              <Button size="sm" variant="outline">
                Cómo cargar un producto
              </Button>
              <Button size="sm">Crear producto</Button>
            </EmptyStateActions>
          </EmptyState>
        </Section>
      ) : (
        <Section accessibilityLabel="Tabla de productos" padding="none">
          <Table
            bare
            paginate
            hasNextPage
            paginationLabel={`1-${filas.length} de ${filas.length}`}
            filters={
              <SearchField
                label="Buscar productos"
                labelHidden
                value={busqueda}
                onValueChange={setBusqueda}
                placeholder="Buscar productos"
                className="max-w-72"
              />
            }
            empty={
              filtrado && filas.length === 0 ? (
                <EmptyState size="sm">
                  <EmptyStateMedia>
                    <Search className="size-6" aria-hidden />
                  </EmptyStateMedia>
                  <EmptyStateTitle>Sin productos de «{busqueda}»</EmptyStateTitle>
                  <EmptyStateDescription>
                    El catálogo sigue ahí; lo que no encuentra nada es este filtro.
                  </EmptyStateDescription>
                  <EmptyStateActions>
                    <Button size="sm" variant="outline" onClick={() => setBusqueda("")}>
                      Quitar el filtro
                    </Button>
                  </EmptyStateActions>
                </EmptyState>
              ) : undefined
            }
          >
            <TableHeader>
              <TableRow>
                <TableHead listSlot="primary">Producto</TableHead>
                <TableHead format="numeric">Stock</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead listSlot="secondary">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Clickable
                        href="#pantallas"
                        border
                        radius="md"
                        overflowHidden
                        accessibilityLabel={`Foto de ${producto.nombre}`}
                        className="size-10 shrink-0"
                      >
                        <Image
                          fill
                          aspectRatio="1"
                          src={muestra("", producto.color, 80, 80)}
                          alt=""
                        />
                      </Clickable>
                      <Link href="#pantallas">{producto.nombre}</Link>
                    </div>
                  </TableCell>
                  <TableCell>{producto.stock}</TableCell>
                  <TableCell>{producto.creado}</TableCell>
                  <TableCell>
                    <Badge tone={producto.estado === "Publicado" ? "success" : "neutral"}>
                      {producto.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}
    </Container>
  );
};

export default PantallaListado;
