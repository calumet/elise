import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@elise/ui/table";

const rows = [
  { name: "Elise UI", status: "Stable", version: "0.1.0" },
  { name: "Showcase", status: "Draft", version: "0.0.1" },
  { name: "Utils", status: "Alpha", version: "0.1.0" },
];

const TableDemo = () => {
  return (
    <Table>
      <TableCaption>Ejemplo de tabla simple con los primitivos de UI.</TableCaption>
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
  );
};

export default TableDemo;
