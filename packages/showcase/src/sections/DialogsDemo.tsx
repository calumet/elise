import { Button } from "@calumet/elise-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@calumet/elise-ui/dialog";
import { openAlert } from "@calumet/elise-utils/alerts";
import { useState } from "react";

const DialogsDemo = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog ligero</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-muted-foreground">
            Usa Radix Dialog con estilos base del preset.
          </DialogDescription>
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
