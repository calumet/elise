/**
 * El campo de un archivo, para un formulario de ajustes.
 *
 * @module
 */

import { File as FileIcon, ImageIcon, Upload, X } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

import { Button } from "./button";
import { Field } from "./field";
import { formatSize, acceptedType, type RejectedFile } from "./file-upload";

/** Un archivo que ya estaba guardado, tal como lo devuelve el servidor. */
export type StoredFile = {
  name: string;
  /** Para previsualizarlo. Sin esto va el icono de su tipo. */
  url?: string;
  /** En bytes. */
  size?: number;
  /** Tipo MIME. Sin esto se deduce de la extensión del nombre. */
  type?: string;
};

/** Props de {@link FileField}. */
export type FileFieldProps = Omit<React.ComponentProps<"div">, "children" | "onChange"> & {
  label: React.ReactNode;

  /** Lo elegido ahora, o lo que ya estaba guardado. */
  value?: File | StoredFile | null;

  /** Entrega el archivo elegido, o `null` al quitarlo. Subirlo es de la app. */
  onChange?: (file: File | null) => void;

  /** Filtro nativo: `"image/*"`, `".pdf"`. */
  accept?: string;

  /** Tamaño máximo, en bytes. */
  maxSize?: number;

  /** Se llama con lo que no pasó el filtro, en vez de descartarlo en silencio. */
  onReject?: (rejected: RejectedFile) => void;

  /** De 0 a 100 mientras la app lo sube. La barra reemplaza al peso. */
  progress?: number;

  /** Con esto, subiendo aparece un aspa que corta. */
  onCancel?: () => void;

  /** Texto de ayuda. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: React.ReactNode;

  required?: boolean;
  disabled?: boolean;

  /** Lo que dice la fila sin archivo. Por defecto, «Todavía no hay nada». */
  emptyLabel?: React.ReactNode;
};

/**
 * El campo de un archivo, para un formulario de ajustes.
 *
 * El logo de un portal es un ajuste más, entre el nombre y el color. Puesto en
 * una zona de arrastre se lleva la sección: mide 130px contra los 36 de los
 * campos que lo rodean, y lo que es un dato pasa a ser el asunto de la pantalla.
 * Este ocupa una fila.
 *
 * Soltar un archivo encima funciona igual, pero no se anuncia con un borde
 * punteado: solo se marca cuando ya hay algo encima. Quien arrastra lo intenta
 * de todas formas, y quien no, no carga con el cartel.
 *
 * **Entrega el archivo y nada más.** Subirlo, con su barra y su reintento, es de
 * la app; `progress` es por dónde vuelve ese estado. Para adjuntar varios de una
 * está `FileUpload`, que es la otra pieza y sigue donde estaba.
 *
 * Previsualiza según el tipo del archivo y no según una prop: una imagen se ve,
 * lo demás lleva el icono de su tipo. Si lo eligiera quien llama, dos pantallas
 * del mismo portal mostrarían lo mismo de dos formas.
 *
 * ```tsx
 * <FileField
 *   label="Logo del portal"
 *   description="SVG o PNG, hasta 2 MB."
 *   accept="image/*"
 *   maxSize={2 * 1024 * 1024}
 *   value={logo}
 *   onChange={setLogo}
 *   onReject={(r) => setError(motivo(r))}
 * />
 * ```
 */
export function FileField({
  className,
  label,
  value,
  onChange,
  accept,
  maxSize,
  onReject,
  progress,
  onCancel,
  description,
  error,
  required,
  disabled,
  emptyLabel,
  ...props
}: FileFieldProps): React.JSX.Element {
  const entry = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const uploadLabel = useElLabel("ui", "fileFieldUpload", "Subir");
  const replaceLabel = useElLabel("ui", "fileFieldReplace", "Reemplazar");
  const removeLabel = useElLabel("ui", "fileFieldRemove", "Quitar");
  const defaultEmptyLabel = useElLabel("ui", "fileFieldEmpty", "Todavía no hay nada");
  const dropLabel = useElLabel("ui", "fileFieldDrop", "Soltá para subirlo");
  const cancelLabel = useElLabel("ui", "fileFieldCancel", "Cancelar la subida");

  const uploading = typeof progress === "number";

  // Crear y revocar el `objectURL` van de a pares, y el par vive en el efecto.
  const [urlLocal, setUrlLocal] = React.useState<string>();
  React.useEffect(() => {
    if (!(value instanceof File) || !value.type.startsWith("image/")) {
      // oxlint-disable-next-line react/set-state-in-effect -- crear el objectURL fuera del efecto lo deja sin la limpieza que lo revoca.
      setUrlLocal(undefined);
      return;
    }
    const url = URL.createObjectURL(value);
    // oxlint-disable-next-line react/set-state-in-effect -- ídem: el par crear/revocar vive en el efecto.
    setUrlLocal(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const select = (file: File | undefined) => {
    if (!file) return;

    if (!acceptedType(file, accept)) {
      onReject?.({ file, reason: "type" });
      return;
    }
    if (maxSize !== undefined && file.size > maxSize) {
      onReject?.({ file, reason: "size" });
      return;
    }
    onChange?.(file);
  };

  const name = value instanceof File ? value.name : value?.name;
  const size = value instanceof File ? value.size : value?.size;
  const previewUrl = value instanceof File ? urlLocal : value?.url;

  // Un archivo que el navegador no pinta deja el cuadro en blanco, que se lee
  // como que no hay nada.
  const [failedUrl, setFailedUrl] = React.useState<string>();
  const previewFailed = previewUrl !== undefined && previewUrl === failedUrl;

  const thumbnail = () => {
    if (dragging) {
      return <Upload aria-hidden="true" className="size-icon-lg text-accent-foreground" />;
    }
    if (previewUrl && !previewFailed) {
      return (
        <img
          src={previewUrl}
          alt=""
          onError={() => setFailedUrl(previewUrl)}
          className="max-h-full max-w-full object-contain"
          style={{ borderRadius: 4 }}
        />
      );
    }
    if (!value) {
      return <ImageIcon aria-hidden="true" className="size-icon-lg text-muted-foreground" />;
    }
    return <FileIcon aria-hidden="true" className="size-icon-lg text-muted-foreground" />;
  };

  return (
    <Field
      className={className}
      label={label}
      description={description}
      error={error}
      required={required}
      action={
        value && !uploading && !disabled ? (
          <Button variant="ghost" size="sm" onClick={() => onChange?.(null)}>
            {removeLabel}
          </Button>
        ) : null
      }
      {...props}
    >
      {(control) => (
        <div
          onDragOver={(e) => {
            if (disabled || uploading) return;
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            if (disabled || uploading) return;
            e.preventDefault();
            setDragging(false);
            select(e.dataTransfer.files[0]);
          }}
          className={cn(
            "flex items-center gap-2.5 rounded-md border p-2 transition-[background-color,border-color] duration-(--duration-fast) ease-out",
            dragging ? "border-primary bg-accent" : "border-border bg-card",
            error ? "border-destructive" : null,
            disabled ? "opacity-55" : null,
          )}
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted",
              value || dragging
                ? "border border-border"
                : "border border-dashed border-border-strong",
            )}
          >
            {thumbnail()}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-px">
            {dragging ? (
              <span className="text-sm font-medium text-accent-foreground">{dropLabel}</span>
            ) : value ? (
              <>
                <span className="truncate text-sm font-medium">{name}</span>
                {uploading ? (
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-(--duration-base) ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {size === undefined ? null : formatSize(size)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                {emptyLabel ?? defaultEmptyLabel}
              </span>
            )}
          </div>

          <input
            {...control}
            ref={entry}
            type="file"
            accept={accept}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              select(e.target.files?.[0]);
              // Sin esto, volver a elegir el mismo archivo no dispara nada.
              e.target.value = "";
            }}
          />

          {uploading && onCancel ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={cancelLabel}
              onClick={onCancel}
              className="shrink-0"
            >
              <X aria-hidden="true" className="size-icon-md" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => entry.current?.click()}
              className="shrink-0"
            >
              {value ? replaceLabel : uploadLabel}
            </Button>
          )}
        </div>
      )}
    </Field>
  );
}
