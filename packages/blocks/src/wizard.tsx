import { Button } from "@calumet/elise-ui/button";
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperTitle,
  type StepStatus,
} from "@calumet/elise-ui/stepper";
import * as React from "react";

import { useElLabel } from "./i18n";
import { Page, type PageProps } from "./page";

export type WizardStep = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;

  /** Lo que se ve cuando este es el paso puesto. */
  content?: React.ReactNode;

  /**
   * Fuerza el estado del paso en el indicador. Sin esto se deduce de dónde
   * está el paso puesto, que es lo correcto en un flujo que va en orden; un
   * flujo que salta pasos o los deja a medias lo dice acá.
   */
  status?: StepStatus;
};

export type WizardProps = Omit<PageProps, "children" | "onChange"> & {
  steps: WizardStep[];

  /** El paso puesto, por `id`. Con esto el asistente queda controlado. */
  step?: string;

  /** El paso con el que arranca cuando no está controlado. */
  defaultStep?: string;

  onStepChange?: (id: string) => void;

  /** Se llama al pulsar el último botón, el del último paso. */
  onFinish?: () => void;

  /**
   * Que se pueda avanzar. Con esto en `false` el botón de seguir queda
   * apagado, que es como un asistente dice «este paso todavía no está».
   */
  canContinue?: boolean;

  /** Hay algo en curso: los dos botones esperan y el de seguir lo muestra. */
  busy?: boolean;

  backLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  finishLabel?: React.ReactNode;

  /** Lo que va entre los botones, del tipo «guardar y salir». */
  footer?: React.ReactNode;
};

/**
 * Asistente por pasos: el indicador arriba, el paso puesto en medio y la
 * navegación al pie.
 *
 * Solo monta el paso puesto. Los datos del formulario viven en quien lo usa, no
 * acá, así que mantener los otros montados solo serviría para que el asistente
 * se quedara con estado que no es suyo.
 */
function Wizard({
  steps,
  step,
  defaultStep,
  onStepChange,
  onFinish,
  canContinue = true,
  busy = false,
  backLabel,
  nextLabel,
  finishLabel,
  footer,
  ...page
}: WizardProps) {
  const atras = useElLabel("blocks", "wizardBack", "Atrás");
  const siguiente = useElLabel("blocks", "wizardNext", "Siguiente");
  const finalizar = useElLabel("blocks", "wizardFinish", "Finalizar");

  const [interno, setInterno] = React.useState(defaultStep ?? steps[0]?.id);
  const controlado = step !== undefined;
  const puesto = controlado ? step : interno;

  const indice = Math.max(
    0,
    steps.findIndex((s) => s.id === puesto),
  );
  const primero = indice === 0;
  const ultimo = indice === steps.length - 1;

  const ir = (destino: string) => {
    if (!controlado) setInterno(destino);
    onStepChange?.(destino);
  };

  return (
    <Page {...page}>
      <Stepper>
        {steps.map((paso, n) => (
          <StepperItem
            key={paso.id}
            last={n === steps.length - 1}
            indicator={n + 1}
            status={
              paso.status ?? (n < indice ? "complete" : n === indice ? "current" : "upcoming")
            }
          >
            <StepperTitle>{paso.title}</StepperTitle>
            {paso.description ? <StepperDescription>{paso.description}</StepperDescription> : null}
          </StepperItem>
        ))}
      </Stepper>

      <div data-slot="wizard-step">{steps[indice]?.content}</div>

      <div
        data-slot="wizard-footer"
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-4"
      >
        <Button
          variant="outline"
          disabled={primero || busy}
          onClick={() => ir(steps[indice - 1]!.id)}
        >
          {backLabel ?? atras}
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {footer}
          <Button
            disabled={!canContinue}
            loading={busy}
            onClick={() => (ultimo ? onFinish?.() : ir(steps[indice + 1]!.id))}
          >
            {ultimo ? (finishLabel ?? finalizar) : (nextLabel ?? siguiente)}
          </Button>
        </div>
      </div>
    </Page>
  );
}

export { Wizard };
