import { Alert, AlertDescription, AlertTitle } from "@calumet/elise-ui/alert";
import { Button } from "@calumet/elise-ui/button";
import { MultiComboboxField, type ComboboxOption } from "@calumet/elise-ui/combobox";
import {
  FileUpload,
  FileUploadItem,
  FileUploadList,
  type RejectedFile,
} from "@calumet/elise-ui/file-upload";
import { Label } from "@calumet/elise-ui/label";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperTitle,
  type StepStatus,
} from "@calumet/elise-ui/stepper";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const tecnologias: ComboboxOption[] = [
  { value: "react", label: "React", group: "Frontend" },
  { value: "vue", label: "Vue", group: "Frontend" },
  { value: "svelte", label: "Svelte", group: "Frontend" },
  { value: "node", label: "Node.js", group: "Backend" },
  { value: "go", label: "Go", group: "Backend" },
  { value: "rust", label: "Rust", group: "Backend" },
  { value: "postgres", label: "PostgreSQL", group: "Datos" },
];

const PASOS = [
  { titulo: "Cuenta", descripcion: "Datos de acceso" },
  { titulo: "Organización", descripcion: "Nombre y dominio" },
  { titulo: "Equipo", descripcion: "Invita a tu gente" },
  { titulo: "Listo", descripcion: "Revisa y confirma" },
];

const CatalogoDemo = () => {
  const [stack, setStack] = useState<string[]>(["react", "node"]);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [rechazados, setRechazados] = useState<RejectedFile[]>([]);
  const [paso, setPaso] = useState(1);

  const estado = (i: number): StepStatus =>
    i < paso ? "complete" : i === paso ? "current" : "upcoming";

  const motivo = (r: RejectedFile) =>
    r.reason === "size" ? "supera 1 MB" : r.reason === "type" ? "formato no admitido" : "rechazado";

  return (
    <BlockStack gap={8} className="w-full">
      <BlockStack gap={3} className="max-w-sm">
        <Text size="sm" weight="semibold">
          MultiComboboxField
        </Text>
        <BlockStack gap={2}>
          <Label htmlFor="mc-stack">Stack del proyecto</Label>
          <MultiComboboxField
            id="mc-stack"
            options={tecnologias}
            value={stack}
            onValueChange={setStack}
            placeholder="Elegir tecnologías"
            searchPlaceholder="Buscar…"
            maxChips={2}
          />
          <Text size="xs" tone="muted">
            El panel se queda abierto al elegir. A partir de 2 chips se resume con «+N».
          </Text>
        </BlockStack>
      </BlockStack>

      <BlockStack gap={3} className="max-w-md">
        <Text size="sm" weight="semibold">
          FileUpload
        </Text>
        <FileUpload
          multiple
          accept="image/*,.pdf"
          maxSize={1024 * 1024}
          hint="Imágenes o PDF, hasta 1 MB por archivo"
          onFiles={(aceptados, noAceptados) => {
            setArchivos((previos) => [...previos, ...aceptados]);
            setRechazados(noAceptados);
          }}
        />
        {rechazados.length > 0 ? (
          <Alert tone="danger" onDismiss={() => setRechazados([])}>
            <AlertTitle>
              {rechazados.length === 1
                ? "No pudimos agregar 1 archivo"
                : `No pudimos agregar ${rechazados.length} archivos`}
            </AlertTitle>
            <AlertDescription>
              {rechazados.map((r) => `${r.file.name} — ${motivo(r)}`).join(". ")}
            </AlertDescription>
          </Alert>
        ) : null}
        {archivos.length > 0 ? (
          <FileUploadList>
            {archivos.map((f, i) => (
              <FileUploadItem
                key={`${f.name}-${i}`}
                name={f.name}
                size={f.size}
                onRemove={() => setArchivos((p) => p.filter((_, j) => j !== i))}
              />
            ))}
          </FileUploadList>
        ) : null}
      </BlockStack>

      <BlockStack gap={4}>
        <Text size="sm" weight="semibold">
          Stepper
        </Text>
        <Stepper>
          {PASOS.map((p, i) => (
            <StepperItem
              key={p.titulo}
              status={estado(i)}
              indicator={estado(i) === "complete" ? undefined : i + 1}
              last={i === PASOS.length - 1}
            >
              <StepperTitle>{p.titulo}</StepperTitle>
              <StepperDescription>{p.descripcion}</StepperDescription>
            </StepperItem>
          ))}
        </Stepper>
        <InlineStack gap={2}>
          <Button size="sm" variant="outline" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>
            Anterior
          </Button>
          <Button size="sm" disabled={paso === PASOS.length - 1} onClick={() => setPaso(paso + 1)}>
            Siguiente
          </Button>
        </InlineStack>

        <Stepper orientation="vertical" className="max-w-sm">
          {PASOS.slice(0, 3).map((p, i) => (
            <StepperItem
              key={p.titulo}
              status={estado(i)}
              indicator={estado(i) === "complete" ? undefined : i + 1}
              last={i === 2}
            >
              <StepperTitle>{p.titulo}</StepperTitle>
              <StepperDescription>{p.descripcion}</StepperDescription>
            </StepperItem>
          ))}
        </Stepper>
      </BlockStack>
    </BlockStack>
  );
};

export default CatalogoDemo;
