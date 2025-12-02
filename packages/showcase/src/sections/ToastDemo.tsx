import { Button } from '@elise/ui/button';
import { toast } from '@elise/utils/toasts';

const ToastDemo = () => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={() =>
          toast({
            title: 'Guardado',
            description: 'Cambios sincronizados.',
            variant: 'info'
          })
        }
      >
        Toast info
      </Button>

      <Button
        tone="warning"
        onClick={() =>
          toast({
            title: 'Advertencia',
            description: 'Revisa los campos antes de continuar.',
            variant: 'alert'
          })
        }
      >
        Toast alerta
      </Button>

      <Button
        tone="danger"
        onClick={() =>
          toast({
            title: 'Error',
            description: 'Algo salió mal, intenta de nuevo.',
            duration: 6000,
            variant: 'error'
          })
        }
      >
        Toast error
      </Button>

      <Button
        tone="success"
        onClick={() =>
          toast({
            title: 'Éxito',
            description: 'La operación finalizó correctamente.',
            variant: 'success'
          })
        }
      >
        Toast éxito
      </Button>
    </div>
  );
};

export default ToastDemo;
