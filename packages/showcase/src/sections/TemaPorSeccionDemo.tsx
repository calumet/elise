import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@calumet/elise-ui/alert-dialog";
import { Button } from "@calumet/elise-ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@calumet/elise-ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@calumet/elise-ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@calumet/elise-ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@calumet/elise-ui/menubar";
import { Popover, PopoverContent, PopoverTrigger } from "@calumet/elise-ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@calumet/elise-ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@calumet/elise-ui/sheet";
import { Text } from "@calumet/elise-ui/text";
import { ThemeScope } from "@calumet/elise-ui/theme-scope";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@calumet/elise-ui/tooltip";

/* Un tema de sección de verdad: papel ocre en los dos temas, así que también
   redefine la tinta. Un tema que solo cambia el fondo se queda sin contraste en
   cuanto el otro tema invierte los grises. */
const TEMA = [
  "[--background:oklch(0.96_0.04_85)] [--card:oklch(0.96_0.04_85)] [--popover:oklch(0.96_0.04_85)]",
  "[--muted:oklch(0.93_0.05_85)]",
  "[--border:oklch(0.72_0.13_85)] [--border-strong:oklch(0.55_0.13_85)]",
  "[--foreground:oklch(0.28_0.05_85)] [--card-foreground:oklch(0.28_0.05_85)]",
  "[--popover-foreground:oklch(0.28_0.05_85)] [--muted-foreground:oklch(0.44_0.06_85)]",
].join(" ");

/**
 * Un tema aplicado a una sección, con un overlay de cada clase dentro. Los
 * paneles salen por portal a `body` y aun así se pintan con el tema.
 */
const TemaPorSeccionDemo = (): React.JSX.Element => (
  <ThemeScope className={`${TEMA} rounded-xl border border-border bg-card p-5`}>
    <Text size="sm" tone="muted" className="mb-3 block">
      Todo lo que se abra desde aquí sale con el papel ocre, aunque el portal lo monte en{" "}
      <code>body</code>.
    </Text>

    <div className="flex flex-wrap items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Dialog
          </Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Con el tema de la sección</DialogTitle>
            <DialogDescription>El panel sale ocre.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline">
            AlertDialog
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Con el tema de la sección</AlertDialogTitle>
            <AlertDialogDescription>El panel sale ocre.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Vale</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" variant="outline">
            Sheet
          </Button>
        </SheetTrigger>
        <SheetContent aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>Con el tema de la sección</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            Popover
          </Button>
        </PopoverTrigger>
        <PopoverContent className="text-sm">El panel sale ocre.</PopoverContent>
      </Popover>

      <Select>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="uno">Uno</SelectItem>
          <SelectItem value="dos">Dos</SelectItem>
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              Tooltip
            </Button>
          </TooltipTrigger>
          <TooltipContent>El panel sale ocre.</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            DropdownMenu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Una acción</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Con submenú</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Y su panel</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Menubar</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Una acción</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Button size="sm" variant="outline">
            ContextMenu (clic derecho)
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Una acción</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Con submenú</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Y su panel</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  </ThemeScope>
);

export default TemaPorSeccionDemo;
