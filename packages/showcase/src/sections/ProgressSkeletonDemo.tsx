import { useEffect, useState } from 'react';
import { Button, Progress, Skeleton } from '@elise/ui';

const ProgressSkeletonDemo = () => {
  const [value, setValue] = useState(15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setValue((v) => {
        const next = v + 20;
        if (next >= 100) {
          clearInterval(id);
          setLoading(false);
          return 100;
        }
        return next;
      });
    }, 500);
    return () => clearInterval(id);
  }, [loading]);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-3">
        <Progress value={value} className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setValue(0);
            setLoading(true);
          }}
        >
          Cargar
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {loading ? (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </>
        ) : (
          <>
            <p className="text-sm text-mutedForeground">Estado listo.</p>
            <p className="text-sm text-mutedForeground">Valores cargados.</p>
            <p className="text-sm text-mutedForeground">UI estable.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressSkeletonDemo;
