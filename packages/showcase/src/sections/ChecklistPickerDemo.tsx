import { ChecklistDialog } from "@calumet/elise-blocks/checklist-dialog";
import { ChecklistField } from "@calumet/elise-blocks/checklist-field";
import type {
  ChecklistPickerFilter,
  ChecklistPickerOption,
} from "@calumet/elise-blocks/checklist-picker";
import { ChecklistTable } from "@calumet/elise-blocks/checklist-table";
import { BlockStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

const schools = [
  { id: "industrial", label: "Ingeniería Industrial", description: "EII", filter: "ing" },
  { id: "civil", label: "Ingeniería Civil", description: "ECI", filter: "ing" },
  { id: "medicina", label: "Medicina", description: "MED", filter: "salud" },
  { id: "enfermeria", label: "Enfermería", description: "ENF", filter: "salud" },
  { id: "derecho", label: "Derecho", description: "DER", filter: "humanas" },
  { id: "educacion", label: "Educación", description: "EDU", filter: "humanas" },
  { id: "idiomas", label: "Idiomas", description: "IDI", filter: "humanas" },
];

const faculties = [
  { value: "ing", label: "Ingenierías" },
  { value: "salud", label: "Salud" },
  { value: "humanas", label: "Humanas" },
];

const modules = [
  "Agenda",
  "Archivo",
  "Biblioteca",
  "Calificaciones",
  "Comunicados",
  "Encuestas",
  "Eventos",
  "Finanzas",
  "Foros",
  "Horarios",
  "Inscripciones",
  "Inventario",
  "Mensajes",
  "Reportes",
  "Reservas",
  "Tareas",
];

const actions = ["Ver", "Crear", "Editar", "Borrar"];

const permissions: ChecklistPickerOption[] = modules.flatMap((module) =>
  actions.map((action) => ({
    id: `${module}.${action}`,
    label: `${action} en ${module}`,
    filter: module,
  })),
);

const moduleFilters = modules.map((module) => ({ value: module, label: module }));

type PickerFieldProps = {
  title: string;
  options: ChecklistPickerOption[];
  filters: ChecklistPickerFilter[];
  locked?: ChecklistPickerOption[];
  empty: string;
  note?: string;
};

const PickerField = ({ title, options, filters, locked = [], empty, note }: PickerFieldProps) => {
  const [open, setOpen] = React.useState(false);
  const [applied, setApplied] = React.useState<ReadonlySet<string>>(new Set());

  const items = [
    ...locked.map(({ id, label }) => ({ id, label, locked: true })),
    ...options.filter(({ id }) => applied.has(id)).map(({ id, label }) => ({ id, label })),
  ];

  return (
    <>
      <ChecklistField
        title={title}
        note={note}
        items={items}
        empty={<Text tone="muted">{empty}</Text>}
        editLabel="Asignar"
        onEdit={() => setOpen(true)}
        onRemove={(id) =>
          setApplied((prev) => new Set([...prev].filter((applied) => applied !== id)))
        }
      />
      <ChecklistDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description="Busca por nombre o filtra."
        locale="es"
        options={options}
        filters={filters}
        selected={applied}
        onApply={setApplied}
      />
    </>
  );
};

export default function ChecklistPickerDemo() {
  return (
    <BlockStack gap={6}>
      <BlockStack gap={2}>
        <Text size="sm" weight="medium">
          Con pestañas
        </Text>
        <PickerField
          title="Difundir a otras escuelas"
          options={schools}
          filters={faculties}
          locked={[{ id: "sistemas", label: "Ingeniería de Sistemas", filter: "ing" }]}
          empty="Ninguna escuela elegida."
          note="Las de color vienen de los registros de la universidad y no se retiran aquí."
        />
      </BlockStack>
      <BlockStack gap={2}>
        <Text size="sm" weight="medium">
          En tabla, con el picker agrupado
        </Text>
        <PermissionsTable />
      </BlockStack>
    </BlockStack>
  );
}

const PermissionsTable = () => {
  const [open, setOpen] = React.useState(false);
  const [applied, setApplied] = React.useState<ReadonlySet<string>>(
    new Set(permissions.slice(0, 14).map(({ id }) => id)),
  );

  return (
    <>
      <ChecklistTable
        locale="es"
        options={permissions}
        filters={moduleFilters}
        selected={applied}
        title="Permisos del perfil"
        description="Lo que puede hacer quien tiene el perfil."
        editLabel="Conceder permisos"
        columns={{ option: "Permiso", filter: "Módulo" }}
        empty={{
          title: "Este perfil todavía no concede permisos",
          description: "Elige qué puede hacer quien lo tenga.",
        }}
        onEdit={() => setOpen(true)}
        onRemove={(id) =>
          setApplied((prev) => new Set([...prev].filter((applied) => applied !== id)))
        }
      />
      <ChecklistDialog
        open={open}
        onOpenChange={setOpen}
        title="Conceder permisos"
        description="Busca por permiso o por módulo."
        locale="es"
        layout="groups"
        options={permissions}
        filters={moduleFilters}
        selected={applied}
        onApply={setApplied}
      />
    </>
  );
};
