import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Separator
} from '@elise/ui';

const AccordionCollapsibleDemo = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-mutedForeground">Accordion</h3>
        <Accordion type="single" collapsible className="w-full rounded-sm border border-border bg-surface">
          <AccordionItem value="item-1">
            <AccordionTrigger>¿Qué incluye Elise UI?</AccordionTrigger>
            <AccordionContent>
              Wrappers de Radix + Tailwind preset + tokens de diseño y utilidades.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>¿Puedo personalizarlo?</AccordionTrigger>
            <AccordionContent>Claro, ajusta tokens y preset según tu marca.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-mutedForeground">Collapsible</h3>
        <Collapsible open={open} onOpenChange={setOpen} className="rounded-sm border border-border bg-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Notas rápidas</p>
              <p className="text-xs text-mutedForeground">Expandible con texto auxiliar.</p>
            </div>
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="outline">
                {open ? 'Ocultar' : 'Mostrar'}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="pt-3 text-sm text-mutedForeground">
            <Separator className="mb-3" />
            Este bloque muestra cómo el Collapsible guarda el espacio y añade contenido dinámico.
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default AccordionCollapsibleDemo;
