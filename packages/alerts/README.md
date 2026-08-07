# @calumet/elise-alerts

Alertas modales con el mismo bus de eventos que los toasts, para pedir una confirmación desde código que no está en el árbol de React.

## Instalación

```bash
pnpm add jsr:@calumet/elise-alerts    # JSR
pnpm add @calumet/elise-alerts        # GitHub Packages
```

Requiere React 19 y `@calumet/elise-ui`. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

## Uso

`AlertHost` se monta una vez, en la raíz de la app:

```tsx
import { AlertHost } from "@calumet/elise-alerts";

<AlertHost />;
```

Después, `openAlert` abre el modal y devuelve su id:

```ts
import { openAlert } from "@calumet/elise-alerts";

openAlert({
  variant: "confirm",
  title: "Eliminar el proyecto",
  description: "Esta acción no se puede deshacer.",
  confirmLabel: "Eliminar",
  onConfirm: () => borrar(id),
});
```

Las variantes son `confirm`, `info`, `success`, `alert` y `error`. `closeAlert(id)` cierra esa alerta y `closeAlert()` cierra la primera de la cola.

`onAlert` y `onCloseAlert` suscriben al bus y devuelven la función para desuscribirse.
