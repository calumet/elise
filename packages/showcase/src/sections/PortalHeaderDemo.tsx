import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@calumet/elise-ui/navigation-menu";

const SECCIONES = [
  "Nuestra Escuela",
  "Nuestra Gente",
  "Pregrado",
  "Posgrados",
  "Trabajos de Grado",
  "Investigación",
  "Extensión",
  "Calidad",
  "Comunicación",
];

const PortalHeaderDemo = (): React.JSX.Element => (
  <div className="w-full rounded-xl border border-border">
    <div className="border-b border-border bg-card px-6 py-4">
      <span className="text-lg font-bold">EISI</span>
    </div>
    <div className="bg-card px-6">
      <NavigationMenu className="justify-start">
        <NavigationMenuList>
          {SECCIONES.map((s) => (
            <NavigationMenuItem key={s}>
              <NavigationMenuTrigger>{s}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#portal">Una entrada</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </div>
);

export default PortalHeaderDemo;
