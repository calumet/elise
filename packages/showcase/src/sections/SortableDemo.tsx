import { SortableHandle, SortableItem, SortableList } from "@calumet/elise-ui/sortable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@calumet/elise-ui/table";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

const initialFields = [
  { id: "name", label: "Nombre completo" },
  { id: "email", label: "Correo institucional" },
  { id: "program", label: "Programa académico" },
  { id: "semester", label: "Semestre" },
];

const initialBanners = [
  { id: "legacy", title: "Legado EISI", visible: true },
  { id: "admissions", title: "Admisiones 2027", visible: true },
  { id: "maintenance", title: "Mantenimiento del portal", visible: false },
];

const byId = <T extends { id: string }>(rows: T[], ids: (string | number)[]) =>
  ids.map((id) => rows.find((row) => row.id === id)!);

export default function SortableDemo() {
  const [fields, setFields] = React.useState(initialFields);
  const [banners, setBanners] = React.useState(initialBanners);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <SortableList
        items={fields.map((field) => field.id)}
        onReorder={(ids) => setFields(byId(fields, ids))}
      >
        {fields.map((field) => (
          <SortableItem
            key={field.id}
            id={field.id}
            className="flex items-center gap-2 border border-border px-3 py-2.5"
          >
            <SortableHandle label={field.label} />
            <Text as="span" size="sm">
              {field.label}
            </Text>
          </SortableItem>
        ))}
      </SortableList>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Banner</TableHead>
            <TableHead>Visible</TableHead>
          </TableRow>
        </TableHeader>
        <SortableList
          asChild
          items={banners.map((banner) => banner.id)}
          onReorder={(ids) => setBanners(byId(banners, ids))}
        >
          <TableBody>
            {banners.map((banner) => (
              <SortableItem asChild key={banner.id} id={banner.id}>
                <TableRow clickDelegate={`edit-${banner.id}`}>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <SortableHandle label={banner.title} />
                      <a id={`edit-${banner.id}`} href={`#${banner.id}`}>
                        {banner.title}
                      </a>
                    </span>
                  </TableCell>
                  <TableCell>{banner.visible ? "Sí" : "No"}</TableCell>
                </TableRow>
              </SortableItem>
            ))}
          </TableBody>
        </SortableList>
      </Table>
    </div>
  );
}
