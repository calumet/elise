import { Button } from "@calumet/elise-ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@calumet/elise-ui/command";
import { useState } from "react";

const CommandDemo = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Palette ligera para acciones rápidas.</p>
      <Button onClick={() => setOpen(true)}>Abrir palette</Button>

      <Command shouldFilter={false} className="max-w-120 overflow-visible bg-transparent">
        <CommandInput
          variant="field"
          size="xl"
          value={query}
          onValueChange={setQuery}
          placeholder="Buscar en el portal…"
          end={<Button size="sm">Buscar</Button>}
        />
      </Command>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Acciones rápidas"
        description="Buscar o ejecutar comandos."
      >
        <Command>
          <CommandInput placeholder="Buscar comando..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>

            <CommandGroup heading="Acciones">
              <CommandItem onSelect={() => setOpen(false)}>
                Crear proyecto
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                Abrir documentación
                <CommandShortcut>⌘D</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navegación">
              <CommandItem onSelect={() => setOpen(false)}>Ir a dashboard</CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>Ir a reportes</CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>Ir a settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};

export default CommandDemo;
