# Changelog

Cambios que afectan a quien consume los paquetes. Empieza en la 0.3.0 de
`@calumet/elise-ui`; lo anterior está solo en el historial de git.

## `@calumet/elise-ui` 0.3.0

`Accordion`, `Checkbox`, `RadioGroup`, `Switch`, `Toggle`, `ToggleGroup`,
`Progress` y `Separator` pasan de una implementación propia al primitive de
Radix que la documentación ya les atribuía.

### Rompe

- **`Checkbox` y `Switch` dejan de ser un `input`.** Son un `button` con
  `role="checkbox"` o `role="switch"`. `checked`, `defaultChecked`,
  `onCheckedChange`, `name`, `value`, `disabled` y `required` siguen igual, y
  con `name` se emite un input oculto para que un formulario nativo los envíe.
  `onChange` ya no llega.
- **Un rótulo envolvente deja de activarlos.** `<label><Checkbox />Texto</label>`
  funcionaba porque el input estaba dentro. Con un `button` hay que enlazarlo,
  con `<Checkbox id="x" />` junto a `<Label htmlFor="x">`.
- **`RadioGroupItem` ya no acepta props de `input`.** Recibe `value`,
  `disabled`, `required` e `id`.

### Agrega

- `Accordion` respeta `collapsible`, que antes se aceptaba sin efecto.
- `Checkbox` acepta `checked="indeterminate"`.
- `RadioGroup`, `ToggleGroup`, `Switch` y `Toggle` aceptan modo controlado.
- `ToggleGroup` y `RadioGroup` son una sola parada de tabulación, y las flechas
  recorren las opciones.
- `Progress` acepta `value={null}` para una espera de duración desconocida.
- Los ocho aceptan `asChild` y publican su `data-state`.
- `data-slot` en los 109 sub-componentes que no lo tenían, de modo que
  `has-data-[slot=…]` sirve en todo el catálogo.
