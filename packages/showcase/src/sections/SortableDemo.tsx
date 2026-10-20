import { Ellipsis } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@calumet/elise-ui/sheet";
import {
  SortableHandle,
  SortableItem,
  SortableList,
  SortableTree,
  type SortableTreeMove,
  type SortableTreeNode,
} from "@calumet/elise-blocks/sortable";
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

const initialMenu: SortableTreeNode[] = [
  { id: "home", label: "Inicio", draggable: false, acceptsChildren: false },
  {
    id: "school",
    label: "La escuela",
    children: [
      { id: "history", label: "Historia" },
      {
        id: "programs",
        label: "Programas",
        children: [
          {
            id: "undergrad",
            label: "Pregrado",
            children: [
              { id: "systems", label: "Ingeniería de Sistemas" },
              { id: "industrial", label: "Ingeniería Industrial" },
            ],
          },
          { id: "postgrad", label: "Posgrado" },
        ],
      },
    ],
  },
  {
    id: "admissions",
    label: "Admisiones",
    children: [
      { id: "calendar", label: "Calendario" },
      { id: "fees", label: "Costos" },
    ],
  },
  { id: "contact", label: "Contacto" },
];

const byId = <T extends { id: string }>(rows: T[], ids: (string | number)[]) =>
  ids.map((id) => rows.find((row) => row.id === id)!);

export default function SortableDemo() {
  const [fields, setFields] = React.useState(initialFields);
  const [banners, setBanners] = React.useState(initialBanners);
  const [menu, setMenu] = React.useState(initialMenu);
  const [lastMove, setLastMove] = React.useState<SortableTreeMove>();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <SortableTree
          items={menu}
          maxDepth={4}
          defaultCollapsed={["admissions"]}
          onMove={(move, items) => {
            setLastMove(move);
            setMenu(items);
          }}
          renderItem={(node) => (
            <span className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate">{node.label}</span>
              <Button variant="ghost" size="icon-sm" aria-label={`Acciones de ${node.label}`}>
                <Ellipsis aria-hidden="true" />
              </Button>
            </span>
          )}
        />
        <Text size="sm" tone="muted">
          {lastMove
            ? `${lastMove.id} → ${lastMove.parentId ?? "raíz"}, posición ${lastMove.index}`
            : "Hasta 4 niveles. Inicio no se mueve ni admite hijos."}
        </Text>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="self-start">
            Ordenar en una hoja
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menú y campos</SheetTitle>
            <SheetDescription>
              Escape durante un arrastre lo cancela sin cerrar la hoja.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="flex flex-col gap-6">
            <SortableTree items={menu} maxDepth={4} onMove={(_, items) => setMenu(items)} />
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
          </SheetBody>
        </SheetContent>
      </Sheet>

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
