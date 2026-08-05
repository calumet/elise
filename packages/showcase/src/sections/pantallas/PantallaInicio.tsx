import { ChevronDown, ChevronUp, Download, X } from "@calumet/elise-icons";
import { Alert, AlertTitle } from "@calumet/elise-ui/alert";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { ButtonGroup } from "@calumet/elise-ui/button-group";
import { Checkbox } from "@calumet/elise-ui/checkbox";
import { Clickable } from "@calumet/elise-ui/clickable";
import { Container } from "@calumet/elise-ui/container";
import { Image, Thumbnail } from "@calumet/elise-ui/image";
import { Link } from "@calumet/elise-ui/link";
import { Section } from "@calumet/elise-ui/section";
import { Separator } from "@calumet/elise-ui/separator";
import { Text } from "@calumet/elise-ui/text";
import { Fragment, useState } from "react";

import { muestra } from "./muestra";

const PASOS = [
  {
    id: "imagen",
    titulo: "Subí la foto del producto",
    detalle:
      "Empezá con una foto de buena calidad. Para que se vea bien en la tienda, usá al menos 1200 por 1200 píxeles.",
    accion: "Subir foto",
    secundaria: "Requisitos de la imagen",
  },
  {
    id: "precio",
    titulo: "Poné el precio y el stock",
    detalle:
      "El precio se muestra con impuestos incluidos. El stock se descuenta solo con cada pedido pagado.",
    accion: "Poner precio",
    secundaria: "Cómo se calculan los impuestos",
  },
  {
    id: "envio",
    titulo: "Configurá los envíos",
    detalle: "Definí a qué zonas llegás y cuánto cobrás por cada una.",
    accion: "Configurar envíos",
    secundaria: "Ver zonas disponibles",
  },
];

const METRICAS = [
  { titulo: "Pedidos del mes", valor: "156", variacion: "12%", tono: "success" as const },
  { titulo: "Ticket promedio", valor: "$2.847", variacion: "0%", tono: "warning" as const },
  { titulo: "Devoluciones", valor: "3,2%", variacion: "0,8%", tono: "danger" as const },
];

const PLANTILLAS = [
  { id: "simple", nombre: "Producto simple", color: "#4f46e5" },
  { id: "variantes", nombre: "Con variantes", color: "#0f766e" },
  { id: "digital", nombre: "Producto digital", color: "#b45309" },
];

const NOVEDADES = [
  {
    fecha: "21 de enero de 2026",
    titulo: "Nuevas formas de cobro",
    cuerpo:
      "Se agregaron transferencia inmediata y pago en cuotas sin interés para los pedidos de más de treinta mil pesos.",
  },
  {
    fecha: "6 de noviembre de 2025",
    titulo: "Control de stock por depósito",
    cuerpo:
      "Ahora el stock se lleva por depósito, así que un producto puede estar disponible en un local y agotado en otro.",
  },
];

const PantallaInicio = () => {
  const [visible, setVisible] = useState({ aviso: true, guia: true, anuncio: true });
  const [abierta, setAbierta] = useState(true);
  const [abierto, setAbierto] = useState<string | null>("imagen");
  const [hechos, setHechos] = useState<string[]>([]);

  const alternar = (id: string) =>
    setHechos((previos) =>
      previos.includes(id) ? previos.filter((p) => p !== id) : [...previos, id],
    );

  return (
    <Container size="lg" gutter={false} className="flex flex-col gap-5">
      {/* La cabecera del inicio no lleva título: el nombre de la aplicación ya
          está en la barra. Solo las acciones. */}
      <header className="flex flex-wrap justify-end gap-2">
        <ButtonGroup>
          <Button variant="outline" size="sm">
            Ver plantillas
          </Button>
          <Button variant="outline" size="sm">
            Importar catálogo
          </Button>
          <Button size="sm">Crear producto</Button>
        </ButtonGroup>
      </header>

      {visible.aviso ? (
        <Alert tone="info" onDismiss={() => setVisible({ ...visible, aviso: false })}>
          <AlertTitle>Llevás 3 de 5 productos del plan gratuito</AlertTitle>
          <p>
            <Link href="#pantallas">Pasá al plan Tienda</Link> para publicar todos los que quieras.
          </p>
        </Alert>
      ) : null}

      {visible.guia ? (
        <Section
          heading="Guía de puesta en marcha"
          actions={
            <ButtonGroup>
              <Button
                variant="ghost"
                size="sm"
                aria-label={abierta ? "Plegar la guía" : "Desplegar la guía"}
                onClick={() => setAbierta((a) => !a)}
              >
                {abierta ? (
                  <ChevronUp className="size-4" aria-hidden />
                ) : (
                  <ChevronDown className="size-4" aria-hidden />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Descartar la guía"
                onClick={() => setVisible({ ...visible, guia: false })}
              >
                <X className="size-4" aria-hidden />
              </Button>
            </ButtonGroup>
          }
        >
          <div className="flex flex-col gap-2">
            <Text size="sm">Seguí estos pasos para dejar la tienda lista para vender.</Text>
            <Text size="sm" tone="muted">
              {hechos.length} de {PASOS.length} pasos completados
            </Text>
          </div>

          {abierta ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              {PASOS.map((paso, n) => (
                <div key={paso.id}>
                  {n > 0 ? <Separator /> : null}
                  <div className="flex items-start justify-between gap-4 p-3">
                    <Checkbox
                      label={paso.titulo}
                      checked={hechos.includes(paso.id)}
                      onCheckedChange={() => alternar(paso.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Ver el detalle de «${paso.titulo}»`}
                      onClick={() => setAbierto((a) => (a === paso.id ? null : paso.id))}
                    >
                      {abierto === paso.id ? (
                        <ChevronUp className="size-4" aria-hidden />
                      ) : (
                        <ChevronDown className="size-4" aria-hidden />
                      )}
                    </Button>
                  </div>

                  {abierto === paso.id ? (
                    <div className="px-3 pb-3">
                      <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                        <div className="flex min-w-0 flex-col items-start gap-2">
                          <Text size="sm">{paso.detalle}</Text>
                          <ButtonGroup>
                            <Button size="sm">{paso.accion}</Button>
                            <Button size="sm" variant="ghost">
                              {paso.secundaria}
                            </Button>
                          </ButtonGroup>
                        </div>
                        <Image
                          src={muestra("", "#c7d2fe", 80, 80)}
                          alt=""
                          radius="md"
                          className="hidden size-20 shrink-0 sm:block"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}

      <Section accessibilityLabel="Resumen del negocio">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {METRICAS.map((metrica, n) => (
            <Fragment key={metrica.titulo}>
              {n > 0 ? <Separator orientation="vertical" className="hidden sm:block" /> : null}
              <Clickable
                href="#pantallas"
                radius="md"
                paddingX={1}
                paddingY={2}
                className="flex flex-col gap-1.5"
              >
                <Text size="sm" weight="semibold">
                  {metrica.titulo}
                </Text>
                <div className="flex items-center gap-2">
                  <Text size="2xl" weight="semibold">
                    {metrica.valor}
                  </Text>
                  <Badge tone={metrica.tono}>{metrica.variacion}</Badge>
                </div>
              </Clickable>
            </Fragment>
          ))}
        </div>
      </Section>

      {visible.anuncio ? (
        <Section accessibilityLabel="Cómo empezar">
          {/* El aspa va dentro de la fila del contenido y no en la cabecera de
              la sección: sin rótulo, la cabecera deja una banda vacía encima. */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-6">
              {/* `basis-60` y no `min-w-60`: el ancho base hace que la imagen se
                  ponga al lado en pantalla ancha, y `min-w-0` deja que la
                  columna encoja donde ese ancho ya no cabe. */}
              <div className="flex min-w-0 flex-1 basis-60 flex-col items-start gap-2">
                <Text as="h3" size="base" weight="semibold">
                  ¿Listo para publicar tu primer producto?
                </Text>
                <Text size="sm">
                  Subí una foto a la galería o empezá desde una de las plantillas del catálogo.
                </Text>
                <ButtonGroup>
                  <Button size="sm">Subir foto</Button>
                  <Button size="sm" variant="ghost">
                    Ver plantillas
                  </Button>
                </ButtonGroup>
              </div>
              <Image
                src={muestra("", "#a5b4fc", 200, 100)}
                alt=""
                radius="md"
                aspectRatio="2"
                className="w-50"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Descartar el anuncio"
              onClick={() => setVisible({ ...visible, anuncio: false })}
            >
              <X className="size-4" aria-hidden />
            </Button>
          </div>
        </Section>
      ) : null}

      <Section heading="Plantillas de producto">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(155px,1fr))]">
          {PLANTILLAS.map((plantilla) => (
            <div key={plantilla.id} className="overflow-hidden rounded-lg border border-border">
              <Clickable
                href="#pantallas"
                accessibilityLabel={`Abrir la plantilla ${plantilla.nombre}`}
              >
                <Image
                  fill
                  aspectRatio="1"
                  src={muestra(plantilla.nombre, plantilla.color)}
                  alt={`Plantilla ${plantilla.nombre}`}
                />
              </Clickable>
              <Separator />
              <div className="flex items-center justify-between gap-2 p-3">
                <Text size="sm" weight="semibold">
                  {plantilla.nombre}
                </Text>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Link href="#pantallas">Ver todas las plantillas</Link>
        </div>
      </Section>

      <Section heading="Novedades">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {NOVEDADES.map((novedad) => (
            <div
              key={novedad.titulo}
              className="flex flex-col gap-2 rounded-lg border border-border p-4"
            >
              <Text size="xs" tone="muted">
                {novedad.fecha}
              </Text>
              <Link href="#pantallas" tone="neutral">
                <Text as="h3" size="base" weight="semibold">
                  {novedad.titulo}
                </Text>
              </Link>
              <Text size="sm">{novedad.cuerpo}</Text>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Link href="#pantallas">Ver todas las novedades</Link>
        </div>
      </Section>

      <Section heading="Integraciones recomendadas">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {[
            { nombre: "Facturación", detalle: "Emití facturas al confirmar cada pedido." },
            { nombre: "Envíos", detalle: "Cotizá y despachá sin salir del panel." },
          ].map((app) => (
            <Clickable
              key={app.nombre}
              href="#pantallas"
              border
              radius="lg"
              padding={4}
              accessibilityLabel={`Instalar ${app.nombre}`}
              className="flex items-start gap-4"
            >
              <Thumbnail size="sm" src={muestra("", "#334155", 40, 40)} alt="" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <Text size="sm" weight="semibold">
                  {app.nombre}
                </Text>
                <Text size="xs" tone="muted">
                  Gratis
                </Text>
                <Text size="sm">{app.detalle}</Text>
              </div>
              <Download className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Clickable>
          ))}
        </div>
      </Section>

      <Text size="sm" tone="muted" align="center">
        Aprendé más sobre <Link href="#pantallas">cómo preparar tu tienda</Link>.
      </Text>
    </Container>
  );
};

export default PantallaInicio;
