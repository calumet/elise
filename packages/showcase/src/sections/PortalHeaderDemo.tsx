import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuToggle,
  NavigationMenuTrigger,
} from "@calumet/elise-ui/navigation-menu";
import { Text } from "@calumet/elise-ui/text";

type Seccion = {
  nombre: string;
  columnas: { titulo?: string; entradas: string[] }[];
  ancha?: boolean;
};

const SECCIONES: Seccion[] = [
  {
    nombre: "Nuestra Escuela",
    ancha: true,
    columnas: [
      { titulo: "La escuela", entradas: ["Reseña histórica", "Misión y visión", "Organigrama"] },
      { titulo: "Programas", entradas: ["Ingeniería de Sistemas", "Maestría", "Doctorado"] },
      { titulo: "Trámites", entradas: ["Certificados", "Homologaciones", "Calendario"] },
    ],
  },
  {
    nombre: "Nuestra Gente",
    columnas: [{ entradas: ["Profesores", "Administrativos", "Egresados"] }],
  },
  {
    nombre: "Pregrado",
    columnas: [{ entradas: ["Plan de estudios", "Inscripciones", "Movilidad"] }],
  },
  { nombre: "Posgrados", columnas: [{ entradas: ["Maestría", "Doctorado", "Especializaciones"] }] },
  {
    nombre: "Trabajos de Grado",
    ancha: true,
    columnas: [
      { titulo: "Para estudiantes", entradas: ["Cómo inscribir", "Formatos", "Plazos"] },
      { titulo: "Para directores", entradas: ["Dirigir un trabajo", "Evaluar", "Actas"] },
    ],
  },
  { nombre: "Investigación", columnas: [{ entradas: ["Grupos", "Semilleros", "Publicaciones"] }] },
  { nombre: "Extensión", columnas: [{ entradas: ["Educación continua", "Convenios"] }] },
  { nombre: "Calidad", columnas: [{ entradas: ["Acreditación", "Autoevaluación"] }] },
  { nombre: "Comunicación", columnas: [{ entradas: ["Noticias", "Eventos", "Contacto"] }] },
];

/**
 * El header del portal de escuelas: nueve secciones, unas con megamenú y otras
 * con un menú corriente. Es el caso que obliga a la fila a agrupar.
 */
const PortalHeaderDemo = (): React.JSX.Element => (
  <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
    <NavigationMenu>
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <Text weight="bold" size="lg">
          EISI
        </Text>
        <NavigationMenuToggle />
      </div>
      <NavigationMenuList className="px-6">
        {SECCIONES.map((seccion) => (
          <NavigationMenuItem key={seccion.nombre}>
            <NavigationMenuTrigger>{seccion.nombre}</NavigationMenuTrigger>
            <NavigationMenuContent align={seccion.ancha ? "full" : "start"}>
              <div
                className={
                  seccion.ancha ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
                }
              >
                {seccion.columnas.map((columna, i) => (
                  <div key={columna.titulo ?? i} className="flex min-w-0 flex-col gap-1">
                    {columna.titulo ? (
                      <Text size="sm" weight="semibold" tone="muted" className="px-2.5 max-md:px-0">
                        {columna.titulo}
                      </Text>
                    ) : null}
                    {columna.entradas.map((entrada) => (
                      <NavigationMenuLink key={entrada} href="#portal">
                        {entrada}
                      </NavigationMenuLink>
                    ))}
                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
    <div className="h-[30rem] bg-background" />
  </div>
);

export default PortalHeaderDemo;
