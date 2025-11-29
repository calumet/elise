import { Button } from '@elise/ui';
import { toast } from '@elise/utils/toasts';

const ToastDemo = () => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={() =>
          toast({
            title: 'Guardado',
            description: 'Cambios sincronizados.'
          })
        }
      >
        Mostrar toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: 'Error',
            description: 'Algo salió mal, intenta de nuevo.',
            duration: 6000
          })
        }
      >
        Mostrar error
      </Button>
    </div>
  );
};

export default ToastDemo;
