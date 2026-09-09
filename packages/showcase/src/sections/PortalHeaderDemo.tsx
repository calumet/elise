import { DropdownMenuItem, DropdownMenuSeparator } from "@calumet/elise-ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuToggle,
  NavigationMenuTrigger,
} from "@calumet/elise-ui/navigation-menu";
import { Text } from "@calumet/elise-ui/text";
import { UserMenu } from "@calumet/elise-ui/user-menu";

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
    /* Dos columnas, para que el rótulo caiga a media lista. */
    nombre: "Pregrado",
    columnas: [
      { entradas: ["Ingeniería Biomédica", "Ingeniería de Sistemas", "Planes de estudio"] },
      {
        titulo: "Reglamentos de pregrado",
        entradas: ["Reglamento Académico Estudiantil", "Reglamento de Trabajos de Grado"],
      },
    ],
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
  {
    nombre: "Calidad",
    columnas: [{ entradas: ["Proceso de Autoevaluación ABET", "Acreditación"] }],
  },
  { nombre: "Comunicación", columnas: [{ entradas: ["Noticias", "Eventos", "Contacto"] }] },
];

/**
 * El header del portal de escuelas: nueve secciones, unas con megamenú y otras
 * con un menú corriente, y la marca y la cuenta en la misma línea. Es el caso
 * que obliga a la fila a agrupar, y el que necesita el `UserMenu` sin montar un
 * `AppShell` y sobre una franja clara.
 */
const PortalHeaderDemo = (): React.JSX.Element => (
  <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
    <NavigationMenu>
      <div className="flex flex-wrap items-center gap-3 px-6 py-3">
        <Text weight="bold" size="lg" className="shrink-0">
          EISI
        </Text>
        <NavigationMenuList>
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
                        <NavigationMenuLabel>{columna.titulo}</NavigationMenuLabel>
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
        <UserMenu name="Juan Lipez" detail="Estudiante de pregrado">
          <DropdownMenuItem>Mi perfil</DropdownMenuItem>
          <DropdownMenuItem>Mis trámites</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
        </UserMenu>
        <NavigationMenuToggle className="-me-2" />
      </div>
    </NavigationMenu>
    <div className="h-[30rem] bg-background" />
  </div>
);

export default PortalHeaderDemo;
