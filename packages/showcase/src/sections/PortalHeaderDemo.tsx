import { DropdownMenuItem, DropdownMenuSeparator } from "@calumet/elise-ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuGroup,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuToggle,
  NavigationMenuTrigger,
} from "@calumet/elise-ui/navigation-menu";
import { Text } from "@calumet/elise-ui/text";
import { UserMenu } from "@calumet/elise-ui/user-menu";

type Entrada = string | { rotulo: string; detalle: string };

type Seccion = {
  nombre: string;
  columnas: { titulo?: string; entradas: Entrada[] }[];
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
    /* Con detalle, que es lo que pide un cajón de móvil con sitio de sobra. */
    nombre: "Nuestra Gente",
    columnas: [
      {
        entradas: [
          { rotulo: "Profesores", detalle: "Planta docente y áreas de trabajo" },
          { rotulo: "Administrativos", detalle: "Quién resuelve cada trámite" },
          { rotulo: "Egresados", detalle: "Red de egresados y bolsa de empleo" },
        ],
      },
    ],
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
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Text weight="bold" size="lg" className="shrink-0">
          EISI
        </Text>
        <NavigationMenuList>
          {SECCIONES.map((seccion) => (
            <NavigationMenuItem key={seccion.nombre}>
              <NavigationMenuTrigger>{seccion.nombre}</NavigationMenuTrigger>
              <NavigationMenuContent align={seccion.ancha ? "full" : "start"}>
                {seccion.columnas.map((columna, i) => (
                  <NavigationMenuGroup key={columna.titulo ?? i} label={columna.titulo}>
                    {columna.entradas.map((entrada) => {
                      const suelta = typeof entrada === "string";
                      return (
                        <NavigationMenuLink
                          key={suelta ? entrada : entrada.rotulo}
                          href="#portal"
                          description={suelta ? undefined : entrada.detalle}
                        >
                          {suelta ? entrada : entrada.rotulo}
                        </NavigationMenuLink>
                      );
                    })}
                  </NavigationMenuGroup>
                ))}
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
        <NavigationMenuToggle />
      </div>
    </NavigationMenu>
    <div className="h-[30rem] bg-background" />
  </div>
);

export default PortalHeaderDemo;
