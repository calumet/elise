import { Checkbox } from "@calumet/elise-ui/checkbox";
import { Label } from "@calumet/elise-ui/label";
import { OTPField } from "@calumet/elise-ui/otp-field";
import { RadioGroup, RadioGroupItem } from "@calumet/elise-ui/radio-group";
import { Slider } from "@calumet/elise-ui/slider";
import { Switch } from "@calumet/elise-ui/switch";
import { useState } from "react";

const TEMAS = ["Claro", "Oscuro"];

const FormControlsDemo = () => {
  const [marcadas, setMarcadas] = useState<string[]>(["Claro"]);
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState<number[]>([40]);
  const [range, setRange] = useState<number[]>([20, 80]);
  const [otp, setOtp] = useState("");
  const [otpDone, setOtpDone] = useState("");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3 rounded-sm border border-border bg-card p-4">
        {/* El rótulo, la ayuda y el error son del grupo: la pregunta se hace
            una vez y las opciones son las respuestas. Cada una puede llevar su
            propia ayuda para lo que cambia de una a otra. */}
        <RadioGroup
          label="Forma de envío"
          defaultValue="opt1"
          description="El costo se calcula al confirmar el pedido."
        >
          <RadioGroupItem value="opt1" label="Estándar" description="Llega en tres días." />
          <RadioGroupItem value="opt2" label="Exprés" description="Llega mañana." />
          <RadioGroupItem value="opt3" label="Recoger en tienda" disabled />
        </RadioGroup>

        <RadioGroup label="Facturación" error="Elige a nombre de quién va la factura." required>
          <RadioGroupItem value="yo" label="A mi nombre" />
          <RadioGroupItem value="empresa" label="A nombre de una empresa" invalid />
        </RadioGroup>
      </div>

      <div className="space-y-3 rounded-sm border border-border bg-card p-4">
        <Label className="text-sm font-semibold">Casilla de tres estados</Label>
        <Checkbox
          id="todas"
          label="Todas"
          checked={
            marcadas.length === TEMAS.length
              ? true
              : marcadas.length === 0
                ? false
                : "indeterminate"
          }
          onCheckedChange={(v) => setMarcadas(v === true ? [...TEMAS] : [])}
        />
        <div className="space-y-2 ps-7">
          {TEMAS.map((t) => (
            <Checkbox
              key={t}
              id={t}
              label={t}
              checked={marcadas.includes(t)}
              onCheckedChange={(v) =>
                setMarcadas((prev) => (v === true ? [...prev, t] : prev.filter((x) => x !== t)))
              }
            />
          ))}
        </div>
        <Checkbox
          label="Recibir novedades"
          description="Un correo al mes, nada más."
          error="Hay que aceptar antes de continuar."
          required
        />
      </div>

      <div className="space-y-4 rounded-sm border border-border bg-card p-4">
        <Switch
          id="switch-demo"
          label="Notificaciones push"
          description="Se avisa en el navegador cuando entra un pedido."
          checked={enabled}
          onCheckedChange={setEnabled}
        />
        <Switch
          label="Guardar borradores"
          defaultChecked
          name="autoguardado"
          value="si"
          required
          error="Hay que dejarlo encendido para poder salir sin perder cambios."
        />
        <Switch label="Analítica de uso" disabled description="Lo decide el plan." />
        <div className="space-y-2">
          <Label htmlFor="slider-demo" className="text-base">
            Slider
          </Label>
          <Slider id="slider-demo" value={volume} onValueChange={setVolume} max={100} step={5} />
          <p className="text-sm text-muted-foreground">Valor: {volume[0]}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="range-demo" className="text-base">
            Slider de rango
          </Label>
          <Slider
            id="range-demo"
            data-testid="range-slider"
            value={range}
            onValueChange={setRange}
            max={100}
            step={5}
          />
          <p className="text-sm text-muted-foreground">Rango: {range.join(" – ")}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-sm border border-border bg-card p-4 sm:col-span-2">
        <Label className="text-sm font-semibold">Código OTP</Label>
        <OTPField length={6} value={otp} onChange={setOtp} onComplete={setOtpDone} />
        <p className="text-sm text-muted-foreground" data-testid="otp-readout">
          Valor: <code>{JSON.stringify(otp)}</code>
          {otpDone ? (
            <>
              {" "}
              · onComplete: <code>{JSON.stringify(otpDone)}</code>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
};

export default FormControlsDemo;
