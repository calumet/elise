import { Avatar, AvatarFallback } from "@calumet/elise-ui/avatar";
import { AvatarGroup } from "@calumet/elise-ui/avatar-group";
import { Badge } from "@calumet/elise-ui/badge";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
} from "@calumet/elise-ui/description-list";
import { BlockStack } from "@calumet/elise-ui/stack";
import { Stat } from "@calumet/elise-ui/stat";
import { Text } from "@calumet/elise-ui/text";
import { Timeline, TimelineItem } from "@calumet/elise-ui/timeline";
import { Tree, TreeItem } from "@calumet/elise-ui/tree";
import { useState } from "react";

const gente = ["Sarah Johnson", "Mike Chen", "Emma Davis", "Luis Prado", "Ana Ruiz", "Tom Vega"];
const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .map((p) => p[0])
    .join("");

const DisplayDemo = () => {
  const [elegido, setElegido] = useState("ui");

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <BlockStack gap={5}>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <Stat
            label="Ingresos"
            value="$12.480"
            change="+12,4%"
            trend="up"
            description="vs. mes anterior"
          />
          <Stat
            label="Devoluciones"
            value="18"
            change="-31%"
            trend="up"
            description="menos es mejor"
          />
          <Stat label="Pedidos" value="1.204" change="0%" trend="flat" />
        </div>

        <BlockStack gap={2}>
          <Text size="sm" weight="semibold">
            Equipo
          </Text>
          <AvatarGroup max={4}>
            {gente.map((nombre) => (
              <Avatar key={nombre}>
                <AvatarFallback>{iniciales(nombre)}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <Text size="sm" tone="muted">
            Seis personas, cuatro caras y el resto en una ficha.
          </Text>
        </BlockStack>

        <BlockStack gap={2}>
          <Text size="sm" weight="semibold">
            Detalles del pedido
          </Text>
          <DescriptionList gap="tight">
            <DescriptionListTerm>Estado</DescriptionListTerm>
            <DescriptionListDescription>
              <Badge tone="success">Enviado</Badge>
            </DescriptionListDescription>
            <DescriptionListTerm>Transportista</DescriptionListTerm>
            <DescriptionListDescription>Servientrega</DescriptionListDescription>
            <DescriptionListTerm>Seguimiento</DescriptionListTerm>
            <DescriptionListDescription>CO-4820-118-XZ</DescriptionListDescription>
          </DescriptionList>
        </BlockStack>
      </BlockStack>

      <BlockStack gap={5}>
        <BlockStack gap={2}>
          <Text size="sm" weight="semibold">
            Actividad
          </Text>
          <Timeline>
            <TimelineItem time="Hoy, 09:12" title="Pedido entregado" tone="success">
              Firmado por A. Ruiz.
            </TimelineItem>
            <TimelineItem time="Ayer, 18:40" title="En reparto" tone="info" />
            <TimelineItem time="12 mar, 11:02" title="Incidencia en aduana" tone="warning">
              Retenido 6 horas por revisión documental.
            </TimelineItem>
            <TimelineItem time="10 mar, 08:30" title="Pedido creado" />
          </Timeline>
        </BlockStack>

        <BlockStack gap={2}>
          <Text size="sm" weight="semibold">
            Paquetes
          </Text>
          <Tree defaultExpanded={["packages", "ui"]} value={elegido} onValueChange={setElegido}>
            <TreeItem id="packages" label="packages">
              <TreeItem id="ui" label="elise-ui">
                <TreeItem id="components" label="components" />
                <TreeItem id="tailwind" label="tailwind" />
              </TreeItem>
              <TreeItem id="tables" label="elise-tables" />
              <TreeItem id="forms" label="elise-forms" />
            </TreeItem>
            <TreeItem id="docs" label="docs">
              <TreeItem id="plan" label="plan.md" />
            </TreeItem>
          </Tree>
          <Text size="sm" tone="muted">
            Entra con el tabulador una sola vez y muévete con las flechas: derecha abre o baja,
            izquierda cierra o sube al padre.
          </Text>
        </BlockStack>
      </BlockStack>
    </div>
  );
};

export default DisplayDemo;
