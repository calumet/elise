import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/lib/cn";

export type ScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>;

/* Las mismas medidas y los mismos tokens que la barra del navegador, que Elise
   ya estiliza en `elise.css`: carril de 10px, pulgar de 6 con 2px de aire a cada
   lado, `border-strong` en reposo y `muted-foreground` al apuntarlo. Antes el
   pulgar iba con `foreground` a un 20% de opacidad, y aunque la luminosidad
   quedaba parecida, no era el mismo color ni reaccionaba igual: en la misma
   pantalla se veían dos barras distintas y la de dentro parecía de otro sitio. */
const CARRIL =
  "flex touch-none select-none bg-transparent p-0.5 transition-colors data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-full";
const PULGAR =
  "relative flex-1 rounded-full bg-border-strong transition-colors duration-(--duration-fast) ease-out hover:bg-muted-foreground";

export const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    data-slot="scroll-area"
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] [&>div]:block!">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar className={CARRIL} orientation="vertical">
      <ScrollAreaPrimitive.Thumb className={PULGAR} />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Scrollbar className={CARRIL} orientation="horizontal">
      <ScrollAreaPrimitive.Thumb className={PULGAR} />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner className="bg-transparent" />
  </ScrollAreaPrimitive.Root>
));

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
