import { Plus, Search } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
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

const PEDIDOS = [
  { id: "#1042", cliente: "Marina Ferreyra", estado: "Pagado" },
  { id: "#1041", cliente: "Nicolás Duarte", estado: "Pendiente" },
  { id: "#1040", cliente: "Sofía Bermúdez", estado: "Pagado" },
];

const VaciosDemo = () => {
  const [busqueda, setBusqueda] = useState("");
  const [vaciado, setVaciado] = useState(false);

  const filtrado = busqueda.trim().length > 0;
  const filas = vaciado
    ? []
    : PEDIDOS.filter((p) => p.cliente.toLowerCase().includes(busqueda.trim().toLowerCase()));

  const sinResultados = filtrado && filas.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setVaciado((v) => !v)}>
          {vaciado ? "Devolver los pedidos" : "Vaciar la lista"}
        </Button>
        <Text size="sm" tone="muted">
          Vaciá la lista para ver el cartel que ocupa el lugar de la tabla entera, o escribí un
          nombre que no exista para ver el que va dentro del marco, con el filtro en pie.
        </Text>
      </div>

      {vaciado ? (
        /* Nada creado todavía: no hay filtros que preservar, así que el estado
           vacío ocupa el sitio de la tabla entera. */
        <Section accessibilityLabel="Sin pedidos">
          <EmptyState>
            <EmptyStateMedia>
              <Plus className="size-6" aria-hidden />
            </EmptyStateMedia>
            <EmptyStateTitle>Todavía no hay pedidos</EmptyStateTitle>
            <EmptyStateDescription>
              Cuando alguien compre, el pedido aparece acá.
            </EmptyStateDescription>
            <EmptyStateActions>
              <Button size="sm">Crear pedido</Button>
            </EmptyStateActions>
          </EmptyState>
        </Section>
      ) : (
        <Section heading="Pedidos" padding="none">
          <Table
            bare
            paginate
            hasNextPage
            paginationLabel={`1-${filas.length} de ${filas.length}`}
            filters={
              <SearchField
                label="Buscar por cliente"
                labelHidden
                value={busqueda}
                onValueChange={setBusqueda}
                placeholder="Buscar por cliente"
                className="max-w-72"
              />
            }
            empty={
              sinResultados ? (
                <EmptyState size="sm">
                  <EmptyStateMedia>
                    <Search className="size-6" aria-hidden />
                  </EmptyStateMedia>
                  <EmptyStateTitle>Sin pedidos de «{busqueda}»</EmptyStateTitle>
                  <EmptyStateDescription>
                    Los pedidos siguen ahí; lo que no encuentra nada es este filtro.
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
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.id}</TableCell>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell>{pedido.estado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}
    </div>
  );
};

export default VaciosDemo;
