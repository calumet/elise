import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@elise/ui';
import { useState } from 'react';

const radioItems = ['Andy', 'Benoit', 'Luis'];
const checkItems = ['Mostrar bookmarks', 'Mostrar URLs completas'];

const MenusSelectDemo = () => {
  const [checks, setChecks] = useState<string[]>([checkItems[1]]);
  const [radio, setRadio] = useState<string>(radioItems[2]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-2 rounded-sm">
        <p className="text-sm font-semibold text-foreground">Menubar con submenus</p>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Archivo</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Nuevo <span className="ml-auto text-xs text-mutedForeground">Ctrl+N</span>
              </MenubarItem>
              <MenubarItem>
                Guardar <span className="ml-auto text-xs text-mutedForeground">Ctrl+S</span>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Compartir</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Correo</MenubarItem>
                  <MenubarItem>Mensajes</MenubarItem>
                  <MenubarItem>Notas</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem>Imprimir</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Ver</MenubarTrigger>
            <MenubarContent>
              {checkItems.map((item) => (
                <MenubarCheckboxItem
                  key={item}
                  checked={checks.includes(item)}
                  onCheckedChange={() =>
                    setChecks((current) =>
                      current.includes(item) ? current.filter((i) => i !== item) : current.concat(item)
                    )
                  }
                >
                  {item}
                </MenubarCheckboxItem>
              ))}
              <MenubarSeparator />
              <MenubarItem>Recargar</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Perfiles</MenubarTrigger>
              <MenubarContent>
                <MenubarRadioGroup value={radio} onValueChange={setRadio}>
                  {radioItems.map((item) => (
                    <MenubarRadioItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </MenubarRadioItem>
                  ))}
                </MenubarRadioGroup>
              <MenubarSeparator />
              <MenubarItem>Agregar perfil</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <div className="space-y-2 rounded-sm">
        <p className="text-sm font-semibold text-foreground">Select</p>
        <Select defaultValue="op1">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una opcion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="op1">Opcion 1</SelectItem>
            <SelectItem value="op2">Opcion 2</SelectItem>
            <SelectItem value="op3">Opcion 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 rounded-sm lg:col-span-2">
        <p className="text-sm font-semibold text-foreground">Context Menu</p>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="w-full h-24 border border-dashed border-border flex items-center justify-center">
              <p className="text-sm text-mutedForeground">Clic derecho aqui</p>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Accion rapida</ContextMenuItem>
            <ContextMenuItem>Duplicar</ContextMenuItem>
            <ContextMenuItem>Eliminar</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
};

export default MenusSelectDemo;
