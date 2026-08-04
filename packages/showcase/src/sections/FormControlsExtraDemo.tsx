import { NumberField } from "@calumet/elise-ui/number-field";
import { Rating } from "@calumet/elise-ui/rating";
import { SearchField } from "@calumet/elise-ui/search-field";
import { SegmentedControl, SegmentedControlItem } from "@calumet/elise-ui/segmented-control";
import { BlockStack } from "@calumet/elise-ui/stack";
import { TagInput } from "@calumet/elise-ui/tag-input";
import { Text } from "@calumet/elise-ui/text";
import { TimePicker } from "@calumet/elise-ui/time-picker";
import { useState } from "react";

const FormControlsExtraDemo = () => {
  const [cantidad, setCantidad] = useState("12");
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("tabla");
  const [etiquetas, setEtiquetas] = useState(["frontend", "diseño"]);
  const [puntos, setPuntos] = useState(4);
  const [hora, setHora] = useState("09:30");

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <BlockStack gap={2}>
        <NumberField
          label="Cantidad"
          description="Entre 0 y 99. Las flechas del teclado también suben y bajan."
          value={cantidad}
          onValueChange={setCantidad}
          min={0}
          max={99}
          suffix="uds"
        />
        <NumberField label="Descuento" defaultValue="7.5" min={0} max={100} step={0.5} suffix="%" />
      </BlockStack>

      <BlockStack gap={2}>
        <SearchField
          label="Buscar pedidos"
          placeholder="Número, cliente o correo"
          value={busqueda}
          onValueChange={setBusqueda}
          description="El aspa aparece en cuanto hay algo escrito."
        />
        <TimePicker
          label="Hora de recogida"
          value={hora}
          onValueChange={setHora}
          min="08:00"
          max="20:00"
          step={30}
          description="Se puede escribir una hora que no esté en la lista, como 14:07."
        />
      </BlockStack>

      <BlockStack gap={4}>
        <BlockStack gap={2}>
          <Text size="sm" weight="semibold">
            Vista
          </Text>
          <SegmentedControl value={vista} onValueChange={setVista}>
            <SegmentedControlItem value="tabla">Tabla</SegmentedControlItem>
            <SegmentedControlItem value="lista">Lista</SegmentedControlItem>
            <SegmentedControlItem value="rejilla">Rejilla</SegmentedControlItem>
          </SegmentedControl>
          <Text size="sm" tone="muted">
            Vuelve a pulsar la puesta: no se apaga, siempre queda una.
          </Text>
        </BlockStack>

        <TagInput
          label="Etiquetas"
          value={etiquetas}
          onValueChange={setEtiquetas}
          placeholder="Escribe y pulsa Intro"
          max={6}
          description="Intro o coma la cierra. Retroceso con el campo vacío quita la última."
        />

        <BlockStack gap={2}>
          <Text size="sm" weight="semibold">
            Valoración
          </Text>
          <Rating value={puntos} onValueChange={setPuntos} />
          <Rating value={4} max={5} readOnly size="sm" />
          <Text size="sm" tone="muted">
            La de arriba se puntúa con flechas; la de abajo es solo lectura, así que el teclado ni
            se para en ella.
          </Text>
        </BlockStack>
      </BlockStack>
    </div>
  );
};

export default FormControlsExtraDemo;
