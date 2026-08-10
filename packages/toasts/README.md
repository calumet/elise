# @calumet/elise-toasts

Toasts que se disparan desde cualquier parte del código, sin pasar props ni envolver el árbol en un provider. `Toaster` escucha un bus de eventos y `toast()` publica en él.

## Instalación

```bash
pnpm add jsr:@calumet/elise-toasts    # JSR
pnpm add @calumet/elise-toasts        # GitHub Packages
```

Requiere React 19 y `@calumet/elise-ui`. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

## Uso

`Toaster` se monta una vez, en la raíz de la app:

```tsx
import { Toaster } from "@calumet/elise-toasts";

<Toaster position="bottom-right" />;
```

Desde ahí, cualquier módulo puede lanzar uno. `toast()` devuelve el id, que sirve para cerrarlo antes de tiempo con `dismiss(id)`. Sin argumento, `dismiss()` cierra el más viejo de la cola.

```ts
import { toast } from "@calumet/elise-toasts";

toast({
  variant: "success",
  title: "Guardado",
  description: "Los cambios ya están publicados.",
  actionLabel: "Deshacer",
  action: () => revertir(),
});
```

Las variantes son `info`, `success`, `alert` y `error`. `duration` cambia los milisegundos en pantalla.

`onToast` y `onDismiss` suscriben al bus y devuelven la función para desuscribirse, por si necesitás reaccionar a los toasts en otro lado.
