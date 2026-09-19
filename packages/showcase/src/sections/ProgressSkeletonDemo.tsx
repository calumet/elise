import { Button } from "@calumet/elise-ui/button";
import { Progress } from "@calumet/elise-ui/progress";
import { Skeleton } from "@calumet/elise-ui/skeleton";
import { useEffect, useState } from "react";

const ProgressSkeletonDemo = () => {
  const [value, setValue] = useState(15);
  const [running, setRunning] = useState(false);
  // Deja de cargar al llegar a 100, y con eso el efecto limpia su intervalo.
  const loading = running && value < 100;

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setValue((v) => Math.min(v + 20, 100)), 500);
    return () => clearInterval(id);
  }, [loading]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <Progress value={value} className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setValue(0);
            setRunning(true);
          }}
        >
          Cargar
        </Button>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">
          Indeterminada, para cuando no se sabe cuánto falta
        </p>
        <Progress value={null} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Estado listo.</p>
            <p className="text-sm text-muted-foreground">Valores cargados.</p>
            <p className="text-sm text-muted-foreground">UI estable.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressSkeletonDemo;
