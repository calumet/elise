import { documentSchema, Editor, messageSchema } from "@calumet/elise-editor";
import type { EditorDocument, EditorNode } from "@calumet/elise-editor";
import { EditorContent } from "@calumet/elise-editor/render";
import { Box } from "@calumet/elise-ui/box";
import { Grid } from "@calumet/elise-ui/grid";
import { BlockStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import { useState, type ReactNode } from "react";

const PAGINAS = [
  { label: "Transferencias", href: "/transferencias" },
  { label: "Inscripciones", href: "/inscripciones" },
  { label: "Becas y descuentos", href: "/becas" },
  { label: "Calendario académico", href: "/calendario" },
  { label: "Contacto", href: "/contacto" },
];

const buscarPaginas = async (consulta: string) =>
  PAGINAS.filter((pagina) => pagina.label.toLowerCase().includes(consulta.trim().toLowerCase()));

const subirImagen = (archivo: File) =>
  new Promise<{ src: string; alt?: string }>((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve({ src: String(lector.result) });
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(archivo);
  });

const texto = (id: string, type: string, contenido: string, extra = {}): EditorNode => ({
  id,
  type,
  ...extra,
  children: [{ text: contenido }],
});

const fila = (id: string, tipo: "th" | "td", celdas: string[]): EditorNode => ({
  id,
  type: "tr",
  children: celdas.map((celda, n) => ({
    id: `${id}-${n}`,
    type: tipo,
    children: [texto(`${id}-${n}-p`, "p", celda)],
  })),
});

const pintarFoto = () => {
  const lienzo = document.createElement("canvas");
  lienzo.width = 640;
  lienzo.height = 300;
  const pincel = lienzo.getContext("2d");
  if (pincel) {
    pincel.fillStyle = "#0f766e";
    pincel.fillRect(0, 0, 640, 300);
    pincel.fillStyle = "#ffffff";
    pincel.font = "28px sans-serif";
    pincel.textAlign = "center";
    pincel.fillText("Laboratorio de la escuela", 320, 160);
  }
  return lienzo.toDataURL("image/png");
};

const crearPagina = (): EditorDocument => ({
  version: 1,
  locale: "es-CO",
  content: [
    texto(
      "intro",
      "p",
      "La escuela recibe aspirantes dos veces al año. Aquí están las fechas, los requisitos y a quién escribir si tienes dudas.",
    ),
    texto("antes", "h2", "Antes de inscribirte"),
    {
      id: "revisa",
      type: "p",
      children: [
        { text: "Revisa que tu documento esté vigente. Si vienes de otra universidad, consulta " },
        {
          id: "guia",
          type: "a",
          url: "/transferencias",
          children: [{ text: "la guía de transferencia" }],
        },
        { text: " antes de llenar el " },
        { text: "formulario", bold: true },
        { text: ". El código del programa es " },
        { text: "ING-SIS", code: true },
        { text: "." },
      ],
    },
    texto("req1", "p", "Resultado de la prueba Saber 11", { listStyleType: "disc", indent: 1 }),
    texto("req2", "p", "Documento de identidad", { listStyleType: "disc", indent: 1 }),
    texto("req3", "p", "Formulario de inscripción diligenciado", {
      listStyleType: "disc",
      indent: 1,
    }),
    texto("calendario", "h2", "Calendario"),
    {
      id: "fechas",
      type: "table",
      children: [
        fila("fechas-0", "th", ["Etapa", "Fecha"]),
        fila("fechas-1", "td", ["Inscripciones", "2 de febrero"]),
        fila("fechas-2", "td", ["Lista de admitidos", "16 de marzo"]),
        fila("fechas-3", "td", ["Matrícula", "6 de abril"]),
      ],
    },
    {
      id: "aviso",
      type: "callout",
      tone: "info",
      children: [
        texto("aviso-p", "p", "¿Dudas sobre el proceso? Escribe a admisiones@calumet.edu.co."),
      ],
    },
    texto("visita", "h3", "Visita la escuela"),
    {
      id: "foto",
      type: "img",
      url: pintarFoto(),
      alt: "Estudiantes trabajando en el laboratorio",
      caption: "El laboratorio abre los sábados para aspirantes.",
      children: [{ text: "" }],
    },
    { id: "linea", type: "hr", children: [{ text: "" }] },
    {
      id: "cita",
      type: "blockquote",
      children: [texto("cita-p", "p", "Vine por una tarde de laboratorio y me quedé cinco años.")],
    },
  ],
});

const MENSAJE: EditorDocument = {
  version: 1,
  locale: "es-CO",
  content: [
    {
      id: "m1",
      type: "p",
      children: [
        { text: "Hola, ya revisé tu solicitud. Te faltan " },
        { text: "dos documentos", bold: true },
        { text: ":" },
      ],
    },
    texto("m2", "p", "Certificado de notas", { listStyleType: "decimal", indent: 1 }),
    texto("m3", "p", "Carta de motivación", { listStyleType: "decimal", indent: 1 }),
  ],
};

const Columna = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <BlockStack gap={2}>
    <Text size="xs" weight="medium" tone="muted">
      {titulo}
    </Text>
    {children}
  </BlockStack>
);

const EditorDemo = () => {
  const [mensaje, setMensaje] = useState(MENSAJE);
  const [pagina, setPagina] = useState(crearPagina);

  return (
    <BlockStack gap={8}>
      <BlockStack gap={3}>
        <BlockStack gap={1}>
          <Text size="sm" weight="semibold">
            Mensaje
          </Text>
          <Text size="sm" tone="muted">
            El esquema corto: párrafo, negrita, cursiva, código, enlace y listas, con la barra
            siempre a la vista.
          </Text>
        </BlockStack>
        <Grid columns={1} lgColumns={2} gap={4}>
          <Columna titulo="Se escribe">
            <Editor
              schema={messageSchema}
              value={mensaje}
              onChange={setMensaje}
              searchLinks={buscarPaginas}
              aria-label="Mensaje"
            />
          </Columna>
          <Columna titulo="Se lee">
            <Box background="muted" radius="xl" paddingX={4} paddingY={3}>
              <EditorContent value={mensaje} schema={messageSchema} />
            </Box>
          </Columna>
        </Grid>
      </BlockStack>

      <BlockStack gap={3}>
        <BlockStack gap={1}>
          <Text size="sm" weight="semibold">
            Documento
          </Text>
          <Text size="sm" tone="muted">
            Selecciona texto para darle formato, pulsa / en una línea vacía para insertar un bloque
            y Alt+F10 para llegar a la barra con el teclado.
          </Text>
        </BlockStack>
        <Grid columns={1} lgColumns={2} gap={4}>
          <Columna titulo="Se escribe">
            <Editor
              schema={documentSchema}
              value={pagina}
              onChange={setPagina}
              searchLinks={buscarPaginas}
              onUploadImage={subirImagen}
              aria-label="Página de admisiones"
            />
          </Columna>
          <Columna titulo="Se lee">
            <Box
              background="card"
              border
              radius="xl"
              paddingX={4}
              paddingY={6}
              className="sm:px-12 sm:py-10"
            >
              <EditorContent value={pagina} schema={documentSchema} />
            </Box>
          </Columna>
        </Grid>
      </BlockStack>
    </BlockStack>
  );
};

export default EditorDemo;
