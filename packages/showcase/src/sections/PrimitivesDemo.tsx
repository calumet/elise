import { Badge } from "@calumet/elise-ui/badge";
import { Bleed } from "@calumet/elise-ui/bleed";
import { Box } from "@calumet/elise-ui/box";
import { Button } from "@calumet/elise-ui/button";
import { Grid } from "@calumet/elise-ui/grid";
import { Separator } from "@calumet/elise-ui/separator";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";

const tamanos = ["3xl", "2xl", "xl", "lg", "base", "sm", "xs", "2xs"] as const;

const PrimitivesDemo = () => (
  <BlockStack gap={8} className="w-full">
    <BlockStack gap={3}>
      <Text size="sm" weight="semibold">
        Text, con interlineado y tracking por tamaño
      </Text>
      <BlockStack gap={2}>
        {tamanos.map((size) => (
          <InlineStack key={size} gap={4} align="baseline">
            <Text size="2xs" tone="muted" className="w-10 shrink-0 font-mono">
              {size}
            </Text>
            <Text size={size} weight={size === "3xl" || size === "2xl" ? "bold" : "normal"}>
              Plataforma frontend de Calumet
            </Text>
          </InlineStack>
        ))}
      </BlockStack>
    </BlockStack>

    <BlockStack gap={3}>
      <Text size="sm" weight="semibold">
        Box toma superficie, borde, radio y elevación de los tokens
      </Text>
      <Grid columns={1} smColumns={2} lgColumns={4} gap={4}>
        <Box padding={4} background="card" border radius="xl" shadow="sm">
          <Text size="sm">card + border + shadow</Text>
        </Box>
        <Box padding={4} background="muted" radius="xl">
          <Text size="sm">muted</Text>
        </Box>
        <Box padding={4} background="accent" radius="xl">
          <Text size="sm">accent</Text>
        </Box>
        <Box padding={4} border="strong" radius="xl">
          <Text size="sm">border-strong</Text>
        </Box>
      </Grid>
    </BlockStack>

    <BlockStack gap={3}>
      <Text size="sm" weight="semibold">
        Grid mobile-first, de 1 a 2 y a 3 columnas
      </Text>
      <Grid columns={1} smColumns={2} mdColumns={3} gap={3}>
        {["Diseño", "Ingeniería", "Producto", "Soporte", "Ventas", "Datos"].map((area) => (
          <Box key={area} padding={3} background="muted" radius="lg">
            <Text size="sm">{area}</Text>
          </Box>
        ))}
      </Grid>
    </BlockStack>

    <BlockStack gap={3}>
      <Text size="sm" weight="semibold">
        Bleed rompe el padding del contenedor
      </Text>
      <Grid columns={1} mdColumns={2} gap={4}>
        <Box background="card" border radius="xl" padding={4} overflowHidden>
          <BlockStack gap={3}>
            <InlineStack justify="between" gap={2}>
              <Text weight="semibold">Sin Bleed</Text>
              <Badge tone="neutral" size="sm">
                padding 4
              </Badge>
            </InlineStack>
            <Separator />
            <Text size="sm" tone="muted">
              El separador respeta el padding y no llega a los bordes.
            </Text>
          </BlockStack>
        </Box>
        <Box background="card" border radius="xl" padding={4} overflowHidden>
          <BlockStack gap={3}>
            <InlineStack justify="between" gap={2}>
              <Text weight="semibold">Con Bleed</Text>
              <Badge tone="brand" size="sm">
                x=4
              </Badge>
            </InlineStack>
            <Bleed x={4}>
              <Separator />
            </Bleed>
            <Text size="sm" tone="muted">
              El separador llega de borde a borde sin sacarle el padding a la Box.
            </Text>
          </BlockStack>
        </Box>
      </Grid>
    </BlockStack>

    <BlockStack gap={3}>
      <Text size="sm" weight="semibold">
        InlineStack, align y justify
      </Text>
      <Box padding={4} background="muted" radius="xl">
        <InlineStack gap={3} justify="between">
          <InlineStack gap={2}>
            <Badge tone="success">Activo</Badge>
            <Text size="sm" tone="muted">
              Actualizado hace 3 minutos
            </Text>
          </InlineStack>
          <InlineStack gap={2}>
            <Button size="sm" variant="ghost">
              Descartar
            </Button>
            <Button size="sm">Aplicar</Button>
          </InlineStack>
        </InlineStack>
      </Box>
    </BlockStack>
  </BlockStack>
);

export default PrimitivesDemo;
