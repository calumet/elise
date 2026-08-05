import { Button } from "@calumet/elise-ui/button";
import { ButtonGroup } from "@calumet/elise-ui/button-group";
import { Checkbox } from "@calumet/elise-ui/checkbox";
import { CheckboxGroup } from "@calumet/elise-ui/checkbox-group";
import { List, ListItem } from "@calumet/elise-ui/list";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const AVISOS = [
  { name: "pedidos", label: "Pedidos nuevos" },
  { name: "stock", label: "Stock bajo" },
  { name: "reseñas", label: "Reseñas de clientes" },
];

const GruposDemo = () => {
  const [marcados, setMarcados] = useState<string[]>(["pedidos"]);

  const alternar = (name: string) =>
    setMarcados((previos) =>
      previos.includes(name) ? previos.filter((n) => n !== name) : [...previos, name],
    );

  return (
    <div className="flex flex-col gap-6">
      <CheckboxGroup
        label="Qué te avisamos por correo"
        description="Los avisos de cobro no se pueden apagar."
        error={marcados.length === 0 ? "Elegí al menos un aviso." : undefined}
      >
        {AVISOS.map((aviso) => (
          <Checkbox
            key={aviso.name}
            name={aviso.name}
            label={aviso.label}
            checked={marcados.includes(aviso.name)}
            onCheckedChange={() => alternar(aviso.name)}
          />
        ))}
      </CheckboxGroup>

      <div className="flex flex-col gap-2">
        <Text size="sm" weight="semibold">
          Acciones sueltas
        </Text>
        <ButtonGroup accessibilityLabel="Acciones del pedido">
          <Button size="sm">Preparar envío</Button>
          <Button size="sm" variant="outline">
            Imprimir
          </Button>
          <Button size="sm" variant="outline">
            Reembolsar
          </Button>
        </ButtonGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Text size="sm" weight="semibold">
          Caras de lo mismo, juntas
        </Text>
        <ButtonGroup attached accessibilityLabel="Cómo se ven los pedidos">
          <Button size="sm" variant="outline">
            Lista
          </Button>
          <Button size="sm" variant="outline">
            Tarjetas
          </Button>
          <Button size="sm" variant="outline">
            Calendario
          </Button>
        </ButtonGroup>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Text size="sm" weight="semibold">
            Lista de puntos
          </Text>
          <List>
            <ListItem>El marcador queda fuera del texto.</ListItem>
            <ListItem>
              Una entrada de dos renglones alinea el segundo con la primera letra y no con el punto,
              que es lo que pasa con la sangría por dentro.
            </ListItem>
          </List>
        </div>

        <div className="flex flex-col gap-2">
          <Text size="sm" weight="semibold">
            Lista numerada
          </Text>
          <List variant="numbered">
            <ListItem>Elegí los productos.</ListItem>
            <ListItem>Confirmá la dirección.</ListItem>
            <ListItem>Pagá.</ListItem>
          </List>
        </div>
      </div>
    </div>
  );
};

export default GruposDemo;
