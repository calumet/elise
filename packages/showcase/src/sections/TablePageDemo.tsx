import { TablePage } from "@calumet/elise-blocks";
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
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@calumet/elise-ui/table";
import { useState } from "react";

const PEDIDOS = [
  { id: "#1042", cliente: "Marina Ferreyra", estado: "Pagado", total: "4.980" },
  { id: "#1041", cliente: "Nicolás Duarte", estado: "Pendiente", total: "12.300" },
  { id: "#1040", cliente: "Sofía Bermúdez", estado: "Pagado", total: "2.150" },
  { id: "#1039", cliente: "Tomás Iriarte", estado: "Reembolsado", total: "7.400" },
];

const TablePageDemo = () => {
  const [busqueda, setBusqueda] = useState("");
  const [vaciado, setVaciado] = useState(false);

  const filtrado = busqueda.trim().length > 0;
  const filas = vaciado
    ? []
    : PEDIDOS.filter((p) => p.cliente.toLowerCase().includes(busqueda.trim().toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setVaciado((v) => !v)}>
          {vaciado ? "Devolver los pedidos" : "Vaciar la lista"}
        </Button>
        <span className="text-sm text-muted-foreground">
          Vaciá la lista para ver el cartel de «no hay nada», o escribí un nombre que no exista para
          ver el de «no hay resultados». Son distintos porque se salen por sitios distintos.
        </span>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <TablePage
          size="full"
          headingAs="h2"
          heading="Pedidos"
          subtitle="Los últimos cuatro, con su estado de cobro."
          primaryAction={
            <Button size="sm">
              <Plus className="size-4" aria-hidden />
              Crear pedido
            </Button>
          }
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
          table={{ paginate: true, hasNextPage: true, paginationLabel: "1-4 de 4" }}
          empty={filas.length === 0}
          filtered={filtrado}
          emptyState={
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
          }
          filteredEmptyState={
            <EmptyState>
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
          }
        >
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead format="currency">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.cliente}</TableCell>
                <TableCell>{pedido.estado}</TableCell>
                <TableCell>{pedido.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TablePage>
      </div>
    </div>
  );
};

export default TablePageDemo;
