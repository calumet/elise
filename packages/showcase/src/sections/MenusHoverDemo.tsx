import { Button } from "@calumet/elise-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@calumet/elise-ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@calumet/elise-ui/hover-card";

const MenusHoverDemo = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Dropdown Menu</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Opciones</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Nuevo archivo</DropdownMenuItem>
            <DropdownMenuItem>Duplicar</DropdownMenuItem>
            <DropdownMenuItem disabled>Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2">Hover Card</p>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline">Perfil</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="font-semibold">Equipo Elise</p>
            <p className="text-sm text-muted-foreground">Radix + Tailwind + tokens de diseño.</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};

export default MenusHoverDemo;
