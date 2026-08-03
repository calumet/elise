import { Badge } from "@calumet/elise-ui/badge";
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

const rows = [
  { name: "Elise UI", status: "Stable", version: "0.1.0" },
  { name: "Showcase", status: "Draft", version: "0.0.1" },
  { name: "Utils", status: "Alpha", version: "0.1.0" },
];

const clientes = [
  {
    id: "#1001",
    nombre: "Sarah Johnson",
    correo: "sarah@example.com",
    estado: "Activo",
    tono: "success" as const,
    pedidos: 23,
    total: "$1.245,50",
  },
  {
    id: "#1002",
    nombre: "Mike Chen",
    correo: "mike@example.com",
    estado: "Inactivo",
    tono: "neutral" as const,
    pedidos: 7,
    total: "$432,75",
  },
  {
    id: "#1003",
    nombre: "Emma Davis",
    correo: "emma@example.com",
    estado: "Activo",
    tono: "success" as const,
    pedidos: 15,
    total: "$892,25",
  },
];

const PorPagina = 3;

const TableDemo = () => {
  const [pagina, setPagina] = useState(0);
  const total = clientes.length * 3; // finge tres páginas para poder pasarlas
  const desde = pagina * PorPagina + 1;
  const hasta = Math.min(desde + PorPagina - 1, total);

  return (
    <div className="flex flex-col gap-6">
      <Table variant="table">
        <TableHeader>
          <TableRow>
            <TableHead>Proyecto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Versión</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.version}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-2">
        <Text size="sm" tone="muted">
          Con <code>paginate</code> la franja va dentro de la tarjeta y al pie, y el rango se lee
          entre los dos pasos. <code>format</code> alinea a la derecha y numera a ancho fijo, así
          que las cifras cuadran columna abajo.
        </Text>
        <Table
          variant="table"
          paginate
          hasPreviousPage={pagina > 0}
          hasNextPage={hasta < total}
          onPreviousPage={() => setPagina((p) => Math.max(0, p - 1))}
          onNextPage={() => setPagina((p) => p + 1)}
          paginationLabel={`${desde}–${hasta} de ${total}`}
        >
          <TableHeader>
            <TableRow>
              <TableHead listSlot="kicker">ID</TableHead>
              <TableHead listSlot="primary">Cliente</TableHead>
              <TableHead listSlot="secondary">Correo</TableHead>
              <TableHead listSlot="inline">Estado</TableHead>
              <TableHead listSlot="labeled" format="numeric">
                Pedidos
              </TableHead>
              <TableHead listSlot="labeled" format="currency">
                Total gastado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.id}</TableCell>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.correo}</TableCell>
                <TableCell>
                  <Badge tone={cliente.tono}>{cliente.estado}</Badge>
                </TableCell>
                <TableCell>{cliente.pedidos}</TableCell>
                <TableCell>{cliente.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2">
        <Text size="sm" tone="muted">
          La misma tabla en modo lista. Cada columna dice qué papel juega con <code>listSlot</code>:
          el ID va de antetítulo, el nombre de principal, el correo debajo, el estado pegado al
          nombre y las dos cifras como pares de rótulo y valor. Con{" "}
          <code>variant=&quot;auto&quot;</code>
          —el valor por omisión— la tabla cambia sola a esto cuando no le caben 490px.
        </Text>
        <div className="max-w-100">
          <Table variant="list">
            <TableHeader>
              <TableRow>
                <TableHead listSlot="kicker">ID</TableHead>
                <TableHead listSlot="primary">Cliente</TableHead>
                <TableHead listSlot="secondary">Correo</TableHead>
                <TableHead listSlot="inline">Estado</TableHead>
                <TableHead listSlot="labeled" format="numeric">
                  Pedidos
                </TableHead>
                <TableHead listSlot="labeled" format="currency">
                  Total gastado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.id}</TableCell>
                  <TableCell>{cliente.nombre}</TableCell>
                  <TableCell>{cliente.correo}</TableCell>
                  <TableCell>
                    <Badge tone={cliente.tono}>{cliente.estado}</Badge>
                  </TableCell>
                  <TableCell>{cliente.pedidos}</TableCell>
                  <TableCell>{cliente.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TableDemo;
