import { ChevronRight, Package, Truck, Users } from "@calumet/elise-icons";
import { Clickable } from "@calumet/elise-ui/clickable";
import { Separator } from "@calumet/elise-ui/separator";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const FILAS = [
  {
    icono: Truck,
    titulo: "Envíos y entregas",
    detalle: "Métodos, tarifas, zonas y preparación de pedidos.",
  },
  {
    icono: Package,
    titulo: "Productos y catálogo",
    detalle: "Valores por defecto y cómo se muestran en la tienda.",
  },
  {
    icono: Users,
    titulo: "Clientes",
    detalle: "Cuentas, direcciones guardadas y consentimiento de marketing.",
  },
];

const ClickableDemo = () => {
  const [ultima, setUltima] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* La fila que navega: es un enlace, así que sale un <a>. */}
      <div className="overflow-hidden rounded-lg border border-border">
        {FILAS.map((fila, n) => (
          <div key={fila.titulo}>
            {n > 0 ? <Separator /> : null}
            <Clickable
              href="#clickable"
              padding={3}
              accessibilityLabel={`Abrir ${fila.titulo}`}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
            >
              <fila.icono className="size-5 text-muted-foreground" aria-hidden />
              <div className="flex min-w-0 flex-col">
                <Text size="sm" weight="semibold">
                  {fila.titulo}
                </Text>
                <Text size="sm" tone="muted">
                  {fila.detalle}
                </Text>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </Clickable>
          </div>
        ))}
      </div>

      {/* La tarjeta que hace algo: sin href, así que sale un <button>. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Clickable
          background="card"
          border
          radius="lg"
          padding={4}
          onClick={() => setUltima("Pedidos de hoy")}
          className="flex flex-col gap-1"
        >
          <Text size="sm" tone="muted">
            Pedidos de hoy
          </Text>
          <Text size="2xl" weight="semibold">
            34
          </Text>
        </Clickable>

        <Clickable
          background="card"
          border
          radius="lg"
          padding={4}
          disabled
          onClick={() => setUltima("Esto no debería llegar")}
          className="flex flex-col gap-1"
        >
          <Text size="sm" tone="muted">
            Devoluciones
          </Text>
          <Text size="2xl" weight="semibold">
            Sin datos
          </Text>
        </Clickable>
      </div>

      <Text size="sm" tone="muted">
        {ultima ? `Pulsaste «${ultima}».` : "Ninguna tarjeta pulsada todavía."}
      </Text>
    </div>
  );
};

export default ClickableDemo;
