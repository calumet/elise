import { Search } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";

/** El vacío de un listado filtrado: hay datos, pero no para esta búsqueda. */
export function SinResultados({
  cosas,
  busqueda,
  onQuitar,
}: {
  /** En plural y en minúscula: «pedidos», «productos». */
  cosas: string;
  busqueda: string;
  onQuitar: () => void;
}) {
  return (
    <EmptyState size="sm">
      <EmptyStateMedia>
        <Search className="size-icon-xl" aria-hidden />
      </EmptyStateMedia>
      <EmptyStateTitle>
        Sin {cosas} de «{busqueda}»
      </EmptyStateTitle>
      <EmptyStateDescription>
        Los {cosas} siguen ahí; lo que no encuentra nada es este filtro.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button size="sm" variant="outline" onClick={onQuitar}>
          Quitar el filtro
        </Button>
      </EmptyStateActions>
    </EmptyState>
  );
}
