import { Button } from "@calumet/elise-ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@calumet/elise-ui/tooltip";

const HelloWorld = () => (
  <div className="flex flex-col items-center gap-4 text-center">
    <p className="text-xl font-semibold">Hola, Elise UI 👋</p>
    <p className="text-base text-muted-foreground max-w-sm">
      Radix + Tailwind con tokens de color y tipografía listos para usar.
    </p>
    <div className="flex items-center gap-3">
      <Button>Acción primaria</Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover</Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip con Radix</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
);

export default HelloWorld;
