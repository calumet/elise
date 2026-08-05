import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { Input } from "@calumet/elise-ui/input";
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
  const [cargando, setCargando] = useState(false);
  const [pulsaciones, setPulsaciones] = useState<string[]>([]);
  const total = clientes.length * 3; // finge tres páginas para poder pasarlas
  const desde = pagina * PorPagina + 1;
  const hasta = Math.min(desde + PorPagina - 1, total);

  /* Pasar de página tarda: es lo que deja ver el aviso de carga y que lo de
     debajo deja de responder mientras tanto. */
  const pasar = (a: number) => {
    setCargando(true);
    setTimeout(() => {
      setPagina(a);
      setCargando(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      <Text size="sm" tone="muted">
        Esto y la sección de abajo se ven igual a propósito. <code>Table</code> es el primitivo:
        escribes el marcado y llevas tú el estado. <code>DataTable</code> es el envoltorio opinado
        que va encima, sobre TanStack Table: le pasas columnas y datos y arma solo los filtros, el
        orden, las páginas y la exportación. Lo que cambia es cuánto escribes y quién guarda el
        estado, no cómo se ve.
      </Text>

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
          que las cifras cuadran columna abajo. Los filtros van por la ranura <code>filters</code>,
          dentro de la misma tarjeta. Pulsa una fila: con <code>clickDelegate</code> el clic se lo
          lleva el enlace del nombre, y pulsar el correo o la insignia no dispara nada. Al pasar de
          página baja el aviso de carga y lo de debajo deja de responder.
        </Text>
        <Text size="sm" tone="muted" aria-live="polite">
          Pulsaciones: <strong>{pulsaciones.length}</strong>, la última en{" "}
          <strong>{pulsaciones[pulsaciones.length - 1] ?? "ninguna"}</strong>
        </Text>
        <Table
          variant="table"
          paginate
          hasPreviousPage={pagina > 0}
          hasNextPage={hasta < total}
          onPreviousPage={() => pasar(Math.max(0, pagina - 1))}
          onNextPage={() => pasar(pagina + 1)}
          paginationLabel={`${desde}-${hasta} de ${total}`}
          loading={cargando}
          loadingLabel="Cargando clientes"
          filters={
            <div className="flex flex-wrap items-center gap-2">
              <Input placeholder="Buscar cliente" className="w-56" />
              <Button variant="outline" size="sm">
                Estado
              </Button>
              <Button variant="outline" size="sm">
                Más filtros
              </Button>
            </div>
          }
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
              <TableRow key={cliente.id} clickDelegate={`abrir-${cliente.id.slice(1)}`}>
                <TableCell>{cliente.id}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    id={`abrir-${cliente.id.slice(1)}`}
                    className="cursor-pointer rounded-xs underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setPulsaciones((p) => [...p, cliente.nombre])}
                  >
                    {cliente.nombre}
                  </button>
                </TableCell>
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
          <code>variant=&quot;auto&quot;</code>, que es el valor por omisión, la tabla cambia sola a
          esto cuando no le caben 490px.
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
