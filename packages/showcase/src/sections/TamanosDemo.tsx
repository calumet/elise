import { Button } from "@calumet/elise-ui/button";
import { ComboboxField, type ComboboxOption } from "@calumet/elise-ui/combobox";
import { Input } from "@calumet/elise-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@calumet/elise-ui/select";
import { BlockStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";

const PASOS = [
  { size: "sm", alto: "32px", cuando: "Barra de herramientas, filtros de una tabla" },
  { size: "md", alto: "36px", cuando: "Formularios, que es casi todo" },
  { size: "lg", alto: "40px", cuando: "Un campo solo que pide protagonismo" },
  { size: "xl", alto: "44px", cuando: "Táctil: es el mínimo de área de toque" },
] as const;

const DEPOSITOS: ComboboxOption[] = [
  { value: "central", label: "Depósito central" },
  { value: "norte", label: "Sucursal norte" },
];

const TamanosDemo = () => (
  <BlockStack gap={5} className="w-full">
    <Text size="xs" tone="muted">
      Los cuatro controles comparten la escala, así que una fila que los mezcle cuadra de alto sin
      que nadie ajuste nada por fuera.
    </Text>

    {PASOS.map((paso) => (
      <BlockStack key={paso.size} gap={2}>
        <Text size="xs" tone="muted">
          <code>{paso.size}</code>, {paso.alto}. {paso.cuando}
        </Text>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            size={paso.size}
            defaultValue="Café Andes"
            aria-label={`Nombre, ${paso.size}`}
            className="w-40"
          />
          <Select defaultValue="central">
            <SelectTrigger size={paso.size} aria-label={`Depósito, ${paso.size}`} className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="central">Depósito central</SelectItem>
              <SelectItem value="norte">Sucursal norte</SelectItem>
            </SelectContent>
          </Select>
          <ComboboxField
            size={paso.size}
            options={DEPOSITOS}
            defaultValue="norte"
            aria-label={`Origen, ${paso.size}`}
            className="w-44"
          />
          <Button size={paso.size}>Guardar</Button>
        </div>
      </BlockStack>
    ))}
  </BlockStack>
);

export default TamanosDemo;
