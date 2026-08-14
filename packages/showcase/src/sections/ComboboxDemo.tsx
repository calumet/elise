import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
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
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@calumet/elise-ui/dialog";
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

/* Un árbol aplanado en preorden. Sin `level` la lista no dice de quién cuelga
   cada entrada. */
const MENU: ComboboxOption[] = [
  { value: "raiz", label: "Raíz del menú" },
  { value: "academica", label: "Información académica", level: 1 },
  { value: "horario", label: "Horario", level: 2 },
  { value: "notas", label: "Notas", level: 2 },
  { value: "boletin", label: "Boletín del período", level: 3 },
  { value: "certificados", label: "Certificados", level: 2 },
  { value: "aula", label: "Aula virtual", level: 1 },
  { value: "cursos", label: "Mis cursos", level: 2 },
  { value: "tareas", label: "Tareas pendientes", level: 3 },
  { value: "entregas", label: "Entregas corregidas", level: 3 },
  { value: "foros", label: "Foros", level: 2 },
  { value: "biblioteca", label: "Biblioteca", level: 1 },
  { value: "prestamos", label: "Préstamos", level: 2 },
  { value: "reservas", label: "Reservas", level: 2 },
  { value: "administracion", label: "Administración", level: 1 },
  { value: "matricula", label: "Matrícula", level: 2 },
  { value: "pagos", label: "Pagos", level: 2 },
  { value: "comprobantes", label: "Comprobantes", level: 3 },
];

const CATALOGO = [
  "elise-ui",
  "elise-forms",
  "elise-tables",
  "elise-toasts",
  "elise-alerts",
  "elise-i18n",
];

/** Compone las partes directamente: filtrado del "servidor" y una acción al pie. */
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
              <ComboboxItem value="__nuevo" onSelect={() => setElegido("")}>
                <Text size="sm" tone="primary">
                  Crear paquete nuevo
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
  const [rama, setRama] = useState("horario");
  const [destino, setDestino] = useState("");

  return (
    <BlockStack gap={6} className="w-full">
      <BlockStack gap={2}>
        <Text size="sm" weight="semibold">
          ComboboxField, array de opciones
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
            Busca por nombre o por capital: "bogota" y "cdmx" también encuentran.
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

        <BlockStack gap={2}>
          <Label htmlFor="cb-rama">Rama del menú</Label>
          <ComboboxField
            id="cb-rama"
            options={MENU}
            value={rama}
            onValueChange={setRama}
            searchPlaceholder="Buscar rama…"
          />
          <Text size="xs" tone="muted">
            Con `level` por opción: la lista aplanada conserva la forma del árbol.
          </Text>
        </BlockStack>
      </BlockStack>

      <BlockStack gap={2}>
        <Text size="sm" weight="semibold">
          Dentro de un diálogo
        </Text>
        <Text size="xs" tone="muted">
          Con `modal`, la lista lleva su propio bloqueo de scroll y la rueda llega a ella. Sin él,
          el del diálogo la cancela y solo se recorre con las flechas.
        </Text>
      </BlockStack>
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Abrir el diálogo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mover a otra rama</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <BlockStack gap={2}>
                <Label htmlFor="cb-destino">Destino</Label>
                <ComboboxField
                  id="cb-destino"
                  modal
                  options={MENU}
                  value={destino}
                  onValueChange={setDestino}
                  placeholder="Elegir destino…"
                  searchPlaceholder="Buscar rama…"
                />
              </BlockStack>
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>

      <BlockStack gap={2}>
        <Text size="sm" weight="semibold">
          Combobox en partes componibles
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
