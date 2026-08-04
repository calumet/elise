import { Code } from "@calumet/elise-ui/code";
import { ColorPicker } from "@calumet/elise-ui/color-picker";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const ColorPickerDemo = () => {
  const [marca, setMarca] = useState("#2d69de");
  const [velo, setVelo] = useState("#16181ecc");

  return (
    <InlineStack gap={6} className="flex-wrap items-start">
      <BlockStack gap={2}>
        <Text size="sm" weight="semibold">
          Sin opacidad
        </Text>
        <ColorPicker value={marca} onValueChange={setMarca} name="marca" />
        <Text size="sm" tone="muted">
          Emite <Code>{marca}</Code>
        </Text>
      </BlockStack>

      <BlockStack gap={2}>
        <Text size="sm" weight="semibold">
          Con opacidad
        </Text>
        <ColorPicker alpha value={velo} onValueChange={setVelo} />
        <Text size="sm" tone="muted">
          Emite <Code>{velo}</Code>
        </Text>
      </BlockStack>

      <BlockStack gap={2} className="max-w-72">
        <Text size="sm" weight="semibold">
          Lo que acepta
        </Text>
        <Text size="sm" tone="muted">
          Escribe en el campo <Code>rgb(255 0 0 / 50%)</Code>, <Code>hsl(120 100% 50%)</Code> o{" "}
          <Code>#f008</Code>: los lee todos y siempre devuelve hex, de 6 o de 8 con{" "}
          <Code>alpha</Code>. Es el contrato de <Code>s-color-picker</Code>.
        </Text>
        <Text size="sm" tone="muted">
          El área lleva teclado: flechas de una en una y con mayúsculas de diez en diez. Las dos
          barras son deslizadores de verdad, así que anuncian su valor.
        </Text>
        <div
          className="h-24 w-full rounded-xl ring-1 ring-border-strong ring-inset"
          style={{ backgroundColor: marca }}
          aria-hidden="true"
        />
      </BlockStack>
    </InlineStack>
  );
};

export default ColorPickerDemo;
