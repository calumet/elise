import { Badge } from "@calumet/elise-ui/badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxField,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxLoading,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  type ComboboxOption,
} from "@calumet/elise-ui/combobox";
import { Label } from "@calumet/elise-ui/label";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import { useEffect, useState } from "react";

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

const CATALOGO = [
  "elise-ui",
  "elise-forms",
  "elise-tables",
  "elise-toasts",
  "elise-alerts",
  "elise-i18n",
];

/** Compone las partes directamente: filtrado del "servidor" y una accion al pie. */
const BusquedaAsincrona = () => {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [resultados, setResultados] = useState<string[]>([]);
  const [elegido, setElegido] = useState("");

  useEffect(() => {
    if (!abierto) return;
    setCargando(true);
    const id = setTimeout(() => {
      const q = texto.trim().toLowerCase();
      setResultados(CATALOGO.filter((p) => p.includes(q)));
      setCargando(false);
    }, 450);
    return () => clearTimeout(id);
  }, [texto, abierto]);

  return (
    <Combobox value={elegido} onValueChange={setElegido} open={abierto} onOpenChange={setAbierto}>
      <ComboboxTrigger onClear={elegido ? () => setElegido("") : undefined}>
        <ComboboxValue placeholder="Buscar paquete…">{elegido}</ComboboxValue>
      </ComboboxTrigger>
      {/* shouldFilter={false}: la lista ya viene filtrada de afuera */}
      <ComboboxContent shouldFilter={false}>
        <ComboboxInput value={texto} onValueChange={setTexto} placeholder="Escribe para buscar…" />
        <ComboboxList>
          {cargando ? (
            <ComboboxLoading />
          ) : (
            <>
              <ComboboxEmpty>Ningún paquete coincide</ComboboxEmpty>
              {resultados.map((p) => (
                <ComboboxItem key={p} value={p}>
                  {p}
                </ComboboxItem>
              ))}
              <ComboboxSeparator />
              <ComboboxItem value="__nuevo" hideIndicator onSelect={() => setElegido("")}>
                <Text size="sm" tone="primary">
                  + Crear paquete nuevo
                </Text>
              </ComboboxItem>
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

const ComboboxDemo = () => {
  const [pais, setPais] = useState("co");
  const [equipo, setEquipo] = useState("");

  return (
    <BlockStack gap={6} className="w-full">
      <BlockStack gap={2}>
        <Text size="sm" weight="semibold">
          ComboboxField — array de opciones
        </Text>
        <Text size="xs" tone="muted">
          El envoltorio para el caso común, construido sobre las partes.
        </Text>
      </BlockStack>

      <BlockStack gap={4} className="max-w-sm">
        <BlockStack gap={2}>
          <Label htmlFor="cb-pais">País</Label>
          <ComboboxField
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
          <ComboboxField
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
      </BlockStack>

      <BlockStack gap={2}>
        <Text size="sm" weight="semibold">
          Combobox — partes componibles
        </Text>
        <Text size="xs" tone="muted">
          Filtrado externo con retardo simulado, fila de carga y una acción al pie de la lista.
        </Text>
      </BlockStack>
      <div className="max-w-sm">
        <BusquedaAsincrona />
      </div>

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
