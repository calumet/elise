/**
 * Área para soltar o elegir archivos.
 *
 * Reporta siempre las dos listas (aceptados y rechazados, con el motivo) en vez
 * de descartar en silencio lo que no pasa, porque un archivo que desaparece sin
 * explicación deja al usuario sin saber qué corregir.
 *
 * No guarda los archivos ni los muestra. Para eso está `FileUploadList`, o
 * `ImageUpload` cuando es una sola imagen.
 *
 * @module
 */

import { File as FileIcon, ImageIcon, Upload, X } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useObjectUrl } from "@/lib/hooks/use-object-url";
import { useElLabel } from "@/lib/i18n";

import { Button } from "./button";
import type { StoredFile } from "./file-field";

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
  onFiles?: (accepted: File[], rejected: RejectedFile[]) => void;

  /** Texto principal del área. */
  label?: string;

  /** Línea secundaria: formatos admitidos, tamano máximo. */
  hint?: string;
};

/** Formatea un tamaño en bytes a la unidad que le queda cómoda, por ejemplo `"1,2 MB"`. */
export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Comprueba un archivo contra el atributo `accept` nativo. */
export const acceptedType = (file: File, accept?: string): boolean => {
  if (!accept) return true;
  return accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .some((pattern) => {
      if (!pattern) return false;
      if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern);
      if (pattern.endsWith("/*")) return file.type.startsWith(pattern.slice(0, -1));
      return file.type.toLowerCase() === pattern;
    });
};

function useFileDrop({
  accept,
  multiple,
  maxSize,
  disabled,
  validator,
  onFiles,
}: Pick<
  FileUploadProps,
  "accept" | "multiple" | "maxSize" | "disabled" | "validator" | "onFiles"
>) {
  const [dragging, setDragging] = React.useState(false);
  const counter = React.useRef(0);

  const assign = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];
    for (const file of Array.from(list)) {
      if (!acceptedType(file, accept)) rejected.push({ file, reason: "type" });
      else if (maxSize !== undefined && file.size > maxSize)
        rejected.push({ file, reason: "size" });
      else if (validator && !validator(file)) rejected.push({ file, reason: "custom" });
      else accepted.push(file);
    }
    onFiles?.(multiple ? accepted : accepted.slice(0, 1), rejected);
  };

  /* dragenter/dragleave se disparan también al pasar sobre los hijos. Un
     contador evita que el área parpadee mientras el cursor la recorre. */
  const onEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    counter.current += 1;
    setDragging(true);
  };
  const onLeave = (e: React.DragEvent) => {
    e.preventDefault();
    counter.current -= 1;
    if (counter.current <= 0) setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    counter.current = 0;
    setDragging(false);
    if (disabled) return;
    assign(e.dataTransfer.files);
  };

  return {
    dragging,
    assign,
    dropProps: {
      onDragEnter: onEnter,
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
      onDragLeave: onLeave,
      onDrop,
    },
  };
}

/**
 * Área para soltar o elegir archivos.
 *
 * Reporta siempre las dos listas (aceptados y rechazados, con el motivo) en vez
 * de descartar en silencio lo que no pasa, porque un archivo que desaparece sin
 * explicación deja al usuario sin saber qué corregir.
 *
 * No guarda los archivos ni los muestra. Para eso está `FileUploadList`, o
 * `ImageUpload` cuando es una sola imagen.
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { dragging, assign, dropProps } = useFileDrop({
    accept,
    multiple,
    maxSize,
    disabled,
    validator,
    onFiles,
  });

  const defaultLabel = useElLabel("ui", "fileUpload", "Arrastra archivos o haz clic para elegir");
  const buttonLabel = useElLabel("ui", "fileUploadBrowse", "Elegir archivos");

  return (
    <div
      data-slot="file-upload"
      data-dragging={dragging ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      {...dropProps}
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
        aria-label={buttonLabel}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          assign(e.target.files);
          /* Permite volver a elegir el mismo archivo después de quitarlo. */
          e.target.value = "";
        }}
      />
      <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Upload className="size-icon-md" aria-hidden="true" />
      </span>
      <span className="text-sm text-foreground">{label ?? defaultLabel}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-1 inline-flex h-8 cursor-pointer items-center rounded-md border border-border-strong bg-background px-3 text-sm font-semibold text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed"
      >
        {buttonLabel}
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
  const removeLabel = useElLabel("ui", "remove", "Quitar");
  return (
    <li
      data-slot="file-upload-item"
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2",
        className,
      )}
      {...props}
    >
      <FileIcon className="size-icon-md shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-foreground">{name}</span>
        {size !== undefined ? (
          <span className="text-xs text-muted-foreground">{formatSize(size)}</span>
        ) : null}
      </span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${removeLabel} ${name}`}
          className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-state-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          <X className="size-icon-sm" aria-hidden="true" />
        </button>
      ) : null}
    </li>
  );
}

/** Props de {@link ImageUpload}. */
export type ImageUploadProps = Omit<FileUploadProps, "multiple" | "ref"> & {
  /** La imagen recién elegida, o la que ya estaba guardada. */
  value?: File | StoredFile | null;

  /** Ancho entre alto, como en `Image`: `2`, `"16 / 9"`. Vale para el área vacía y para la imagen. */
  aspectRatio?: number | string;

  /** Muestra el botón de quitar. Sin esto, la imagen solo se reemplaza. */
  onRemove?: () => void;
};

/**
 * El área de `FileUpload` para una sola imagen, que la muestra dentro una vez
 * elegida.
 *
 * Sin `value` es el área de siempre. Con él, la imagen la llena en su
 * proporción, y soltar otra encima o pulsar «Reemplazar» la cambia. `onFiles`
 * reporta igual que en `FileUpload`, con un aceptado como mucho; guardarlo en
 * `value` es de quien llama.
 *
 * ```tsx
 * <ImageUpload
 *   aspectRatio={2}
 *   maxSize={2 * 1024 * 1024}
 *   value={imagen}
 *   onFiles={([elegida], rechazados) => {
 *     if (elegida) setImagen(elegida);
 *     setRechazados(rechazados);
 *   }}
 * />
 * ```
 */
function ImageUpload({
  className,
  style,
  value,
  aspectRatio,
  onRemove,
  accept = "image/*",
  maxSize,
  disabled,
  invalid,
  validator,
  onFiles,
  label,
  hint,
  ...props
}: ImageUploadProps): React.JSX.Element {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const focusAfterChange = React.useRef(false);

  const report = (accepted: File[], rejected: RejectedFile[]) => {
    if (accepted.length > 0) focusAfterChange.current = true;
    onFiles?.(accepted, rejected);
  };
  const { dragging, assign, dropProps } = useFileDrop({
    accept,
    maxSize,
    disabled,
    validator,
    onFiles: report,
  });

  const defaultLabel = useElLabel(
    "ui",
    "imageUpload",
    "Arrastra una imagen o haz clic para elegirla",
  );
  const replaceLabel = useElLabel("ui", "imageUploadReplace", "Reemplazar");
  const removeLabel = useElLabel("ui", "imageUploadRemove", "Quitar");
  const dropLabel = useElLabel("ui", "imageUploadDrop", "Suelta para reemplazarla");

  const localUrl = useObjectUrl(value instanceof File ? value : undefined);
  const url = value instanceof File ? localUrl : value?.url;
  const [failedUrl, setFailedUrl] = React.useState<string>();

  React.useEffect(() => {
    if (!focusAfterChange.current) return;
    focusAfterChange.current = false;
    rootRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [value]);

  const ratioStyle = aspectRatio !== undefined ? { aspectRatio, ...style } : style;

  if (!value) {
    return (
      <FileUpload
        ref={rootRef}
        data-slot="image-upload"
        accept={accept}
        maxSize={maxSize}
        disabled={disabled}
        invalid={invalid}
        validator={validator}
        onFiles={report}
        label={label ?? defaultLabel}
        hint={hint}
        style={ratioStyle}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      data-slot="image-upload"
      data-dragging={dragging ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      {...dropProps}
      style={ratioStyle}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-muted",
        "data-dragging:border-primary",
        "data-invalid:border-destructive",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        tabIndex={-1}
        aria-hidden="true"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          assign(e.target.files);
          e.target.value = "";
        }}
      />
      {url && url !== failedUrl ? (
        <img
          src={url}
          alt={value.name}
          onError={() => setFailedUrl(url)}
          className="size-full object-cover"
        />
      ) : (
        <span
          role="img"
          aria-label={value.name}
          className="flex size-full items-center justify-center text-muted-foreground"
        >
          <ImageIcon className="size-icon-lg" aria-hidden="true" />
        </span>
      )}
      {dragging ? (
        <span className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-accent text-sm font-medium text-accent-foreground">
          <Upload className="size-icon-md" aria-hidden="true" />
          {dropLabel}
        </span>
      ) : null}
      <span className="absolute right-3 bottom-3 flex gap-2">
        <Button
          variant="surface"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {replaceLabel}
        </Button>
        {onRemove ? (
          <Button
            variant="surface"
            size="sm"
            disabled={disabled}
            onClick={() => {
              focusAfterChange.current = true;
              onRemove();
            }}
          >
            {removeLabel}
          </Button>
        ) : null}
      </span>
    </div>
  );
}

export { FileUpload, FileUploadList, FileUploadItem, ImageUpload, formatSize as formatFileSize };
