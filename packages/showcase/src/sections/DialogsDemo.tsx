import { openAlert } from "@calumet/elise-alerts";
import { Button } from "@calumet/elise-ui/button";
import { DateField } from "@calumet/elise-ui/date-field";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@calumet/elise-ui/dialog";
import { Field } from "@calumet/elise-ui/field";
import { Input } from "@calumet/elise-ui/input";
import { Textarea } from "@calumet/elise-ui/textarea";
import { useState } from "react";

const DialogsDemo = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Modal completo: cabecera y pie fijos sobre banda tenue, cuerpo que se
          desplaza, y las acciones con la primaria al final de la fila. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Modal completo</Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Nueva compañía</DialogTitle>
            <DialogDescription>
              Los campos marcados con asterisco son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="flex flex-col gap-4">
            <Field label="Nombre" required>
              {(control) => <Input {...control} placeholder="Calumet S.A.S." />}
            </Field>
            <Field label="NIT" description="Sin dígito de verificación.">
              {(control) => <Input {...control} placeholder="900123456" inputMode="numeric" />}
            </Field>
            <DateField label="Inicio del contrato" min="2026-01-01" />
            <Field label="Notas" description="Solo lo ve tu equipo.">
              {(control) => <Textarea {...control} rows={4} placeholder="Contexto del acuerdo…" />}
            </Field>
            <p className="text-sm text-muted-foreground">
              El cuerpo es lo único que se desplaza: baja aquí y verás que el título y las acciones
              se quedan donde están.
            </p>
            <div
              className="h-40 rounded-md border border-dashed border-border"
              aria-hidden="true"
            />
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={() => setOpen(false)}>Crear compañía</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Modal corto</Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>¿Descartar los cambios?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription>Se perderá lo que hayas escrito en el formulario.</DialogDescription>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Seguir editando</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button tone="danger">Descartar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        tone="success"
        onClick={() =>
          openAlert({
            variant: "confirm",
            title: "¿Seguro?",
            description: "Esta acción no se puede deshacer. Confirma para continuar.",
            confirmLabel: "Confirmar",
            cancelLabel: "Cancelar",
          })
        }
      >
        Confirmar
      </Button>

      <Button
        onClick={() =>
          openAlert({
            variant: "info",
            title: "Información",
            description: "Esto es un ejemplo de alerta informativa.",
          })
        }
      >
        Info
      </Button>

      <Button
        tone="warning"
        onClick={() =>
          openAlert({
            variant: "alert",
            title: "Alerta",
            description: "Revisa este cambio antes de continuar.",
          })
        }
      >
        Alerta
      </Button>

      <Button
        tone="danger"
        onClick={() =>
          openAlert({
            variant: "error",
            title: "Error",
            description: "Ocurrió un problema al guardar.",
          })
        }
      >
        Error
      </Button>

      <Button
        tone="success"
        onClick={() =>
          openAlert({
            variant: "success",
            title: "Listo",
            description: "La operación se completó correctamente.",
          })
        }
      >
        Success
      </Button>
    </div>
  );
};

export default DialogsDemo;
