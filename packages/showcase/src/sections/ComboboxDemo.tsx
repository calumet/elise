import { Badge } from "@calumet/elise-ui/badge";
import { Combobox, type ComboboxOption } from "@calumet/elise-ui/combobox";
import { Label } from "@calumet/elise-ui/label";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const paises: ComboboxOption[] = [
  { value: "co", label: "Colombia", description: "Bogotá", keywords: ["bogota", "cafe"] },
  { value: "mx", label: "México", description: "Ciudad de México", keywords: ["cdmx"] },
  { value: "ar", label: "Argentina", description: "Buenos Aires", keywords: ["baires"] },
  { value: "cl", label: "Chile", description: "Santiago" },
  { value: "pe", label: "Perú", description: "Lima" },
  { value: "es", label: "España", description: "Madrid", keywords: ["espana"] },
  { value: "uy", label: "Uruguay", description: "Montevideo", disabled: true },
];

const equipos: ComboboxOption[] = [
  { value: "core", label: "Core", group: "Ingeniería" },
  { value: "dx", label: "Developer Experience", group: "Ingeniería" },
  { value: "sre", label: "SRE", group: "Ingeniería" },
  { value: "brand", label: "Marca", group: "Diseño" },
  { value: "product", label: "Producto", group: "Diseño" },
];

const ComboboxDemo = () => {
  const [pais, setPais] = useState("co");
  const [equipo, setEquipo] = useState("");

  return (
    <BlockStack gap={6} className="w-full">
      <BlockStack gap={4} className="max-w-sm">
        <BlockStack gap={2}>
          <Label htmlFor="cb-pais">País</Label>
          <Combobox
            id="cb-pais"
            options={paises}
            value={pais}
            onValueChange={setPais}
            clearable
            searchPlaceholder="Buscar país…"
          />
          <Text size="xs" tone="muted">
            Busca por nombre o por capital — "bogota" y "cdmx" también encuentran.
          </Text>
        </BlockStack>

        <BlockStack gap={2}>
          <Label htmlFor="cb-equipo">Equipo</Label>
          <Combobox
            id="cb-equipo"
            options={equipos}
            value={equipo}
            onValueChange={setEquipo}
            placeholder="Sin asignar"
            emptyMessage="Ningún equipo coincide"
          />
          <Text size="xs" tone="muted">
            Con opciones agrupadas.
          </Text>
        </BlockStack>

        <BlockStack gap={2}>
          <Label htmlFor="cb-chico">Tamaño sm, deshabilitado</Label>
          <Combobox id="cb-chico" options={paises} size="sm" disabled placeholder="No editable" />
        </BlockStack>
      </BlockStack>

      <InlineStack gap={2}>
        <Text size="sm" tone="muted">
          Valor:
        </Text>
        <Badge tone={pais ? "brand" : "neutral"} size="sm">
          {pais || "vacío"}
        </Badge>
        <Badge tone={equipo ? "brand" : "neutral"} size="sm">
          {equipo || "vacío"}
        </Badge>
      </InlineStack>
    </BlockStack>
  );
};

export default ComboboxDemo;
