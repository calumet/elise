import { FolderOpen } from "@calumet/elise-icons";
import { Alert, AlertDescription, AlertTitle } from "@calumet/elise-ui/alert";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
import { Spinner } from "@calumet/elise-ui/spinner";
import { useState } from "react";

const tonos = ["neutral", "brand", "success", "warning", "danger", "info"] as const;

const FeedbackDemo = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Badge</p>
        <div className="flex flex-wrap items-center gap-2">
          {tonos.map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tonos.map((tone) => (
            <Badge key={tone} tone={tone} variant="solid">
              {tone}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tonos.map((tone) => (
            <Badge key={tone} tone={tone} variant="outline" size="sm">
              {tone}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Alert</p>
        <Alert tone="info">
          <AlertTitle>Migración programada</AlertTitle>
          <AlertDescription>
            El servicio estará en solo lectura el sábado de 02:00 a 04:00.
          </AlertDescription>
        </Alert>
        <Alert tone="success">
          <AlertTitle>Dominio verificado</AlertTitle>
        </Alert>
        <Alert tone="warning">
          <AlertTitle>Tu plan vence en 5 días</AlertTitle>
          <AlertDescription>Renueva para no perder los reportes programados.</AlertDescription>
        </Alert>
        {visible ? (
          <Alert tone="danger" onDismiss={() => setVisible(false)}>
            <AlertTitle>No pudimos procesar el pago</AlertTitle>
            <AlertDescription>
              La tarjeta terminada en 4242 fue rechazada. Actualízala e intenta de nuevo.
            </AlertDescription>
          </Alert>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setVisible(true)}>
            Restaurar alerta
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Spinner</p>
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" className="text-primary" />
          <Button disabled>
            <Spinner size="sm" />
            Guardando
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Empty state</p>
        <div className="rounded-xl border border-border bg-card">
          <EmptyState>
            <EmptyStateMedia>
              <FolderOpen />
            </EmptyStateMedia>
            <EmptyStateTitle>Todavía no hay proyectos</EmptyStateTitle>
            <EmptyStateDescription>
              Crea el primero para empezar a agrupar tableros, tablas y reportes.
            </EmptyStateDescription>
            <EmptyStateActions>
              <Button size="sm">Crear proyecto</Button>
              <Button size="sm" variant="outline">
                Importar
              </Button>
            </EmptyStateActions>
          </EmptyState>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDemo;
