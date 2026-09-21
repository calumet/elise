import { applyTheme, ThemeEditor, ThemeTokenEditor, type EliseTheme } from "@calumet/elise-themes";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { Input } from "@calumet/elise-ui/input";
import { Text } from "@calumet/elise-ui/text";
import { ThemeScope } from "@calumet/elise-ui/theme-scope";
import * as React from "react";

/**
 * El editor con su vista previa al lado, que es lo que le toca a la aplicación:
 * el paquete trae el editor y nada más.
 */
const EditorDeTemaDemo = (): React.JSX.Element => {
  const [tema, setTema] = React.useState<EliseTheme>({});
  const [avanzado, setAvanzado] = React.useState(false);
  const caja = React.useRef<HTMLDivElement>(null);

  /* Sobre la caja y no sobre el documento: si no, el editor se repinta con lo que se prueba. */
  React.useLayoutEffect(() => {
    const node = caja.current;
    if (!node) return;
    node.removeAttribute("style");
    applyTheme(tema, node);
  }, [tema]);

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <div className="flex flex-col gap-2">
        {/* Los dos editores escriben el mismo objeto; dónde van es de la app. */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={avanzado ? "outline" : "solid"}
            onClick={() => setAvanzado(false)}
          >
            Sencillo
          </Button>
          <Button
            size="sm"
            variant={avanzado ? "solid" : "outline"}
            onClick={() => setAvanzado(true)}
          >
            Avanzado
          </Button>
        </div>
        <div className="h-160 overflow-hidden rounded-xl border border-border">
          {avanzado ? (
            <ThemeTokenEditor value={tema} onChange={setTema} className="h-full" />
          ) : (
            <ThemeEditor value={tema} onChange={setTema} className="h-full" />
          )}
        </div>
      </div>

      <ThemeScope ref={caja} className="rounded-xl border border-border bg-canvas p-5">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Text size="lg" weight="bold">
              Inscripción a la maratón
            </Text>
            <Badge tone="success" size="sm">
              Abierta
            </Badge>
          </div>
          <Text size="sm" tone="muted">
            Cupos limitados. El formulario cierra el viernes a medianoche.
          </Text>
          <Input placeholder="nombre@uis.edu.co" className="max-w-72" />
          <div className="flex flex-wrap items-center gap-2">
            <Button>Inscribirme</Button>
            <Button variant="outline">Ver el reglamento</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="success" size="sm">
              Al día
            </Badge>
            <Badge tone="warning" size="sm">
              Por revisar
            </Badge>
            <Badge tone="danger" size="sm">
              Rechazada
            </Badge>
            <Badge tone="info" size="sm">
              En espera
            </Badge>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <Text size="sm" weight="bold" className="mb-3 block">
            Últimas inscritas
          </Text>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 border-b border-border-subtle pb-2">
              <Text size="sm" className="flex-1">
                Ana Cortés
              </Text>
              <Text size="sm" tone="muted">
                Sistemas
              </Text>
            </div>
            <div className="flex items-center gap-3">
              <Text size="sm" className="flex-1">
                Iván Peñaloza
              </Text>
              <Text size="sm" tone="muted">
                Industrial
              </Text>
            </div>
          </div>
        </div>
      </ThemeScope>
    </div>
  );
};

export default EditorDeTemaDemo;
