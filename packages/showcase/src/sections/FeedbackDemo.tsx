import { FolderOpen } from "@calumet/elise-icons";
import { Alert, AlertDescription, AlertTitle } from "@calumet/elise-ui/alert";
import { Badge } from "@calumet/elise-ui/badge";
import { Box } from "@calumet/elise-ui/box";
import { Button } from "@calumet/elise-ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
import { Spinner } from "@calumet/elise-ui/spinner";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const tonos = ["neutral", "brand", "success", "warning", "danger", "info"] as const;

const FeedbackDemo = () => {
  const [visible, setVisible] = useState(true);

  return (
    <BlockStack gap={6} className="w-full">
      <BlockStack gap={3}>
        <Text size="sm" weight="semibold">
          Badge
        </Text>
        <InlineStack gap={2}>
          {tonos.map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </InlineStack>
        <InlineStack gap={2}>
          {tonos.map((tone) => (
            <Badge key={tone} tone={tone} variant="solid">
              {tone}
            </Badge>
          ))}
        </InlineStack>
        <InlineStack gap={2}>
          {tonos.map((tone) => (
            <Badge key={tone} tone={tone} variant="outline" size="sm">
              {tone}
            </Badge>
          ))}
        </InlineStack>
      </BlockStack>

      <BlockStack gap={3}>
        <Text size="sm" weight="semibold">
          Alert
        </Text>
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
          <InlineStack>
            <Button size="sm" variant="outline" onClick={() => setVisible(true)}>
              Restaurar alerta
            </Button>
          </InlineStack>
        )}
      </BlockStack>

      <BlockStack gap={3}>
        <Text size="sm" weight="semibold">
          Spinner
        </Text>
        <InlineStack gap={4}>
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" className="text-primary" />
          <Button disabled>
            <Spinner size="sm" />
            Guardando
          </Button>
        </InlineStack>
      </BlockStack>

      <BlockStack gap={3}>
        <Text size="sm" weight="semibold">
          Empty state
        </Text>
        <Box background="card" border radius="xl">
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
        </Box>
      </BlockStack>
    </BlockStack>
  );
};

export default FeedbackDemo;
