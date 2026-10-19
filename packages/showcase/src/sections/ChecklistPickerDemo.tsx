import { Button } from "@calumet/elise-ui/button";
import { ChecklistPicker } from "@calumet/elise-ui/checklist-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@calumet/elise-ui/dialog";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

const schools = [
  { id: "sistemas", label: "Ingeniería de Sistemas", description: "EISI", filter: "ing" },
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

export default function ChecklistPickerDemo() {
  const [applied, setApplied] = React.useState<ReadonlySet<string>>(new Set());
  const [draft, setDraft] = React.useState<ReadonlySet<string>>(applied);

  return (
    <div className="flex flex-col gap-3">
      <Dialog
        onOpenChange={(open) => {
          if (open) setDraft(applied);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" className="self-start">
            Elegir escuelas
          </Button>
        </DialogTrigger>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Difundir a otras escuelas</DialogTitle>
            <DialogDescription>Busca por nombre o sigla, o filtra por facultad.</DialogDescription>
          </DialogHeader>
          <ChecklistPicker
            locale="es"
            options={schools}
            filters={faculties}
            selected={draft}
            onToggle={(id, checked) =>
              setDraft((prev) => {
                const next = new Set(prev);
                if (checked) next.add(id);
                else next.delete(id);
                return next;
              })
            }
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => setApplied(draft)}>Aplicar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Text size="sm" tone="muted">
        {applied.size ? `Elegidas: ${[...applied].join(", ")}` : "Ninguna escuela elegida."}
      </Text>
    </div>
  );
}
