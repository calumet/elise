/**
 * Área para soltar o elegir archivos.
 *
 * Reporta siempre las dos listas (aceptados y rechazados, con el motivo) en vez
 * de descartar en silencio lo que no pasa, porque un archivo que desaparece sin
 * explicación deja al usuario sin saber qué corregir.
 *
 * No guarda los archivos ni los muestra. Para eso está `FileUploadList`.
 *
 * @module
 */

import { File as FileIcon, Upload, X } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Un archivo rechazado, con el motivo por el que no paso. */
export type RejectedFile = {
  file: File;
  reason: "type" | "size" | "custom";
};

/** Props de {@link FileUpload}. */
export type FileUploadProps = Omit<React.ComponentProps<"div">, "onDrop"> & {
  /** Filtro nativo: `"image/*"`, `".pdf,.docx"`. */
  accept?: string;

  multiple?: boolean;

  /** Tamano máximo por archivo, en bytes. */
  maxSize?: number;

  disabled?: boolean;

  /** Marca el área como inválida. */
  invalid?: boolean;

  /** Regla propia de validación. Devolver `false` rechaza el archivo. */
  validator?: (file: File) => boolean;

  /** Recibe siempre las dos listas, aceptados y rechazados. */
  onFiles?: (aceptados: File[], rechazados: RejectedFile[]) => void;

  /** Texto principal del área. */
  label?: string;

  /** Línea secundaria: formatos admitidos, tamano máximo. */
  hint?: string;
};

/** Formatea un tamaño en bytes a la unidad que le queda cómoda, por ejemplo `"1,2 MB"`. */
const formatearTamano = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Comprueba un archivo contra el atributo `accept` nativo. */
const tipoAceptado = (file: File, accept?: string) => {
  if (!accept) return true;
  return accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .some((patron) => {
      if (!patron) return false;
      if (patron.startsWith(".")) return file.name.toLowerCase().endsWith(patron);
      if (patron.endsWith("/*")) return file.type.startsWith(patron.slice(0, -1));
      return file.type.toLowerCase() === patron;
    });
};

/**
 * Área para soltar o elegir archivos.
 *
 * Reporta siempre las dos listas (aceptados y rechazados, con el motivo) en vez
 * de descartar en silencio lo que no pasa, porque un archivo que desaparece sin
 * explicación deja al usuario sin saber qué corregir.
 *
 * No guarda los archivos ni los muestra. Para eso está `FileUploadList`.
 */
function FileUpload({
  className,
  accept,
  multiple = false,
  maxSize,
  disabled,
  invalid,
  validator,
  onFiles,
  label,
  hint,
  ...props
}: FileUploadProps): React.JSX.Element {
  const [arrastrando, setArrastrando] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const contador = React.useRef(0);

  const etiqueta = useElLabel("ui", "fileUpload", "Arrastra archivos o haz clic para elegir");
  const etiquetaBoton = useElLabel("ui", "fileUploadBrowse", "Elegir archivos");

  const repartir = (lista: FileList | null) => {
    if (!lista) return;
    const aceptados: File[] = [];
    const rechazados: RejectedFile[] = [];
    for (const file of Array.from(lista)) {
      if (!tipoAceptado(file, accept)) rechazados.push({ file, reason: "type" });
      else if (maxSize !== undefined && file.size > maxSize)
        rechazados.push({ file, reason: "size" });
      else if (validator && !validator(file)) rechazados.push({ file, reason: "custom" });
      else aceptados.push(file);
    }
    onFiles?.(multiple ? aceptados : aceptados.slice(0, 1), rechazados);
  };

  /* dragenter/dragleave se disparan también al pasar sobre los hijos. Un
     contador evita que el área parpadee mientras el cursor la recorre. */
  const alEntrar = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    contador.current += 1;
    setArrastrando(true);
  };
  const alSalir = (e: React.DragEvent) => {
    e.preventDefault();
    contador.current -= 1;
    if (contador.current <= 0) setArrastrando(false);
  };
  const alSoltar = (e: React.DragEvent) => {
    e.preventDefault();
    contador.current = 0;
    setArrastrando(false);
    if (disabled) return;
    repartir(e.dataTransfer.files);
  };

  return (
    <div
      data-slot="file-upload"
      data-dragging={arrastrando ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      onDragEnter={alEntrar}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={alSalir}
      onDrop={alSoltar}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-card px-6 py-8 text-center transition-[background-color,border-color] duration-(--duration-fast) ease-out",
        !disabled && "hover:border-primary hover:bg-accent/40",
        "data-dragging:border-primary data-dragging:bg-accent",
        "data-invalid:border-destructive data-invalid:bg-destructive-subtle",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          repartir(e.target.files);
          /* Permite volver a elegir el mismo archivo después de quitarlo. */
          e.target.value = "";
        }}
      />
      <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Upload className="size-4" aria-hidden="true" />
      </span>
      <span className="text-sm text-foreground">{label ?? etiqueta}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-1 inline-flex h-8 cursor-pointer items-center rounded-md border border-border-strong bg-background px-3 text-sm font-semibold text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
      >
        {etiquetaBoton}
      </button>
    </div>
  );
}

/** La lista de archivos ya elegidos. */
function FileUploadList({ className, ...props }: React.ComponentProps<"ul">): React.JSX.Element {
  return (
    <ul data-slot="file-upload-list" className={cn("flex flex-col gap-2", className)} {...props} />
  );
}

/** Props de {@link FileUploadItem}. */
export type FileUploadItemProps = Omit<React.ComponentProps<"li">, "onRemove"> & {
  name: string;
  size?: number;

  /** Muestra el botón de quitar. */
  onRemove?: () => void;
};

/** Un archivo de la lista, con su tamaño y el botón de quitarlo. */
function FileUploadItem({
  className,
  name,
  size,
  onRemove,
  ...props
}: FileUploadItemProps): React.JSX.Element {
  const quitarLabel = useElLabel("ui", "remove", "Quitar");
  return (
    <li
      data-slot="file-upload-item"
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2",
        className,
      )}
      {...props}
    >
      <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-foreground">{name}</span>
        {size !== undefined ? (
          <span className="text-xs text-muted-foreground">{formatearTamano(size)}</span>
        ) : null}
      </span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${quitarLabel} ${name}`}
          className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-state-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </li>
  );
}

export { FileUpload, FileUploadList, FileUploadItem, formatearTamano as formatFileSize };
