import { ScrollArea } from "@calumet/elise-ui/scroll-area";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@calumet/elise-ui/toolbar";

const items = Array.from({ length: 20 }).map((_, i) => `Elemento ${i + 1}`);

const ScrollToolbarDemo = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Scroll Area</p>
        <ScrollArea className="h-40 rounded-sm border border-border">
          <div className="p-3 space-y-2">
            {items.map((item) => (
              <div key={item} className="rounded-sm bg-muted px-3 py-2 text-base">
                {item}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Toolbar</p>
        <Toolbar>
          <ToolbarButton>Negrita</ToolbarButton>
          <ToolbarButton>Cursiva</ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton>Subrayar</ToolbarButton>
        </Toolbar>
      </div>
    </div>
  );
};

export default ScrollToolbarDemo;
