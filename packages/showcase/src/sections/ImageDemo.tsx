import { Image, Thumbnail } from "@calumet/elise-ui/image";
import { Text } from "@calumet/elise-ui/text";

/* Un SVG embebido en vez de una URL: la vitrina y la auditoría corren sin red,
   y una imagen que no llega mide cero y no se puede comprobar nada. */
const muestra = (etiqueta: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${color}"/><text x="60" y="66" font-family="sans-serif" font-size="16" fill="white" text-anchor="middle">${etiqueta}</text></svg>`,
  )}`;

const TAMANOS = [
  { size: "xs", px: 24 },
  { size: "sm", px: 40 },
  { size: "md", px: 60 },
  { size: "lg", px: 80 },
] as const;

const ImageDemo = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Text size="sm" weight="semibold">
        Miniaturas
      </Text>
      <div className="flex flex-wrap items-end gap-4">
        {TAMANOS.map(({ size, px }) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <Thumbnail size={size} src={muestra(size, "#4f46e5")} alt={`Producto ${size}`} />
            <Text size="2xs" tone="muted">
              {size} · {px}px
            </Text>
          </div>
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text size="sm" weight="semibold">
        Proporciones
      </Text>
      <div className="grid gap-4 sm:grid-cols-3">
        {(["1", "16/9", "4/3"] as const).map((ratio) => (
          <div key={ratio} className="flex flex-col gap-1">
            <Image
              fill
              radius="lg"
              aspectRatio={ratio}
              src={muestra(ratio, "#0f766e")}
              alt={`Muestra en proporción ${ratio}`}
            />
            <Text size="2xs" tone="muted">
              aspectRatio {ratio}
            </Text>
          </div>
        ))}
      </div>
    </div>

    <Text size="sm" tone="muted">
      El hueco queda reservado antes de que la imagen llegue, así que la página no pega el salto de
      siempre al cargar. La proporción va como estilo y no como clase, que Tailwind no genera una
      clase armada con el valor de una prop.
    </Text>
  </div>
);

export default ImageDemo;
